import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { RateLimiterMemory } from "rate-limiter-flexible";

const TURNSTILE_TEST_SECRET_KEYS = {
  pass: "1x0000000000000000000000000000000AA",
  fail: "2x0000000000000000000000000000000AA",
};

const snsClient = new SNSClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const rateLimiterByIP = new RateLimiterMemory({
  points: 3,
  duration: 3600,
  blockDuration: 3600,
});

const rateLimiterGlobal = new RateLimiterMemory({
  points: 50,
  duration: 3600,
});

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

    try {
      await rateLimiterByIP.consume(clientIP);
    } catch {
      console.warn(`Rate limit exceeded for IP: ${clientIP}`);
      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({
          error: "Too many requests. Please try again in 1 hour.",
          retryAfter: 3600,
        }),
      };
    }

    try {
      await rateLimiterGlobal.consume("global");
    } catch {
      console.error("Global rate limit exceeded");
      return {
        statusCode: 503,
        headers,
        body: JSON.stringify({
          error: "Service temporarily unavailable. Please try again later.",
        }),
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
    const smsMessage = `${urgentIndicator}New contact from Hands-Hands website

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

    const command = new PublishCommand(params);
    const response = await snsClient.send(command);

    console.log("SMS sent successfully:", {
      messageId: response.MessageId,
      recipient: process.env.BUSINESS_PHONE_NUMBER,
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
