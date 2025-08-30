const nodemailer = require('nodemailer');

const createTransporter = () => {
  // SMTP config from env
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, ''); // strip spaces if pasted app password

  if (!host || !user || !pass) {
    throw new Error('SMTP configuration is missing (SMTP_HOST, SMTP_USER, SMTP_PASS)');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: { user, pass }
  });
};

const sendOtpEmail = async ({ to, otp }) => {
  const from = process.env.EMAIL_FROM || 'no-reply@devnovate.com';
  const transporter = createTransporter();

  const info = await transporter.sendMail({
    from,
    to,
    subject: 'Devnovate Signup OTP',
    html: `<div style="font-family:Arial,sans-serif;font-size:14px;color:#222"> 
      <p>Your OTP for Devnovate signup is:</p>
      <p style="font-size:24px;font-weight:bold;letter-spacing:2px">${otp}</p>
      <p>This OTP will expire in 5 minutes.</p>
    </div>`
  });
  return info;
};

module.exports = { sendOtpEmail };