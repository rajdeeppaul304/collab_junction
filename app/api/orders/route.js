import { db } from "@/configs/db"
import { ordersTable, orderItemsTable, creatorsTable, usersTable, productsTable } from "@/configs/schema"
import { eq, desc } from "drizzle-orm"
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

// Get orders for the authenticated user
export async function GET(req) {
  const { userId } = auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get user from database
    const userResult = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId))

    if (userResult.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = userResult[0]

    // Check if user is a creator
    if (user.role !== "creator") {
      return NextResponse.json({ error: "Only creators can view orders" }, { status: 403 })
    }

    // Get creator profile
    const creatorResult = await db.select().from(creatorsTable).where(eq(creatorsTable.userId, user.id))

    if (creatorResult.length === 0) {
      return NextResponse.json({ error: "Creator profile not found" }, { status: 404 })
    }

    const creator = creatorResult[0]

    // Get orders for this creator
    const orders = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.creatorId, creator.id))
      .orderBy(desc(ordersTable.createdAt))

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await db
          .select({
            id: orderItemsTable.id,
            quantity: orderItemsTable.quantity,
            price: orderItemsTable.price,
            productId: orderItemsTable.productId,
            productName: productsTable.name,
            productImage: productsTable.image,
          })
          .from(orderItemsTable)
          .leftJoin(productsTable, eq(orderItemsTable.productId, productsTable.id))
          .where(eq(orderItemsTable.orderId, order.id))

        return {
          ...order,
          items,
        }
      }),
    )

    return NextResponse.json(ordersWithItems)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

// Create a new order (creator only)
export async function POST(req) {
  const { userId } = auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get user from database
    const userResult = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId))

    if (userResult.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = userResult[0]

    // Check if user is a creator
    if (user.role !== "creator") {
      return NextResponse.json({ error: "Only creators can create orders" }, { status: 403 })
    }

    // Get creator profile
    const creatorResult = await db.select().from(creatorsTable).where(eq(creatorsTable.userId, user.id))

    if (creatorResult.length === 0) {
      return NextResponse.json({ error: "Creator profile not found" }, { status: 404 })
    }

    const creator = creatorResult[0]

    // Parse request body
    const data = await req.json()
    const { items } = data

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Order items are required" }, { status: 400 })
    }

    // Calculate total amount
    let totalAmount = 0
    for (const item of items) {
      const product = await db.select().from(productsTable).where(eq(productsTable.id, item.productId))

      if (product.length === 0) {
        return NextResponse.json({ error: `Product with ID ${item.productId} not found` }, { status: 404 })
      }

      const price = product[0].discountPrice || product[0].price
      totalAmount += Number.parseFloat(price) * item.quantity
    }

    // Create order
    const [order] = await db
      .insert(ordersTable)
      .values({
        creatorId: creator.id,
        totalAmount,
        status: "pending",
      })
      .returning()

    // Create order items
    for (const item of items) {
      const product = await db.select().from(productsTable).where(eq(productsTable.id, item.productId))

      const price = product[0].discountPrice || product[0].price

      await db.insert(orderItemsTable).values({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price,
      })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
