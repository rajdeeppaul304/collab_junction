import nodemailer from "nodemailer";

export async function sendOtpEmail({ email, otp }) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // your Gmail address
      pass: process.env.EMAIL_PASS, // your App Password
    },
  });

  const mailOptions = {
    from: `"Your App Name" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP for Email Verification",
    html: `<p>Hello,</p><p>Your OTP is: <b>${otp}</b></p><p>This OTP is valid for 10 minutes.</p>`,
  };

  await transporter.sendMail(mailOptions);
}
