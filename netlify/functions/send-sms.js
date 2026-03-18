// netlify/functions/send-sms.js
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { RateLimiterMemory } from "rate-limiter-flexible";

// Configuración del cliente SNS
const snsClient = new SNSClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// RATE LIMITING: Por IP (anti-spam individual)
const rateLimiterByIP = new RateLimiterMemory({
  points: 3, // 3 requests permitidos
  duration: 3600, // Por hora (en segundos)
  blockDuration: 3600, // Bloquear 1 hora si excede
});

// RATE LIMITING: Global (control de costos)
const rateLimiterGlobal = new RateLimiterMemory({
  points: 50, // 50 SMS por hora máximo
  duration: 3600,
});

// Validación de entrada
const validateInput = (data) => {
  const { name, phone, zipCode, message, urgent } = data;

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

  return { valid: true };
};

// Sanitización (prevenir inyección)
const sanitize = (str) => {
  return str
    .replace(/[<>]/g, "") // Eliminar HTML tags
    .trim()
    .substring(0, 500); // Limitar longitud
};

// Handler principal
export const handler = async (event) => {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // Manejar preflight request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  // Solo permitir POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    // Obtener IP del cliente
    const clientIP =
      event.headers["x-forwarded-for"]?.split(",")[0] ||
      event.headers["client-ip"] ||
      "unknown";

    // RATE LIMITING - Por IP
    try {
      await rateLimiterByIP.consume(clientIP);
    } catch (rateLimitError) {
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

    // RATE LIMITING - Global
    try {
      await rateLimiterGlobal.consume("global");
    } catch (globalLimitError) {
      console.error("Global rate limit exceeded");
      return {
        statusCode: 503,
        headers,
        body: JSON.stringify({
          error: "Service temporarily unavailable. Please try again later.",
        }),
      };
    }

    // Parsear body
    const data = JSON.parse(event.body);

    // Validar entrada
    const validation = validateInput(data);
    if (!validation.valid) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: validation.error }),
      };
    }

    // Sanitizar datos
    const name = sanitize(data.name);
    const phone = sanitize(data.phone);
    const zipCode = sanitize(data.zipCode);
    const message = sanitize(data.message);
    const urgent = data.urgent;

    // Construir mensaje SMS con formato limpio
    const urgentIndicator = urgent ? "🚨 URGENT REQUEST 🚨\n\n" : "";
    const smsMessage = `${urgentIndicator}NEW CONTACT FROM WEBSITE

Name: ${name}
Phone: ${phone}
Zip Code: ${zipCode}

Message:
${message}

---
Submitted: ${new Date().toLocaleString("en-US", { timeZone: "America/Denver" })} MT`;

    // Configurar parámetros de SNS
    const params = {
      Message: smsMessage,
      PhoneNumber: process.env.BUSINESS_PHONE_NUMBER,
      MessageAttributes: {
        "AWS.SNS.SMS.SMSType": {
          DataType: "String",
          StringValue: "Transactional", // Importante: mayor prioridad de entrega
        },
      },
    };

    // Si usas Toll-Free (cuando salgas de Sandbox), descomenta esto:
    // if (process.env.TOLL_FREE_NUMBER) {
    //   params.MessageAttributes["AWS.MM.SMS.OriginationNumber"] = {
    //     DataType: "String",
    //     StringValue: process.env.TOLL_FREE_NUMBER,
    //   };
    // }

    // Enviar SMS
    const command = new PublishCommand(params);
    const response = await snsClient.send(command);

    console.log("SMS sent successfully:", {
      messageId: response.MessageId,
      recipient: process.env.BUSINESS_PHONE_NUMBER,
      urgent: urgent,
      timestamp: new Date().toISOString(),
    });

    // Respuesta exitosa
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

    // Determinar tipo de error
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

    // No exponer detalles internos al cliente
    return {
      statusCode,
      headers,
      body: JSON.stringify({
        error: errorMessage,
      }),
    };
  }
};