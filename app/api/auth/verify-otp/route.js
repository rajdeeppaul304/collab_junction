import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pendingOtpTable, usersTable } from "@/configs/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Find OTP entry for this email
    const pendingOtpEntry = await db
      .select()
      .from(pendingOtpTable)
      .where(eq(pendingOtpTable.email, email))
      .limit(1);

    if (pendingOtpEntry.length === 0) {
      return NextResponse.json({ error: "OTP not found or expired" }, { status: 400 });
    }

    const entry = pendingOtpEntry[0];

    // Check if OTP matches
    if (entry.otp !== otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    // Check if OTP expired
    if (new Date(entry.otp_expiry) < new Date()) {
      return NextResponse.json({ error: "OTP expired" }, { status: 400 });
    }

    // OTP is valid, create user in usersTable (hash password first)
    const hashedPassword = await bcrypt.hash(entry.password, 10);

    await db.insert(usersTable).values({
      name: entry.name,
      email: entry.email,
      password: hashedPassword,
      role: entry.role,
      created_at: new Date(),
    });

    // Delete OTP entry after successful verification
    await db.delete(pendingOtpTable).where(eq(pendingOtpTable.email, email));

    return NextResponse.json({ message: "OTP verified and user created" }, { status: 200 });
  } catch (err) {
    console.error("OTP verify error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
