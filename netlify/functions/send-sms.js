import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { RateLimiterMemory } from "rate-limiter-flexible";

const TURNSTILE_TEST_SECRET_KEYS = {
  pass: "1x0000000000000000000000000000000AA",
  fail: "2x0000000000000000000000000000000AA",
};

const getEnvInt = (name, fallback) => {
  const value = Number.parseInt(process.env[name] || "", 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
};

const rateLimitIpPoints = getEnvInt("RATE_LIMIT_IP_POINTS", 3);
const rateLimitIpDurationSeconds = getEnvInt("RATE_LIMIT_IP_DURATION_SECONDS", 86400);
const rateLimitIpBlockSeconds = getEnvInt("RATE_LIMIT_IP_BLOCK_SECONDS", 86400);
const rateLimitGlobalPoints = getEnvInt("RATE_LIMIT_GLOBAL_POINTS", 25);
const rateLimitGlobalDurationSeconds = getEnvInt("RATE_LIMIT_GLOBAL_DURATION_SECONDS", 86400);
const rateLimitStore = process.env.RATE_LIMIT_STORE || "memory";
const isProduction = process.env.NODE_ENV === "production";
const smsDevLogOnly = process.env.SMS_DEV_LOG_ONLY === "true";
const smsDevLogPath = process.env.SMS_DEV_LOG_PATH || "logs/contact-messages.log";
const upstashRedisRestUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashRedisRestToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const tollFreeNumber = process.env.TOLL_FREE_NUMBER;

const snsClient = new SNSClient({
  region: process.env.MY_AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY,
  },
});

const memoryRateLimiterByIP = new RateLimiterMemory({
  points: rateLimitIpPoints,
  duration: rateLimitIpDurationSeconds,
  blockDuration: rateLimitIpBlockSeconds,
});

const memoryRateLimiterGlobal = new RateLimiterMemory({
  points: rateLimitGlobalPoints,
  duration: rateLimitGlobalDurationSeconds,
});

const createMemoryRateLimitHandlers = () => {
  return {
    backend: "memory",
    consumeIpLimit: async (clientIP) => {
      try {
        await memoryRateLimiterByIP.consume(clientIP);
        return { success: true };
      } catch {
        return {
          success: false,
          statusCode: 429,
          body: {
            error: "Too many requests. Please try again later.",
            retryAfter: rateLimitIpBlockSeconds,
          },
        };
      }
    },
    consumeGlobalLimit: async () => {
      try {
        await memoryRateLimiterGlobal.consume("global");
        return { success: true };
      } catch {
        return {
          success: false,
          statusCode: 503,
          body: {
            error: "Service temporarily unavailable. Please try again later.",
          },
        };
      }
    },
  };
};

const getRetryAfterFromReset = (reset, fallbackSeconds) => {
  if (typeof reset !== "number") {
    return fallbackSeconds;
  }

  return Math.max(1, Math.ceil((reset - Date.now()) / 1000));
};

const createRedisRateLimitHandlers = () => {
  if (!upstashRedisRestUrl || !upstashRedisRestToken) {
    if (isProduction) {
      throw new Error("RATE_LIMIT_STORE=redis requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN");
    }

    console.warn("Upstash Redis credentials are missing. Falling back to memory rate limit.");
    return createMemoryRateLimitHandlers();
  }

  const redis = new Redis({
    url: upstashRedisRestUrl,
    token: upstashRedisRestToken,
  });

  const ipRateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(rateLimitIpPoints, `${rateLimitIpDurationSeconds} s`),
    prefix: "contact-form:ip",
  });

  const globalRateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(rateLimitGlobalPoints, `${rateLimitGlobalDurationSeconds} s`),
    prefix: "contact-form:global",
  });

  return {
    backend: "redis",
    consumeIpLimit: async (clientIP) => {
      const result = await ipRateLimiter.limit(clientIP);

      if (result.success) {
        return { success: true };
      }

      return {
        success: false,
        statusCode: 429,
        body: {
          error: "Too many requests. Please try again later.",
          retryAfter: getRetryAfterFromReset(result.reset, rateLimitIpBlockSeconds),
        },
      };
    },
    consumeGlobalLimit: async () => {
      const result = await globalRateLimiter.limit("global");

      if (result.success) {
        return { success: true };
      }

      return {
        success: false,
        statusCode: 503,
        body: {
          error: "Service temporarily unavailable. Please try again later.",
          retryAfter: getRetryAfterFromReset(result.reset, rateLimitGlobalDurationSeconds),
        },
      };
    },
  };
};

const createRateLimitHandlers = () => {
  if (rateLimitStore === "memory") {
    return createMemoryRateLimitHandlers();
  }

  if (rateLimitStore === "redis") {
    return createRedisRateLimitHandlers();
  }

  throw new Error(`Unsupported RATE_LIMIT_STORE: ${rateLimitStore}`);
};

const rateLimitHandlers = createRateLimitHandlers();

const verifyTurnstileToken = async ({ token, ip }) => {
  const useTestKeys = process.env.TURNSTILE_USE_TEST_KEYS === "true";
  const testBehavior = process.env.TURNSTILE_TEST_BEHAVIOR || "pass";
  const fallbackTestSecret =
    TURNSTILE_TEST_SECRET_KEYS[testBehavior] || TURNSTILE_TEST_SECRET_KEYS.pass;
  const secret = useTestKeys
    ? fallbackTestSecret
    : process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    console.error("TURNSTILE_SECRET_KEY is not configured");
    return { valid: false, error: "Captcha configuration error." };
  }

  if (!token) {
    return { valid: false, error: "Captcha token is required." };
  }

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      secret,
      response: token,
      remoteip: ip,
    }),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    console.warn("Turnstile verification failed", {
      errors: result["error-codes"],
    });
    return { valid: false, error: "Captcha verification failed." };
  }

  return { valid: true };
};

