# Hands-Hands

## 📋 Prerequisites

- Node.js 18+ installed
- AWS Account with SNS configured
- Netlify account
- IAM user with `sns:Publish` permissions

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

#### For Local Development:

Create a `.env` file in the root directory:

```env
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
BUSINESS_PHONE_NUMBER=+17202557466
ALLOWED_ORIGIN=http://localhost:8080
```

#### For Netlify Production:

Go to **Site settings** → **Environment variables** and add:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `BUSINESS_PHONE_NUMBER`
- `ALLOWED_ORIGIN` (your production domain)
- `TOLL_FREE_NUMBER` (optional, when available)

### 3. Verify Phone Number in AWS SNS Sandbox

**Important**: In Sandbox mode, you must verify the business phone number:

1. Go to AWS SNS Console
2. Navigate to **Text messaging (SMS)** → **Sandbox destination phone numbers**
3. Click **Add phone number**
4. Enter your business phone: `+17202557466`
5. Verify with the OTP code sent via SMS

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`  
Netlify Functions will run at `http://localhost:8888`

### 5. Test the Form

1. Fill out the contact form
2. Submit
3. Check if SMS arrives at the business phone number

## 📂 Project Structure

```
├── src/
│   ├── components/
│   │   └── Contact.tsx          # Contact form component
│   └── utils/
│       └── api.ts                # API client utility
├── netlify/
│   └── functions/
│       └── send-sms.js           # Serverless function for SMS
├── .env.example                  # Environment variables template
├── netlify.toml                  # Netlify configuration
└── package.json
```

## 🔒 Security Features

### Rate Limiting

**Per IP:**
- 3 requests per hour per IP address
- 1 hour block if exceeded

**Global:**
- 100 total SMS per hour
- Prevents cost overruns

### Input Validation

- Name: 1-100 characters
- Phone: 10-15 digits, valid format
- Zip Code: 5-10 characters, numbers only
- Message: 10-500 characters
- All inputs sanitized against XSS

### CORS Protection

- Only allowed origins can make requests
- Configure `ALLOWED_ORIGIN` in production

## 📱 SMS Message Format

```
🚨 URGENT REQUEST 🚨 (if urgent checkbox is checked)

NEW CONTACT FROM WEBSITE

Name: John Doe
Phone: +1 555 123 4567
Zip Code: 80202

Message:
I need help with a kitchen remodel...

---
Submitted: 3/10/2026, 2:30:00 PM MT
```

## 💰 Cost Estimation

**AWS SNS Sandbox (Free Tier):**
- First 100 SMS: Free
- After: ~$0.00645 per SMS (US)

**Production with Toll-Free:**
- Toll-Free number: ~$2/month
- SMS outbound: ~$0.0075 per message
- Example: 500 SMS/month = $2 + $3.75 = $5.75/month

## 🚨 Moving to Production

### Exit Sandbox Mode

See AWS Support ticket instructions in the main documentation.

### Enable Toll-Free Number

Uncomment in `send-sms.js`:

```javascript
if (process.env.TOLL_FREE_NUMBER) {
  params.MessageAttributes["AWS.MM.SMS.OriginationNumber"] = {
    DataType: "String",
    StringValue: process.env.TOLL_FREE_NUMBER,
  };
}
```

Add to Netlify environment variables:
```
TOLL_FREE_NUMBER=+18001234567
```

## 🐛 Troubleshooting

### "Rate limit exceeded"
- Wait 1 hour or adjust limits in `send-sms.js`

### "Invalid phone number"
- Verify phone is in international format: `+1XXXXXXXXXX`
- Ensure phone is verified in SNS Sandbox

### "Service unavailable"
- Check AWS credentials in environment variables
- Verify IAM permissions include `sns:Publish`
- Check AWS region matches your SNS setup

### SMS not arriving
- Confirm number is verified in SNS Sandbox
- Check AWS CloudWatch logs for errors
- Verify message length < 160 characters (or it splits into multiple)

## 📞 Support

For issues or questions, check:
- AWS SNS Documentation: https://docs.aws.amazon.com/sns/
- Netlify Functions Docs: https://docs.netlify.com/functions/overview/

## 📝 License

MIT