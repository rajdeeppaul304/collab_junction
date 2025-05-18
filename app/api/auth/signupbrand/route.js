import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { usersTable, pendingOtpTable } from "@/configs/schema";
import { eq } from "drizzle-orm";
import { sendOtpEmail } from "@/lib/mail/sendotp";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const existingUserResult = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    const existingUser = existingUserResult[0];

    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await db.delete(pendingOtpTable).where(eq(pendingOtpTable.email, email));

    await db.insert(pendingOtpTable).values({
      name,
      email,
      password,
      otp,
      otp_expiry: otpExpiry,
      role: "brand",
    });

    await sendOtpEmail({ email, otp });

    return NextResponse.json({ message: "OTP sent to email" }, { status: 200 });
  } catch (error) {
    console.error("Signup Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
