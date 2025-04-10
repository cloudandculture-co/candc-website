/**
 * Cloudflare Worker for contact form handler with Turnstile verification
 */

// Email configuration
const EMAIL_CONFIG = {
  to: 'support@cloudandculture.co', // Default recipient, can be overridden with CONTACT_EMAIL environment variable
  from: '', // Set in environment variable: EMAIL_USER
  subject: 'New Contact Form Submission'
};

// Turnstile verification endpoint
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

// Allowed origins
const allowedOrigins = [
  'https://cloudandculture.co',
  'https://www.cloudandculture.co',
  'https://form.cloudandculture.co'
];

/**
 * Get CORS headers based on request origin
 */
function getCorsHeaders(request) {
  const origin = request.headers.get('Origin');
  
  // Return appropriate headers based on origin
  return {
    'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

/**
 * Handle OPTIONS request for CORS preflight
 */
function handleOptions(request) {
  return new Response(null, {
    headers: getCorsHeaders(request)
  });
}

/**
 * Verify Cloudflare Turnstile token
 */
async function verifyTurnstileToken(token, ip) {
  console.log('Verifying Turnstile token:', { token: token.substring(0, 10) + '...', ip });
  
  const formData = new FormData();
  formData.append('secret', TURNSTILE_SECRET_KEY);
  formData.append('response', token);
  formData.append('remoteip', ip);

  try {
    console.log('Using secret key:', TURNSTILE_SECRET_KEY ? 'Present (length: ' + TURNSTILE_SECRET_KEY.length + ')' : 'Missing');
    
    const result = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      body: formData
    });
    
    console.log('Turnstile API response status:', result.status);
    const outcome = await result.json();
    console.log('Turnstile verification outcome:', outcome);
    
    return outcome;
  } catch (error) {
    console.error('Error verifying Turnstile token:', error);
    return { success: false, error: 'Failed to verify token: ' + error.message };
  }
}

/**
 * Format email content for various providers
 */
function formatEmailContent(name, email, subject, message) {
  const emailSubject = `Contact Form: ${subject || 'New Message from Website'}`;
  
  const plainText = `
    Name: ${name}
    Email: ${email}
    ---
    ${message}
  `;
  
  const htmlContent = `
    <h3>New Contact Form Submission</h3>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <hr>
    <div>${message.replace(/\n/g, '<br>')}</div>
  `;
  
  return {
    subject: emailSubject,
    text: plainText,
    html: htmlContent
  };
}

/**
 * Send email using SendGrid
 */
