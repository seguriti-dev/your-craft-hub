# Hands-Hands

## 📋 Prerequisites

- Node.js 18+ installed
- AWS Account with SNS or End User Messaging SMS configured
- Netlify account
- IAM user with `sns:Publish` and/or End User Messaging SMS permissions

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

#### For Local Development:

Create a `.env` file in the root directory:

```env
MY_AWS_ACCESS_KEY_ID=your_access_key_here
MY_AWS_SECRET_ACCESS_KEY=your_secret_key_here
MY_AWS_REGION=us-east-1
SMS_PROVIDER=sns
BUSINESS_PHONE_NUMBER=+17202557466
TOLL_FREE_NUMBER=
SMS_CONFIGURATION_SET_NAME=
ALLOWED_ORIGIN=http://localhost:8080
UPSTASH_REDIS_REST_URL=url-here
UPSTASH_REDIS_REST_TOKEN=token-here
RATE_LIMIT_STORE=memory
RATE_LIMIT_IP_POINTS=3
RATE_LIMIT_IP_DURATION_SECONDS=86400
RATE_LIMIT_IP_BLOCK_SECONDS=86400
RATE_LIMIT_GLOBAL_POINTS=25
RATE_LIMIT_GLOBAL_DURATION_SECONDS=86400
SMS_DEV_LOG_ONLY=false
SMS_DEV_LOG_PATH=logs/contact-messages.log
VITE_TURNSTILE_SITE_KEY=your_turnstile_site_key_here
TURNSTILE_SECRET_KEY=your_turnstile_secret_key_here
```

#### For Netlify Production:

Go to **Site settings** → **Environment variables** and add:

- `MY_AWS_ACCESS_KEY_ID`
- `MY_AWS_SECRET_ACCESS_KEY`
- `MY_AWS_REGION`
- `SMS_PROVIDER`
- `BUSINESS_PHONE_NUMBER`
- `TOLL_FREE_NUMBER` (required when `SMS_PROVIDER=end_user_messaging`)
- `SMS_CONFIGURATION_SET_NAME` (optional)
- `ALLOWED_ORIGIN` (your production domain)
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `RATE_LIMIT_STORE`
- `RATE_LIMIT_IP_POINTS`
- `RATE_LIMIT_IP_DURATION_SECONDS`
- `RATE_LIMIT_IP_BLOCK_SECONDS`
- `RATE_LIMIT_GLOBAL_POINTS`
- `RATE_LIMIT_GLOBAL_DURATION_SECONDS`
- `SMS_DEV_LOG_ONLY`
- `SMS_DEV_LOG_PATH`
- `VITE_TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`
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

## SMS Provider Modes

The backend is prepared to support multiple SMS providers through the `SMS_PROVIDER` flag.

- `SMS_PROVIDER=sns`: current default path using Amazon SNS `Publish`
- `SMS_PROVIDER=end_user_messaging`: sends through AWS End User Messaging SMS `SendTextMessage`

Current rollout status:

- `sns` remains the default and current production-safe path
- `end_user_messaging` is now implemented behind the flag for controlled testing
- when using `end_user_messaging`, set `TOLL_FREE_NUMBER` so the function can send with your toll-free origination identity
- `SMS_CONFIGURATION_SET_NAME` is optional and is passed through when defined
- both providers now share the same request validation, response shape, and error handling path
- rollback is immediate by switching `SMS_PROVIDER` back to `sns`

## Turnstile Test Mode

For local testing, you can use Cloudflare's official test keys instead of real widget credentials.

Add this to `.env`:

```env
VITE_TURNSTILE_USE_TEST_KEYS=true
TURNSTILE_USE_TEST_KEYS=true
VITE_TURNSTILE_TEST_BEHAVIOR=pass
TURNSTILE_TEST_BEHAVIOR=pass
```

Available frontend test behaviors:
- `pass`: always solves successfully
- `fail`: always fails verification
- `interactive`: shows an interactive testing widget

Available backend test behaviors:
- `pass`
- `fail`

Use this for local or preview testing only. Turn both flags back to `false` before switching to real credentials.

## Development Log Mode

For local development, you can bypass AWS SNS and write each message to a log file instead.

Add this to `.env`:

```env
SMS_DEV_LOG_ONLY=true
SMS_DEV_LOG_PATH=logs/contact-messages.log
```

Behavior:
- keeps validation, rate limiting, and Turnstile verification active
- skips the AWS SNS request
- appends the formatted message to the configured log file
- only works when `NODE_ENV` is not `production`

This is useful for local testing without generating SMS traffic or requiring active AWS credentials.

It can also be combined with either SMS provider and either rate limit store while you validate the rest of the request flow.

## Rate Limit Store Modes

The backend supports two rate limit stores:

- `RATE_LIMIT_STORE=memory`: uses in-memory counters inside the function runtime
- `RATE_LIMIT_STORE=redis`: uses Upstash Redis for shared counters across deployments and instances

Recommended combinations:

- local development with file logging: `RATE_LIMIT_STORE=memory` and `SMS_DEV_LOG_ONLY=true`
- local development simulating production counters: `RATE_LIMIT_STORE=redis` and `SMS_DEV_LOG_ONLY=true`
- production: `RATE_LIMIT_STORE=redis` and `SMS_DEV_LOG_ONLY=false`

Notes:

- if `RATE_LIMIT_STORE=redis` and Upstash credentials are missing in local development, the function falls back to `memory` and logs a warning
- if `RATE_LIMIT_STORE=redis` and Upstash credentials are missing in production, the function fails with a configuration error

## Turnstile Production Setup

1. Log in to Cloudflare Dashboard.
2. Open **Turnstile**.
3. Create a new widget.
4. Choose the widget mode you want for your site.
5. Add your allowed domains:
   - local development: `localhost`
   - production: your real domain
6. Save the widget and copy:
   - site key
   - secret key
7. Put the site key in `VITE_TURNSTILE_SITE_KEY`.
8. Put the secret key in `TURNSTILE_SECRET_KEY`.
9. Set `VITE_TURNSTILE_USE_TEST_KEYS=false`.
10. Set `TURNSTILE_USE_TEST_KEYS=false`.
11. In Netlify, add the same production variables in **Site settings** -> **Environment variables**.

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
- Store configurable with `RATE_LIMIT_STORE`
- Configurable with `RATE_LIMIT_IP_POINTS`
- Window configurable with `RATE_LIMIT_IP_DURATION_SECONDS`
- Block time configurable with `RATE_LIMIT_IP_BLOCK_SECONDS`

**Global:**
- Configurable with `RATE_LIMIT_GLOBAL_POINTS`
- Window configurable with `RATE_LIMIT_GLOBAL_DURATION_SECONDS`
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

NEW CONTACT FROM Hands-Hands WEBSITE

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

Set the provider and origination identity in environment variables:

```env
SMS_PROVIDER=end_user_messaging
TOLL_FREE_NUMBER=+18001234567
SMS_CONFIGURATION_SET_NAME=your-configuration-set-name
```

With that configuration, the function sends through AWS End User Messaging SMS `SendTextMessage` and passes the toll-free number as `OriginationIdentity`.

## 🐛 Troubleshooting

### "Rate limit exceeded"
- Wait until the current rate-limit window resets, or adjust the `RATE_LIMIT_*` variables in your environment configuration

### "Invalid phone number"
- Verify phone is in international format: `+1XXXXXXXXXX`
- Ensure phone is verified in SNS Sandbox

### "Service unavailable"
- Check AWS credentials in environment variables
- Verify IAM permissions match the active provider
- Check AWS region matches your SNS or End User Messaging SMS setup

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
