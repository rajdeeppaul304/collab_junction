import { db } from "@/lib/db"
import { usersTable, brandsTable, creatorsTable } from "@/configs/schema"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function POST(req) {
  const { user } = await req.json()

  if (!user) {
    return NextResponse.json({ error: "User data is required" }, { status: 400 })
  }

  try {
    // Check if user already exists
    const existingUser = await db.select().from(usersTable).where(eq(usersTable.clerkId, user.id))

    if (existingUser.length > 0) {
      return NextResponse.json(existingUser[0])
    }

    // Get role from user metadata
    const role = user.publicMetadata?.role || "creator" // Default to creator if not specified

    // Insert the user
    const [newUser] = await db
      .insert(usersTable)
      .values({
        clerkId: user.id,
        name: user.fullName,
        email: user.primaryEmailAddress.emailAddress,
        image: user.imageUrl,
        role: role,
      })
      .returning()

    // Create role-specific profile
    if (role === "brand") {
      await db.insert(brandsTable).values({
        userId: newUser.id,
        companyName: user.fullName, // Default to user's name initially
      })
    } else if (role === "creator") {
      await db.insert(creatorsTable).values({
        userId: newUser.id,
      })
    }

    return NextResponse.json(newUser)
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const clerkId = searchParams.get("clerkId")

  if (!clerkId) {
    return NextResponse.json({ error: "Clerk ID is required" }, { status: 400 })
  }

  try {
    const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId))

    if (user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user[0])
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}
