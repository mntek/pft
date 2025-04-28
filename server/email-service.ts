import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key if available
const isDev = process.env.NODE_ENV === 'development';
let useSendGrid = false;

// In development mode, we can use a console-based email service
// This allows the app to work without requiring a real SendGrid API key for testing
if (isDev) {
  // Always use console-based email in development for predictable testing
  console.info('📧 [Email Service] Using development console-based email service.');
  
  // Still try to parse SendGrid key if available (for verbose logging)
  if (process.env.SENDGRID_API_KEY) {
    try {
      if (process.env.SENDGRID_API_KEY.startsWith('SG.')) {
        console.info('📧 [Email Service] Valid SendGrid API key detected, but using console logs in development.');
      } else {
        console.warn('📧 [Email Service] SendGrid API key does not start with "SG." - using console logs.');
      }
    } catch (error) {
      console.warn('📧 [Email Service] Invalid SendGrid API key format.');
    }
  }
} else {
  // In production, we require a valid SendGrid API key
  if (!process.env.SENDGRID_API_KEY) {
    console.error('📧 [Email Service] SENDGRID_API_KEY environment variable is not set in production mode!');
  } else {
    try {
      // Validate format before setting
      if (!process.env.SENDGRID_API_KEY.startsWith('SG.')) {
        console.error('📧 [Email Service] SendGrid API key does not start with "SG." in production mode!');
      } else {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        useSendGrid = true;
        console.info('📧 [Email Service] Using SendGrid API for emails in production.');
      }
    } catch (error) {
      console.error('📧 [Email Service] Invalid SendGrid API key format in production mode!');
    }
  }
}

interface EmailData {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html: string;
}

/**
 * Sends an email using SendGrid or logs to console in development mode
 */
export async function sendEmail(data: EmailData): Promise<boolean> {
  try {
    // In development mode without SendGrid, log the email to console
    if (isDev && !useSendGrid) {
      console.log('');
      console.log('========== DEVELOPMENT EMAIL ==========');
      console.log(`TO: ${data.to}`);
      console.log(`FROM: ${data.from}`);
      console.log(`SUBJECT: ${data.subject}`);
      console.log(`BODY: ${data.text || data.html.replace(/<[^>]*>?/gm, '')}`);
      console.log('========================================');
      console.log('');
      
      // For development testing, log the token from password reset emails
      if (data.subject.includes('Reset') && data.html.includes('token=')) {
        const tokenMatch = data.html.match(/token=([^"&]+)/);
        if (tokenMatch && tokenMatch[1]) {
          console.log('📧 [Password Reset] Token for testing: ' + tokenMatch[1]);
          console.log(`📧 [Password Reset] Full URL: ${data.html.match(/href="([^"]+)"/)?.[1]}`);
          console.log('');
        }
      }
      
      return true;
    }
    
    // Use SendGrid if available
    if (useSendGrid) {
      await sgMail.send(data);
      console.info(`📧 [Email Service] Email sent successfully to ${data.to}`);
      return true;
    }
    
    // If neither SendGrid nor development mode is available
    console.warn('📧 [Email Service] Email service not available. Email not sent.');
    return false;
  } catch (error) {
    console.error('📧 [Email Service] Error sending email:', error);
    return false;
  }
}

export async function sendPasswordResetEmail(email: string, resetToken: string, appBaseUrl: string): Promise<boolean> {
  const resetUrl = `${appBaseUrl}/reset-password?token=${resetToken}`;
  
  const emailData: EmailData = {
    to: email,
    from: 'no-reply@financetracker.com', // Replace with your verified sender
    subject: 'Reset Your Financial Tracker Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Reset Your Password</h2>
        <p>You requested a password reset for your Financial Tracker account.</p>
        <p>Click the button below to reset your password. This link is valid for 1 hour.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
        </div>
        <p>If you didn't request this password reset, you can safely ignore this email.</p>
        <p>For security reasons, this password reset link will expire in 1 hour.</p>
        <hr style="border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="color: #666; font-size: 12px;">This is an automated email. Please do not reply to this message.</p>
      </div>
    `,
  };
  
  return await sendEmail(emailData);
}