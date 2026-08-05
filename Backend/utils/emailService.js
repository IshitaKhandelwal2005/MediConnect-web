/**
 * Sends an email using Brevo HTTPS API over Port 443 (Render Compatible)
 * @param {Object} options
 * @param {string|string[]} options.to - Recipient email address or array of emails
 * @param {string} options.subject - Email subject line
 * @param {string} [options.text] - Plain text content
 * @param {string} [options.html] - HTML formatted body
 */
export async function sendEmail({ to, subject, text, html }) {
  const apiKey = (process.env.BREVO_API_KEY || '').trim();
  const senderEmail = (process.env.FROM_EMAIL || process.env.EMAIL_USER || '').trim();
  const appName = (process.env.APP_NAME || 'MediConnect').trim();

  if (!apiKey) {
    throw new Error('BREVO_API_KEY environment variable is missing.');
  }
  if (!senderEmail) {
    throw new Error('FROM_EMAIL environment variable is missing.');
  }

  // Format recipient array
  const recipients = Array.isArray(to)
    ? to.map(email => ({ email: String(email).trim() }))
    : [{ email: String(to).trim() }];

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender: { name: appName, email: senderEmail },
      to: recipients,
      subject: subject || 'Notification',
      textContent: text || '',
      htmlContent: html || `<p>${text || ''}</p>`
    })
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('[Brevo HTTPS API Error]:', data);
    throw new Error(`Email sending failed: ${data.message || JSON.stringify(data)}`);
  }

  console.log('[Brevo HTTPS API Success]: MessageId =', data.messageId);
  return data;
}

export const verifyEmailTransport = async () => {
  const apiKey = (process.env.BREVO_API_KEY || '').trim();
  const senderEmail = (process.env.FROM_EMAIL || process.env.EMAIL_USER || '').trim();

  if (!apiKey || !senderEmail) {
    throw new Error('Brevo Email Service is not configured (BREVO_API_KEY and FROM_EMAIL are required).');
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/account', {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey
      }
    });

    if (response.ok) {
      return true;
    } else {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || `API returned status ${response.status}`);
    }
  } catch (err) {
    // If account verification request fails, throw descriptive error
    throw new Error(`Brevo API verification failed: ${err.message}`);
  }
};

export const sendOtpEmail = async (email, otp, recipientName = 'User') => {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#002000;padding:28px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;">MediConnect</h1>
              <p style="margin:4px 0 0;color:#a3c4a3;font-size:13px;">Healthcare, simplified.</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 8px;color:#374151;font-size:16px;font-weight:600;">Hi ${recipientName},</p>
              <p style="margin:0 0 28px;color:#6b7280;font-size:14px;line-height:1.6;">
                Use the verification code below to complete your registration. This code is valid for <strong>10 minutes</strong>.
              </p>
              <!-- OTP Box -->
              <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:24px;text-align:center;margin-bottom:28px;">
                <p style="margin:0 0 6px;color:#9ca3af;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">Verification Code</p>
                <p style="margin:0;font-size:38px;font-weight:800;letter-spacing:12px;color:#002000;">${otp}</p>
              </div>
              <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;">
                If you did not request this code, you can safely ignore this email. Do not share this code with anyone.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #f3f4f6;text-align:center;">
              <p style="margin:0;color:#d1d5db;font-size:11px;">© 2026 MediConnect · All rights reserved</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await sendEmail({
    to: email,
    subject: 'Your MediConnect Verification Code',
    text: `Your verification code is: ${otp}`,
    html
  });
};

export const sendReminderEmail = async (email, patientName, doctorName, date, time, reminderType) => {
  const timeText = reminderType === '24h' ? 'tomorrow' : 'in 1 hour';
  const html = `
<!DOCTYPE html>
<html>
<body style="font-family:'Segoe UI',Arial,sans-serif; background:#f5f5f5; padding:40px 0;">
    <table width="520" align="center" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <tr><td style="background:#002000; padding:28px 40px; text-align:center;"><h1 style="color:#ffffff; margin:0;">MediConnect</h1></td></tr>
        <tr><td style="padding:40px;">
            <p>Hi ${patientName},</p>
            <p>This is a reminder for your upcoming appointment with <strong>Dr. ${doctorName}</strong>.</p>
            <p><strong>Date:</strong> ${date}<br><strong>Time:</strong> ${time}</p>
            <p>Please ensure you are available at the scheduled time.</p>
        </td></tr>
    </table>
</body>
</html>`;

  await sendEmail({
    to: email,
    subject: `Appointment Reminder: You have an appointment ${timeText}`,
    text: `Hi ${patientName}, reminder for your appointment with Dr. ${doctorName} on ${date} at ${time}.`,
    html
  });
};

export const sendCancellationEmail = async (email, patientName, doctorName, date, time) => {
  const html = `
<!DOCTYPE html>
<html>
<body style="font-family:'Segoe UI',Arial,sans-serif; background:#f5f5f5; padding:40px 0;">
    <table width="520" align="center" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <tr><td style="background:#B22222; padding:28px 40px; text-align:center;"><h1 style="color:#ffffff; margin:0;">MediConnect</h1></td></tr>
        <tr><td style="padding:40px;">
            <p>Hi ${patientName},</p>
            <p>Your appointment with <strong>Dr. ${doctorName}</strong> scheduled for <strong>${date}</strong> at <strong>${time}</strong> has been cancelled.</p>
            <p>If you have any questions, please contact our support team or book a new appointment.</p>
        </td></tr>
    </table>
</body>
</html>`;

  await sendEmail({
    to: email,
    subject: 'Appointment Cancelled',
    text: `Hi ${patientName}, your appointment with Dr. ${doctorName} scheduled for ${date} at ${time} has been cancelled.`,
    html
  });
};

export default sendEmail;
