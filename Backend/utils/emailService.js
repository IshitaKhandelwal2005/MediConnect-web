import nodemailer from 'nodemailer';

const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

export const sendOtpEmail = async (email, otp, recipientName = 'User') => {
    const transporter = createTransporter();

    const mailOptions = {
        from: `"MediConnect" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your MediConnect Verification Code',
        html: `
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
        </html>
        `
    };

    await transporter.sendMail(mailOptions);
};

export const sendReminderEmail = async (email, patientName, doctorName, date, time, reminderType) => {
    const transporter = createTransporter();
    const timeText = reminderType === '24h' ? 'tomorrow' : 'in 1 hour';

    const mailOptions = {
        from: `"MediConnect" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Appointment Reminder: You have an appointment ${timeText}`,
        html: `
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
        </html>
        `
    };
    await transporter.sendMail(mailOptions);
};

export const sendCancellationEmail = async (email, patientName, doctorName, date, time) => {
    const transporter = createTransporter();
    
    const mailOptions = {
        from: `"MediConnect" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Appointment Cancelled`,
        html: `
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
        </html>
        `
    };
    await transporter.sendMail(mailOptions);
};
