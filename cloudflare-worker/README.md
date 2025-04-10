# Contact Form Handler - Cloudflare Worker

This is a Cloudflare Worker implementation for handling contact form submissions with Cloudflare Turnstile bot protection.

## Features

- Form data validation
- Cloudflare Turnstile verification to prevent spam
- Email sending via Cloudflare Email Workers
- CORS protection
- Error handling

## Prerequisites

1. A Cloudflare account with Workers enabled
2. Cloudflare Email Workers or a mail service compatible with Cloudflare Workers
3. Cloudflare Turnstile setup (for bot protection)
4. Node.js and npm installed on your local machine

## Setup and Deployment

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
# Or using yarn
yarn global add wrangler
```

### 2. Login to your Cloudflare account

```bash
wrangler login
```

### 3. Configure Environment Variables

Set up your secrets:

```bash
# Set email address for sending
wrangler secret put EMAIL_USER --env production

# Set Cloudflare Turnstile secret key
wrangler secret put TURNSTILE_SECRET_KEY --env production
```

### 4. Deploy the Worker

```bash
# Deploy to production
npm run deploy:prod
# Or directly using wrangler
wrangler publish --env production
```

### 5. Configure the Frontend

Update the contact form's fetch URL in `contact.html` to point to your Cloudflare Worker endpoint:

```javascript
fetch('https://api.cloudandculture.co/contact', {
  // ... rest of the fetch configuration
})
```

## Local Development

To test the worker locally:

```bash
npm run dev
# Or directly using wrangler
wrangler dev
```

## Customization

- **CORS Settings**: Update the `corsHeaders` in `worker.js` to match your website's domains
- **Email Templates**: Modify the email HTML/text templates in the `sendEmail` function
- **Routes**: Adjust the route pattern in `wrangler.toml` if needed

## Troubleshooting

1. **Email not sending**: Verify your Email Workers configuration in Cloudflare Dashboard
2. **CORS errors**: Check that the CORS headers match your website domain
3. **Turnstile errors**: Verify your secret key and that the client-side widget is properly configured
4. **Deployment issues**: Run `wrangler whoami` to verify authentication status

## Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare Email Workers Documentation](https://developers.cloudflare.com/email-routing/)
- [Cloudflare Turnstile Documentation](https://developers.cloudflare.com/turnstile/)