const validateInput = (data) => {
  const { name, phone, zipCode, message, urgent, turnstileToken } = data;

  if (!name || name.trim().length < 1 || name.length > 100) {
    return { valid: false, error: "Invalid name" };
  }

  if (!phone || !/^[0-9+\s()-]{10,15}$/.test(phone)) {
    return { valid: false, error: "Invalid phone number" };
  }

  if (!zipCode || !/^[0-9-]{5,10}$/.test(zipCode)) {
    return { valid: false, error: "Invalid zip code" };
  }

  if (!message || message.trim().length < 10 || message.length > 500) {
    return { valid: false, error: "Message must be between 10 and 500 characters" };
  }

  if (typeof urgent !== "boolean") {
    return { valid: false, error: "Invalid urgent flag" };
  }

  if (!turnstileToken || typeof turnstileToken !== "string") {
    return { valid: false, error: "Captcha verification is required" };
  }

  return { valid: true };
};

const sanitize = (str) =>
  str
    .replace(/[<>]/g, "")
    .trim()
    .substring(0, 500);

const writeDevLogMessage = async ({ clientIP, message, name, phone, zipCode, urgent }) => {
  const resolvedPath = path.resolve(process.cwd(), smsDevLogPath);
  const logDir = path.dirname(resolvedPath);
  const timestamp = new Date().toISOString();
  const entry = [
    "=== CONTACT MESSAGE ===",
    `timestamp: ${timestamp}`,
    `client_ip: ${clientIP}`,
    `name: ${name}`,
    `phone: ${phone}`,
    `zip_code: ${zipCode}`,
    `urgent: ${urgent}`,
    "message:",
    message,
    "",
  ].join("\n");

  await mkdir(logDir, { recursive: true });
  await appendFile(resolvedPath, `${entry}\n`, "utf8");

  return {
    messageId: `dev-log-${Date.now()}`,
    logPath: resolvedPath,
  };
};

export const handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const clientIP =
      event.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      event.headers["client-ip"] ||
      "unknown";

    const ipLimitResult = await rateLimitHandlers.consumeIpLimit(clientIP);
    if (!ipLimitResult.success) {
      console.warn(`Rate limit exceeded for IP: ${clientIP}`);
      return {
        statusCode: ipLimitResult.statusCode,
        headers,
        body: JSON.stringify(ipLimitResult.body),
      };
    }

    const globalLimitResult = await rateLimitHandlers.consumeGlobalLimit();
    if (!globalLimitResult.success) {
      console.error("Global rate limit exceeded");
      return {
        statusCode: globalLimitResult.statusCode,
        headers,
        body: JSON.stringify(globalLimitResult.body),
      };
    }

    const data = JSON.parse(event.body);
    const validation = validateInput(data);

    if (!validation.valid) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: validation.error }),
      };
    }

    const captchaVerification = await verifyTurnstileToken({
      token: data.turnstileToken,
      ip: clientIP,
    });

    if (!captchaVerification.valid) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: captchaVerification.error }),
      };
    }

    const name = sanitize(data.name);
    const phone = sanitize(data.phone);
    const zipCode = sanitize(data.zipCode);
    const message = sanitize(data.message);
    const urgent = data.urgent;

    const urgentIndicator = urgent ? "URGENT REQUEST\n\n" : "";
    const smsMessage = `${urgentIndicator}Hands-Hands Cleaning & Restoration Services - New Contact Request

Name: ${name}
Phone: ${phone}
Zip Code: ${zipCode}

Message:
${message}

---
Submitted: ${new Date().toLocaleString("en-US", { timeZone: "America/Denver" })} MT`;

    const params = {
      Message: smsMessage,
      PhoneNumber: process.env.BUSINESS_PHONE_NUMBER,
      MessageAttributes: {
        "AWS.SNS.SMS.SMSType": {
          DataType: "String",
          StringValue: "Transactional",
        },
      },
    };

    if (tollFreeNumber) {
      params.MessageAttributes["AWS.MM.SMS.OriginationNumber"] = {
        DataType: "String",
        StringValue: tollFreeNumber,
      };
    }

    if (smsDevLogOnly && process.env.NODE_ENV !== "production") {
      const devLogResult = await writeDevLogMessage({
        clientIP,
        message: smsMessage,
        name,
        phone,
        zipCode,
        urgent,
      });

      console.log("SMS dev log saved:", {
        messageId: devLogResult.messageId,
        logPath: devLogResult.logPath,
        timestamp: new Date().toISOString(),
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: "Message saved to development log",
          messageId: devLogResult.messageId,
        }),
      };
    }

    const command = new PublishCommand(params);
    const response = await snsClient.send(command);

    console.log("SMS sent successfully:", {
      messageId: response.MessageId,
      recipient: process.env.BUSINESS_PHONE_NUMBER,
      originationNumber: tollFreeNumber || "default",
      urgent,
      timestamp: new Date().toISOString(),
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Message sent successfully",
        messageId: response.MessageId,
      }),
    };
  } catch (error) {
    console.error("Error sending SMS:", error);

    let statusCode = 500;
    let errorMessage = "Error sending message. Please try again.";

    if (error.name === "InvalidParameterException") {
      statusCode = 400;
      errorMessage = "Invalid phone number or configuration.";
    } else if (error.name === "ThrottlingException") {
      statusCode = 429;
      errorMessage = "Too many requests. Please try again later.";
    } else if (error.name === "ServiceUnavailable") {
      statusCode = 503;
      errorMessage = "SMS service temporarily unavailable.";
    }

    return {
      statusCode,
      headers,
      body: JSON.stringify({
        error: errorMessage,
      }),
    };
  }
};
