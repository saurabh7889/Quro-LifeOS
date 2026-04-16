const nodemailer = require('nodemailer');

// ─── Validate email environment variables at startup ──────────────────────────
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

if (!EMAIL_USER || !EMAIL_PASS) {
  console.warn('\n⚠️  ============================================================');
  console.warn('⚠️  EMAIL_USER and/or EMAIL_PASS environment variables are NOT set.');
  console.warn('⚠️  Password reset emails will be logged to console instead of sent.');
  console.warn('⚠️  To send real emails, set these in your Render dashboard:');
  console.warn('⚠️    EMAIL_USER = your-gmail@gmail.com');
  console.warn('⚠️    EMAIL_PASS = your-gmail-app-password');
  console.warn('⚠️  ============================================================\n');
}

// ─── Create transporter only if credentials are available ─────────────────────
let transporter = null;

if (EMAIL_USER && EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  // Verify connection at startup
  transporter.verify()
    .then(() => {
      console.log('✅ Email transporter verified — SMTP connection is working.');
    })
    .catch((err) => {
      console.error('❌ Email transporter verification FAILED:', err.message);
      console.error('   Check that EMAIL_USER and EMAIL_PASS are correct.');
      console.error('   EMAIL_PASS must be a Gmail App Password, NOT your normal password.');
    });
}

/**
 * Send a password-reset email.
 *
 * If EMAIL_USER / EMAIL_PASS are not configured, falls back to logging the
 * reset link to the console so devs can still test the flow.
 */
const sendResetEmail = async (to, resetLink) => {
  console.log('\n📧 sendResetEmail() triggered');
  console.log(`   To: ${to}`);
  console.log(`   Reset Link: ${resetLink}`);

  // ── Fallback: log to console when credentials are missing ───────────────
  if (!transporter) {
    console.log('\n=============================================');
    console.log('📬 MOCK EMAIL (No EMAIL_USER/EMAIL_PASS set)');
    console.log(`   To: ${to}`);
    console.log(`   Reset Link: ${resetLink}`);
    console.log('=============================================\n');
    return;
  }

  const mailOptions = {
    from: `"QURO Support" <${EMAIL_USER}>`,
    to,
    subject: 'Reset Your Password — QURO LifeOS',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f23; color: #e2e8f0; padding: 40px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #818cf8; margin: 0; font-size: 28px;">QURO LifeOS</h1>
          <p style="color: #94a3b8; margin-top: 4px;">Password Reset Request</p>
        </div>

        <div style="background: #1e1b4b; padding: 24px; border-radius: 12px; border: 1px solid #312e81;">
          <h2 style="color: #c4b5fd; margin-top: 0;">Reset Your Password</h2>
          <p style="color: #cbd5e1; line-height: 1.6;">
            We received a request to reset the password for your QURO LifeOS account.
            Click the button below to set a new password. This link will expire in <strong>15 minutes</strong>.
          </p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${resetLink}" style="padding: 14px 32px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; border-radius: 10px; display: inline-block; font-weight: 600; font-size: 16px;">
              Reset Password
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 13px;">
            Or copy and paste this link into your browser:<br/>
            <a href="${resetLink}" style="color: #818cf8; word-break: break-all;">${resetLink}</a>
          </p>
        </div>

        <p style="color: #64748b; font-size: 12px; text-align: center; margin-top: 30px;">
          If you didn't request this reset, you can safely ignore this email.
        </p>
      </div>
    `,
  };

  try {
    console.log('   📤 Calling transporter.sendMail()...');
    const info = await transporter.sendMail(mailOptions);
    console.log('   ✅ Email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}`);
  } catch (err) {
    console.error('   ❌ sendMail() FAILED:', err.message);
    console.error('   Full error:', err);
    // Re-throw so the route handler can return a 500
    throw err;
  }
};

module.exports = { sendResetEmail };
