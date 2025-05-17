import { db } from "@/lib/db"
import { productsTable, brandsTable, productImagesTable, usersTable } from "@/configs/schema"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

// Get a specific product by ID
export async function GET(req, { params }) {
  const { id } = params

  if (!id) {
    return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
  }

  try {
    // Get product with brand info
    const productResult = await db
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
      .where(eq(productsTable.id, Number.parseInt(id)))

    if (productResult.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const product = productResult[0]

    // Get additional product images
    const images = await db.select().from(productImagesTable).where(eq(productImagesTable.productId, product.id))

    // Combine product with images
    const result = {
      ...product,
      images: [product.image, ...images.map((img) => img.imageUrl)].filter(Boolean),
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

// Update a product (brand only)
export async function PUT(req, { params }) {
  const { id } = params
  const { userId } = auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!id) {
    return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
  }

  try {
    // Get product with brand info
    const productResult = await db
      .select({
        id: productsTable.id,
        brandId: productsTable.brandId,
        brandUserId: brandsTable.userId,
      })
      .from(productsTable)
      .leftJoin(brandsTable, eq(productsTable.brandId, brandsTable.id))
      .where(eq(productsTable.id, Number.parseInt(id)))

    if (productResult.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const product = productResult[0]

    // Get user from database
    const userResult = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId))

    if (userResult.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = userResult[0]

    // Check if user is the owner of the product
    if (product.brandUserId !== user.id) {
      return NextResponse.json({ error: "You do not have permission to update this product" }, { status: 403 })
    }

    // Parse request body
    const data = await req.json()

    // Update product
    const [updatedProduct] = await db
      .update(productsTable)
      .set({
        name: data.name,
        description: data.description,
        price: data.price,
        discountPrice: data.discountPrice,
        category: data.category,
        image: data.image,
        featured: data.featured,
        updatedAt: new Date(),
      })
      .where(eq(productsTable.id, Number.parseInt(id)))
      .returning()

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

// Delete a product (brand only)
export async function DELETE(req, { params }) {
  const { id } = params
  const { userId } = auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!id) {
    return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
  }

  try {
    // Get product with brand info
    const productResult = await db
      .select({
        id: productsTable.id,
        brandId: productsTable.brandId,
        brandUserId: brandsTable.userId,
      })
      .from(productsTable)
      .leftJoin(brandsTable, eq(productsTable.brandId, brandsTable.id))
      .where(eq(productsTable.id, Number.parseInt(id)))

    if (productResult.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const product = productResult[0]

    // Get user from database
    const userResult = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId))

    if (userResult.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = userResult[0]

    // Check if user is the owner of the product
    if (product.brandUserId !== user.id) {
      return NextResponse.json({ error: "You do not have permission to delete this product" }, { status: 403 })
    }

    // Delete product images first
    await db.delete(productImagesTable).where(eq(productImagesTable.productId, Number.parseInt(id)))

    // Delete product
    await db.delete(productsTable).where(eq(productsTable.id, Number.parseInt(id)))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
