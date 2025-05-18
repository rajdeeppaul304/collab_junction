import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pendingOtpTable } from "@/configs/schema";
import { eq } from "drizzle-orm";
import nodemailer from "nodemailer";

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOtpEmail(email, otp) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Your App Name" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP for Email Verification",
    html: `<p>Hello,</p><p>Your OTP is: <b>${otp}</b></p><p>This OTP is valid for 30 seconds.</p>`,
  };

  await transporter.sendMail(mailOptions);
}

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(pendingOtpTable)
      .where(eq(pendingOtpTable.email, email))
      .limit(1);

    if (!existing.length) {
      return NextResponse.json({ error: "No pending OTP found for this email" }, { status: 404 });
    }

    const newOtp = generateOtp();
    const newExpiry = new Date(Date.now() + 30 * 1000); // 30 sec expiry

    await db
      .update(pendingOtpTable)
      .set({ otp: newOtp, otp_expiry: newExpiry })
      .where(eq(pendingOtpTable.email, email));

    await sendOtpEmail(email, newOtp);

    return NextResponse.json({ message: "OTP resent successfully" });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
