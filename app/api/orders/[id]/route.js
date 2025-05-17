import { db } from "@/lib/db"
import { ordersTable, orderItemsTable, creatorsTable, usersTable, productsTable, brandsTable } from "@/configs/schema"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

// Get a specific order by ID
export async function GET(req, { params }) {
  const { id } = params
  const { userId } = auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!id) {
    return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
  }

  try {
    // Get user from database
    const userResult = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId))

    if (userResult.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = userResult[0]

    // Get order
    const orderResult = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, Number.parseInt(id)))

    if (orderResult.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const order = orderResult[0]

    // Check if user is the creator who placed the order
    if (user.role === "creator") {
      const creatorResult = await db.select().from(creatorsTable).where(eq(creatorsTable.userId, user.id))

      if (creatorResult.length === 0 || creatorResult[0].id !== order.creatorId) {
        return NextResponse.json({ error: "You do not have permission to view this order" }, { status: 403 })
      }
    }
    // If user is a brand, check if they own any of the products in the order
    else if (user.role === "brand") {
      const brandResult = await db.select().from(brandsTable).where(eq(brandsTable.userId, user.id))

      if (brandResult.length === 0) {
        return NextResponse.json({ error: "Brand profile not found" }, { status: 404 })
      }

      const brand = brandResult[0]

      // Get order items
      const items = await db
        .select({
          productId: orderItemsTable.productId,
          brandId: productsTable.brandId,
        })
        .from(orderItemsTable)
        .leftJoin(productsTable, eq(orderItemsTable.productId, productsTable.id))
        .where(eq(orderItemsTable.orderId, order.id))

      // Check if any of the products belong to this brand
      const hasBrandProduct = items.some((item) => item.brandId === brand.id)

      if (!hasBrandProduct) {
        return NextResponse.json({ error: "You do not have permission to view this order" }, { status: 403 })
      }
    } else {
      return NextResponse.json({ error: "You do not have permission to view this order" }, { status: 403 })
    }

    // Get order items
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

    const result = {
      ...order,
      items,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}

// Update order status (creator only)
export async function PUT(req, { params }) {
  const { id } = params
  const { userId } = auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!id) {
    return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
  }

  try {
    // Get user from database
    const userResult = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId))

    if (userResult.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = userResult[0]

    // Get order
    const orderResult = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, Number.parseInt(id)))

    if (orderResult.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const order = orderResult[0]

    // Check if user is the creator who placed the order
    if (user.role === "creator") {
      const creatorResult = await db.select().from(creatorsTable).where(eq(creatorsTable.userId, user.id))

      if (creatorResult.length === 0 || creatorResult[0].id !== order.creatorId) {
        return NextResponse.json({ error: "You do not have permission to update this order" }, { status: 403 })
      }
    } else {
      return NextResponse.json({ error: "Only creators can update their orders" }, { status: 403 })
    }

    // Parse request body
    const data = await req.json()

    // Update order
    const [updatedOrder] = await db
      .update(ordersTable)
      .set({
        status: data.status,
        updatedAt: new Date(),
      })
      .where(eq(ordersTable.id, Number.parseInt(id)))
      .returning()

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}
