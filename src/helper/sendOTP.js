import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOTP = async (email, otp) => {
  try {
    await resend.emails.send({
      from: "CVENTS <noreply@neosync.mukulanand.site>",
      to: email,
      subject: "Your Verification Code",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Verification Code</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f8f8; padding: 20px;">
            <tr>
              <td>
                <h1 style="color: #4a4a4a; text-align: center; margin-bottom: 30px;">Your Verification Code</h1>
                <p style="font-size: 16px; margin-bottom: 20px;">Hello,</p>
                <p style="font-size: 16px; margin-bottom: 20px;">You have requested a verification code. Please use the following code to complete your action:</p>
                <div style="background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 4px; padding: 20px; text-align: center; margin-bottom: 20px;">
                  <h2 style="font-size: 28px; color: #4a4a4a; margin: 0;">${otp}</h2>
                </div>
                <p style="font-size: 16px; margin-bottom: 20px;">This code will expire in 10 minutes for security reasons. If you didn't request this code, please ignore this email.</p>
                <p style="font-size: 16px; margin-bottom: 20px;">If you have any questions or concerns, please don't hesitate to contact our support team.</p>
                <p style="font-size: 16px; margin-bottom: 20px;">Best regards,<br>The Cvents Team</p>
              </td>
            </tr>
          </table>
          <p style="font-size: 12px; color: #888; text-align: center; margin-top: 20px;">This is an automated message, please do not reply to this email.</p>
        </body>
        </html>
      `,
    });
    console.log("OTP email sent successfully");
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw error;
  }
};

export default sendOTP;
