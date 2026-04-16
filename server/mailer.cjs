const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'placeholder',
    pass: process.env.EMAIL_PASS || 'placeholder'
  }
});

const sendResetEmail = async (to, resetLink) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('\n=============================================');
    console.log('MOCK EMAIL WENT OUT (No EMAIL_USER/EMAIL_PASS set)');
    console.log(`To: ${to}`);
    console.log(`Reset Link: ${resetLink}`);
    console.log('=============================================\n');
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'QURO LifeOS - Password Reset',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your password for QURO LifeOS.</p>
        <p>Click the link below to set a new password. This link will expire in 15 minutes.</p>
        <a href="${resetLink}" style="padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 10px;">Reset Password</a>
        <br/><br/>
        <p>Or copy and paste this link into your browser: <br/> <a href="${resetLink}">${resetLink}</a></p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">If you didn't request this reset, you can safely ignore this email.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', to);
  } catch (err) {
    console.error('Error sending reset email:', err);
    throw err;
  }
};

module.exports = { sendResetEmail };
