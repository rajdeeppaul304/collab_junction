import { db } from "@/lib/db"
import { usersTable } from "@/configs/schema"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
// import { auth } from "@clerk/nextjs/server"
import { auth, clerkClient } from '@clerk/nextjs/server'
import { currentUser } from "@clerk/nextjs/server";
// import { users } from '@clerk/clerk-sdk-node'; // Direct access to users API

export async function POST(req) {
  const user = await currentUser();

// const { userId, isLoaded } = useAuth();
console.log("userId",  user.id)
const userId = user.id

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { role } = body

  if (!role || !["creator", "brand"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 })
  }

  try {
    const client = await clerkClient()
    
    // // 1. Update Clerk public metadata
    // await clerkClient.users.updateUserMetadata(userId, {
    //   publicMetadata: {
    //     role,
    //   },
    // })
    console.log("client", client.users)

    const response = await client.users.updateUserMetadata(userId, {
    publicMetadata: {
        role,
    },
    })



    // 2. Update local DB user role
    await db
      .update(usersTable)
      .set({ role })
      .where(eq(usersTable.clerkId, userId)) // assuming `clerkId` is the column that stores Clerk's userId

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Error updating role:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