async function sendViaEmailJS(name, email, subject, message, formData) {
  try {
    if (!EMAIL_JS_SERVICE_ID || !EMAIL_JS_TEMPLATE_ID || !EMAIL_JS_USER_ID) {
      console.warn('EmailJS credentials not configured');
      return { success: false, error: 'EmailJS not configured' };
    }
    
    // Format data for EmailJS
    const emailJSData = {
      service_id: EMAIL_JS_SERVICE_ID,
      template_id: EMAIL_JS_TEMPLATE_ID,
      user_id: EMAIL_JS_USER_ID,
      template_params: {
        name: name,
        email: email,
        subject: subject || 'Contact Form Submission',
        message: message,
        ...formData // Include any other form fields
      }
    };
    
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailJSData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('EmailJS error:', response.status, errorText);
      return { success: false, error: `EmailJS error: ${response.status}` };
    }
    
    return { success: true, provider: 'emailjs' };
  } catch (error) {
    console.error('EmailJS error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send email using SendGrid or other email provider with fallbacks
 */
async function sendEmail(name, email, subject, message, formData = {}) {
  try {
    console.log('Preparing to send email:', {
      to: (CONTACT_EMAIL || EMAIL_CONFIG.to),
      subject: subject || 'No subject'
    });
    
    const recipientEmail = CONTACT_EMAIL || EMAIL_CONFIG.to;
    
    if (!recipientEmail) {
      console.error('Recipient email address is not configured');
      return { success: false, error: 'Email recipient is not configured' };
    }
    
    // Get formatted content
    const { subject: emailSubject, text: emailText, html: emailHtml } = 
      formatEmailContent(name, email, subject, message);
    
    // Try SendGrid if configured
    if (SENDGRID_API_KEY) {
      try {
        // Format the request for SendGrid API
        const sendgridPayload = {
          personalizations: [{
            to: [{ email: recipientEmail }],
            subject: emailSubject
          }],
          from: { 
            email: SENDGRID_FROM_EMAIL || 'noreply@cloudandculture.co',
            name: 'Cloud And Culture Contact Form'
          },
          reply_to: { email: email },
          content: [
            { type: 'text/plain', value: emailText },
            { type: 'text/html', value: emailHtml }
          ]
        };

        console.log('Email content prepared, attempting to send via SendGrid...');
        
        // Send using SendGrid API
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SENDGRID_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(sendgridPayload)
        });
        
        if (response.ok) {
          console.log('Email sent successfully via SendGrid');
          return { success: true, provider: 'sendgrid' };
        }
        
        const errorText = await response.text();
        console.error('SendGrid API error:', response.status, errorText);
        // Fall through to next provider on error
      } catch (sendgridError) {
        console.error('SendGrid error, trying fallback:', sendgridError);
        // Fall through to next provider
      }
    }
    
    // Try EmailJS as fallback
    if (EMAIL_JS_SERVICE_ID) {
      console.log('Attempting to send via EmailJS (fallback)...');
      const emailJSResult = await sendViaEmailJS(name, email, subject, message, formData);
      
      if (emailJSResult.success) {
        return emailJSResult;
      }
      // Fall through to next option
    }
    
    // Try Cloudflare Email Workers as last resort
    if (typeof Email !== 'undefined' && typeof Email.send === 'function' && EMAIL_USER) {
      try {
        console.log('Attempting to send via Cloudflare Email Workers (fallback)...');
        
        const emailContent = {
          from: EMAIL_USER,
          to: recipientEmail,
          subject: emailSubject,
          text: emailText,
          html: emailHtml,
          replyTo: email
        };
        
        await Email.send(emailContent);
        console.log('Email sent successfully via Cloudflare Email Workers');
        return { success: true, provider: 'cloudflare' };
      } catch (cloudflareError) {
        console.error('Cloudflare Email Workers error:', cloudflareError);
        // This was our last option, so we return the error
        return { 
          success: false, 
          error: 'All email sending methods failed',
          details: cloudflareError.message
        };
      }
    }
    
    // If we get here, all email methods failed
    console.error('All email sending methods failed or not configured');
    return { 
      success: false, 
      error: 'Email sending failed - no working provider available',
    };
  } catch (error) {
    console.error('Error sending email:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    
    return { 
      success: false, 
      error: error.message,
      details: `${error.name}: ${error.message}`
    };
  }
}

/**
 * Handle the POST request with form data
 */
async function handleFormSubmission(request) {
  try {
    // Get the form data from the request
    const formData = await request.json();
    console.log('Received form data:', JSON.stringify(formData, null, 2));
    
    // Extract turnstile token from 'cf-turnstile-response' or 'turnstile-token' field
    const { name, email, subject, message } = formData;
    const turnstileToken = formData['cf-turnstile-response'] || formData['turnstile-token'] || formData['token'];
    
    console.log('Extracted token?', turnstileToken ? 'Yes' : 'No');

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
            ...getCorsHeaders(request)
          }
        }
      );
    }

    // Validate Turnstile token (can be disabled for testing with DEBUG environment variable)
    if (!turnstileToken) {
      console.warn('Missing Turnstile token in request');
      
      // Check if we're in debug mode to bypass Turnstile
      const isDebugMode = env.DEBUG === 'true' || env.DEBUG === '1';
      
      if (!isDebugMode) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Turnstile verification failed - missing token'
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...getCorsHeaders(request)
            }
          }
        );
      } else {
        console.log('DEBUG mode enabled - bypassing Turnstile verification');
      }
    }

    // Get client IP
    const clientIP = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || '127.0.0.1';
    console.log('Client IP:', clientIP);
    console.log('Request headers:', JSON.stringify(Object.fromEntries([...request.headers.entries()]), null, 2));

    // Verify the token if present, otherwise return success if in debug mode
    let verification = { success: true };
    if (turnstileToken) {
        verification = await verifyTurnstileToken(turnstileToken, clientIP);
    } else if (env.DEBUG === 'true' || env.DEBUG === '1') {
        console.log('DEBUG mode enabled - skipping Turnstile verification');
    } else {
        verification.success = false;
        verification.error = 'Missing Turnstile token';
    }
    
    if (!verification.success) {
      const errorResponse = {
        success: false,
        error: 'Human verification failed - please try again',
        details: verification.error || verification['error-codes'] || 'Unknown verification error'
      };
      
      console.error('Turnstile verification failed:', errorResponse);
      
      return new Response(
        JSON.stringify(errorResponse),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...getCorsHeaders(request)
          }
        }
      );
    }
    
    console.log('Turnstile verification successful!');

    // Send the email
    console.log('Sending email with data:', { name, email, subject: subject || '(no subject)' });
    // Pass all form data to sendEmail in case we need to use EmailJS or another service
    const emailResult = await sendEmail(name, email, subject, message, formData);
    console.log('Email sending result:', emailResult);
    
    if (!emailResult.success) {
      // Include detailed error information for better debugging
      const errorResponse = {
        success: false,
        error: 'Failed to send email',
        details: emailResult.error || 'Unknown error',
        additionalInfo: emailResult.details || null
      };
      
      console.error('Email sending failed:', errorResponse);
      
      return new Response(
        JSON.stringify(errorResponse),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...getCorsHeaders(request)
          }
        }
      );
    }
    
    console.log('Email sent successfully!');

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
          ...getCorsHeaders(request)
        }
      }
    );
  } catch (error) {
    console.error('Error processing form submission:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    
    // Try to get more information about the request that caused the error
    try {
      const method = request.method;
      const url = request.url;
      const contentType = request.headers.get('Content-Type');
      console.error('Request that caused error:', { method, url, contentType });
    } catch (requestInfoError) {
      console.error('Failed to log request info:', requestInfoError);
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'An error occurred while processing your request',
        details: `${error.name}: ${error.message}`
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...getCorsHeaders(request)
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
    // Log incoming request for debugging
    console.log(`[${new Date().toISOString()}] ${request.method} ${request.url}`);
    
    // Make environment variables available globally
    globalThis.CONTACT_EMAIL = env.CONTACT_EMAIL;
    globalThis.TURNSTILE_SECRET_KEY = env.TURNSTILE_SECRET_KEY;
    globalThis.DEBUG = env.DEBUG;
    
    // Email service variables
    // 1. Cloudflare Email Workers
    globalThis.EMAIL_USER = env.EMAIL_USER;
    
    // 2. SendGrid
    globalThis.SENDGRID_API_KEY = env.SENDGRID_API_KEY;
    globalThis.SENDGRID_FROM_EMAIL = env.SENDGRID_FROM_EMAIL;
    
    // 3. EmailJS
    globalThis.EMAIL_JS_SERVICE_ID = env.EMAIL_JS_SERVICE_ID;
    globalThis.EMAIL_JS_TEMPLATE_ID = env.EMAIL_JS_TEMPLATE_ID;
    globalThis.EMAIL_JS_USER_ID = env.EMAIL_JS_USER_ID;
    
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return handleOptions(request);
    }
    
    // Only allow POST requests for form submissions
    if (request.method === 'POST') {
      return handleFormSubmission(request);
    }
    
    // Handle GET requests with a simple status check response
    if (request.method === 'GET') {
      return new Response(
        JSON.stringify({ 
          success: true, 
          status: 'Contact form API is working' 
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...getCorsHeaders(request)
          }
        }
      );
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
          ...getCorsHeaders(request)
        }
      }
    );
  }
};