const API_URL = import.meta.env.PROD
  ? '/.netlify/functions/send-sms'
  : 'http://localhost:8888/.netlify/functions/send-sms';

export interface ContactFormData {
  name: string;
  phone: string;
  zipCode: string;
  message: string;
  urgent: boolean;
}

export interface APIResponse {
  success: boolean;
  data?: {
    message: string;
    messageId: string;
  };
  error?: string;
}

export const sendContactSMS = async (formData: ContactFormData): Promise<APIResponse> => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error sending message');
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in sendContactSMS:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Connection error',
    };
  }
};