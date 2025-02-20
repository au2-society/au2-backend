import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const sendWelcomeEmail = async (email, username, defaultPassword) => {
  try {
    await resend.emails.send({
      from: "CVENTS <noreply@neosync.mukulanand.site>",
      to: email,
      subject: "Welcome to CVENTS - Your Admin Account Details",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to CVENTS</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f8f8; padding: 20px;">
            <tr>
              <td>
                <h1 style="color: #4a4a4a; text-align: center; margin-bottom: 30px;">Welcome to CVENTS</h1>
                <p style="font-size: 16px; margin-bottom: 20px;">Dear ${username},</p>
                <p style="font-size: 16px; margin-bottom: 20px;">Your admin account for CVENTS has been successfully created. Here are your account details:</p>
                <div style="background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 4px; padding: 20px; margin-bottom: 20px;">
                  <p style="font-size: 16px; margin-bottom: 10px;"><strong>Username:</strong> ${username}</p>
                  <p style="font-size: 16px; margin-bottom: 10px;"><strong>Email:</strong> ${email}</p>
                  <p style="font-size: 16px; margin-bottom: 10px;"><strong>Temporary Password:</strong> ${defaultPassword}</p>
                </div>
                <p style="font-size: 16px; margin-bottom: 20px; color: #d32f2f;"><strong>Important:</strong> For security reasons, please change your password immediately after your first login.</p>
                <p style="font-size: 16px; margin-bottom: 20px;">To access your admin account, please visit <a href="https://cvents.com/admin" style="color: #1976d2; text-decoration: none;">https://cvents.com/admin</a> and log in with your email and the temporary password provided above.</p>
                <p style="font-size: 16px; margin-bottom: 20px;">If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
                <p style="font-size: 16px; margin-bottom: 20px;">Best regards,<br>The CVENTS Team</p>
              </td>
            </tr>
          </table>
          <p style="font-size: 12px; color: #888; text-align: center; margin-top: 20px;">This is an automated message, please do not reply to this email.</p>
        </body>
        </html>
      `,
    });
    console.log("Welcome email sent successfully");
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw error;
  }
};

export default sendWelcomeEmail;
