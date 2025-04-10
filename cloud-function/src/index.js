/**
 * Cloud Function to handle contact form submissions with Cloudflare Turnstile verification
 * 
 * @param {Object} req Cloud Function request context
 * @param {Object} res Cloud Function response context
 */
const functions = require('@google-cloud/functions-framework');
const nodemailer = require('nodemailer');
const axios = require('axios');
const cors = require('cors')({
  origin: ['https://cloudandculture.co', 'https://www.cloudandculture.co'],
  methods: ['POST']
});

// Create a transporter object for sending emails
const transporter = nodemailer.createTransport({
  service: 'gmail', // Or configure SMTP directly
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Cloudflare Turnstile verification function
async function verifyTurnstileToken(token, ip) {
  try {
    const formData = new URLSearchParams();
    formData.append('secret', process.env.TURNSTILE_SECRET_KEY);
    formData.append('response', token);
    formData.append('remoteip', ip);

    const response = await axios.post(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error verifying Turnstile token:', error);
    return { success: false, error: 'Failed to verify Turnstile token' };
  }
}

// Set up the Cloud Function
functions.http('contact-form-handler', (req, res) => {
  // Enable CORS
  return cors(req, res, async () => {
    try {
      // Only allow POST requests
      if (req.method !== 'POST') {
        return res.status(405).json({
          success: false,
          error: 'Method not allowed'
        });
      }

      // Get form data from request body
      const { name, email, subject, message, 'cf-turnstile-response': turnstileToken } = req.body;

      // Validate form data
      if (!name || !email || !message) {
        return res.status(400).json({
          success: false,
          error: 'Name, email, and message are required'
        });
      }

      // Validate Turnstile token
      if (!turnstileToken) {
        return res.status(400).json({
          success: false,
          error: 'Turnstile verification failed - missing token'
        });
      }

      // Verify Turnstile token
      const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const turnstileVerification = await verifyTurnstileToken(turnstileToken, ipAddress);

      if (!turnstileVerification.success) {
        console.error('Turnstile verification failed:', turnstileVerification);
        return res.status(400).json({
          success: false,
          error: 'Human verification failed - please try again'
        });
      }

      // Prepare email content
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.CONTACT_EMAIL || 'support@cloudandculture.co',
        subject: `Contact Form: ${subject || 'New Message from Website'}`,
        text: `
          Name: ${name}
          Email: ${email}
          ---
          ${message}
        `,
        html: `
          <h3>New Contact Form Submission</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <hr>
          <div>${message.replace(/\n/g, '<br>')}</div>
        `,
        replyTo: email
      };

      // Send the email
      await transporter.sendMail(mailOptions);

      // Respond with success
      return res.status(200).json({
        success: true,
        message: 'Your message has been sent successfully'
      });
    } catch (error) {
      console.error('Error processing form submission:', error);
      
      return res.status(500).json({
        success: false,
        error: 'An error occurred while processing your request'
      });
    }
  });
});