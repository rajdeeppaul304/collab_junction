import { db } from "@/configs/db"
import { productsTable, brandsTable, usersTable } from "@/configs/schema"
import { eq, desc, and, like } from "drizzle-orm"
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

// Get all products with optional filtering
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category")
  const featured = searchParams.get("featured") === "true"
  const search = searchParams.get("search")
  const brandId = searchParams.get("brandId")

  try {
    let query = db
      .select({
        id: productsTable.id,
        name: productsTable.name,
        description: productsTable.description,
        price: productsTable.price,
        discountPrice: productsTable.discountPrice,
        category: productsTable.category,
        image: productsTable.image,
        featured: productsTable.featured,
        createdAt: productsTable.createdAt,
        brandId: productsTable.brandId,
        brandName: brandsTable.companyName,
      })
      .from(productsTable)
      .leftJoin(brandsTable, eq(productsTable.brandId, brandsTable.id))
      .orderBy(desc(productsTable.createdAt))

    // Apply filters if provided
    const filters = []

    if (category) {
      filters.push(eq(productsTable.category, category))
    }

    if (featured) {
      filters.push(eq(productsTable.featured, true))
    }

    if (search) {
      filters.push(like(productsTable.name, `%${search}%`))
    }

    if (brandId) {
      filters.push(eq(productsTable.brandId, Number.parseInt(brandId)))
    }

    if (filters.length > 0) {
      query = query.where(and(...filters))
    }

    const products = await query

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

// Create a new product (brand only)
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

    // Check if user is a brand
    if (user.role !== "brand") {
      return NextResponse.json({ error: "Only brands can create products" }, { status: 403 })
    }

    // Get brand profile
    const brandResult = await db.select().from(brandsTable).where(eq(brandsTable.userId, user.id))

    if (brandResult.length === 0) {
      return NextResponse.json({ error: "Brand profile not found" }, { status: 404 })
    }

    const brand = brandResult[0]

    // Parse request body
    const data = await req.json()

    // Create product
    const [product] = await db
      .insert(productsTable)
      .values({
        brandId: brand.id,
        name: data.name,
        description: data.description,
        price: data.price,
        discountPrice: data.discountPrice,
        category: data.category,
        image: data.image,
        featured: data.featured || false,
      })
      .returning()

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
