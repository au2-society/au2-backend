import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOTP = async (email, otp) => {
  await resend.emails.send({
    from: "noreply@neosync.mukulanand.site",
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is ${otp}`,
  });
};

export default sendOTP;
