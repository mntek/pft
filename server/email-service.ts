import * as sendgrid from '@sendgrid/mail';

// Initialize SendGrid with API key
if (!process.env.SENDGRID_API_KEY) {
  console.warn('SENDGRID_API_KEY environment variable is not set. Email functionality will not work.');
} else {
  sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailData {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html: string;
}

export async function sendEmail(data: EmailData): Promise<boolean> {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.warn('Cannot send email: SENDGRID_API_KEY is not set');
      return false;
    }
    
    await sendgrid.send(data);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
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