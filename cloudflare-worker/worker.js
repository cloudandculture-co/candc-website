/**
 * Cloudflare Worker for contact form handler with Turnstile verification
 */

// Email configuration
const EMAIL_CONFIG = {
  to: 'support@cloudandculture.com', // Default recipient, can be overridden with CONTACT_EMAIL environment variable
  from: '', // Set in environment variable: EMAIL_USER
  subject: 'New Contact Form Submission'
};

// Turnstile verification endpoint
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

// CORS headers for preflight requests
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://cloudandculture.com,https://www.cloudandculture.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

/**
 * Handle OPTIONS request for CORS preflight
 */
function handleOptions(request) {
  return new Response(null, {
    headers: corsHeaders
  });
}

/**
 * Verify Cloudflare Turnstile token
 */
async function verifyTurnstileToken(token, ip) {
  const formData = new FormData();
  formData.append('secret', TURNSTILE_SECRET_KEY);
  formData.append('response', token);
  formData.append('remoteip', ip);

  try {
    const result = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      body: formData
    });
    
    const outcome = await result.json();
    return outcome;
  } catch (error) {
    console.error('Error verifying Turnstile token:', error);
    return { success: false, error: 'Failed to verify token' };
  }
}

/**
 * Send email using Cloudflare Email Workers
 */
async function sendEmail(name, email, subject, message) {
  try {
    const emailSubject = `Contact Form: ${subject || 'New Message from Website'}`;
    
    const emailContent = {
      from: EMAIL_USER,
      to: CONTACT_EMAIL || EMAIL_CONFIG.to,
      subject: emailSubject,
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

    // Send using Cloudflare Email Workers
    await Email.send(emailContent);
    
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Handle the POST request with form data
 */
async function handleFormSubmission(request) {
  try {
    // Get the form data from the request
    const formData = await request.json();
    const { name, email, subject, message, 'cf-turnstile-response': turnstileToken } = formData;

    // Validate form data
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Name, email, and message are required'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }

    // Validate Turnstile token
    if (!turnstileToken) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Turnstile verification failed - missing token'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }

    // Get client IP
    const clientIP = request.headers.get('CF-Connecting-IP');

    // Verify the token
    const verification = await verifyTurnstileToken(turnstileToken, clientIP);
    
    if (!verification.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Human verification failed - please try again'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }

    // Send the email
    const emailResult = await sendEmail(name, email, subject, message);
    
    if (!emailResult.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to send email'
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Your message has been sent successfully'
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  } catch (error) {
    console.error('Error processing form submission:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'An error occurred while processing your request'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
}

/**
 * Worker event handler
 */
export default {
  async fetch(request, env, ctx) {
    // Make environment variables available globally
    globalThis.EMAIL_USER = env.EMAIL_USER;
    globalThis.CONTACT_EMAIL = env.CONTACT_EMAIL;
    globalThis.TURNSTILE_SECRET_KEY = env.TURNSTILE_SECRET_KEY;
    
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return handleOptions(request);
    }
    
    // Only allow POST requests for form submissions
    if (request.method === 'POST') {
      return handleFormSubmission(request);
    }
    
    // Return 405 Method Not Allowed for other methods
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Method not allowed' 
      }),
      {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
};