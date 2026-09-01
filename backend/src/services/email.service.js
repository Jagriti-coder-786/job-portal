import nodemailer from 'nodemailer';
import env from '../config/env.js';

let transporter;

const createTransporter = async () => {
  if (transporter) return transporter;

  // Use provided SMTP settings if available
  if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT || 587,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  } else {
    // Fallback to Ethereal Mail for testing during development
    console.warn('No SMTP credentials found. Using Ethereal Mail for testing.');
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  return transporter;
};

/**
 * Sends an email
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML body of the email
 */
export const sendEmail = async (to, subject, html) => {
  try {
    const mailTransporter = await createTransporter();
    
    const info = await mailTransporter.sendMail({
      from: `"JobPortal Admin" <${env.SMTP_FROM || 'noreply@jobportal.local'}>`,
      to,
      subject,
      html,
    });

    // If using ethereal, log the preview URL
    if (info.messageId && !env.SMTP_HOST) {
      console.log('Preview test email URL: %s', nodemailer.getTestMessageUrl(info));
    }
    
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};
