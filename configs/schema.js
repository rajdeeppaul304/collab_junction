import { integer, pgTable, varchar, text, decimal, timestamp, boolean, serial, pgEnum } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// Create role enum
export const roleEnum = pgEnum("role", ["creator", "brand"])

// Users table with role
export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  password: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  role: roleEnum("role").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Brands table for brand-specific information
// export const brandsTable = pgTable("brands", {
//   id: serial("id").primaryKey(),
//   userId: integer("user_id")
//     .references(() => usersTable.id)
//     .notNull(),
//   companyName: varchar({ length: 255 }),
//   logo: varchar({ length: 255 }),
//   website: varchar({ length: 255 }),
//   description: text("description"),
//   createdAt: timestamp("created_at").defaultNow().notNull(),
//   updatedAt: timestamp("updated_at").defaultNow().notNull(),
// })

// // Creators table for creator-specific information
// export const creatorsTable = pgTable("creators", {
//   id: serial("id").primaryKey(),
//   userId: integer("user_id")
//     .references(() => usersTable.id)
//     .notNull(),
//   socialLinks: text("social_links"), // JSON stringified
//   followers: integer("followers").default(0),
//   category: varchar({ length: 100 }),
//   createdAt: timestamp("created_at").defaultNow().notNull(),
//   updatedAt: timestamp("updated_at").defaultNow().notNull(),
// })

// // Products table
// export const productsTable = pgTable("products", {
//   id: serial("id").primaryKey(),
//   brandId: integer("brand_id")
//     .references(() => brandsTable.id)
//     .notNull(),
//   name: varchar({ length: 255 }).notNull(),
//   description: text("description"),
//   price: decimal("price", { precision: 10, scale: 2 }).notNull(),
//   discountPrice: decimal("discount_price", { precision: 10, scale: 2 }),
//   category: varchar({ length: 100 }),
//   image: varchar({ length: 255 }),
//   featured: boolean("featured").default(false),
//   createdAt: timestamp("created_at").defaultNow().notNull(),
//   updatedAt: timestamp("updated_at").defaultNow().notNull(),
// })

// // Product images table for multiple images
// export const productImagesTable = pgTable("product_images", {
//   id: serial("id").primaryKey(),
//   productId: integer("product_id")
//     .references(() => productsTable.id)
//     .notNull(),
//   imageUrl: varchar({ length: 255 }).notNull(),
//   createdAt: timestamp("created_at").defaultNow().notNull(),
// })

// // Orders table
// export const ordersTable = pgTable("orders", {
//   id: serial("id").primaryKey(),
//   creatorId: integer("creator_id")
//     .references(() => creatorsTable.id)
//     .notNull(),
//   status: varchar({ length: 50 }).default("pending").notNull(),
//   totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
//   createdAt: timestamp("created_at").defaultNow().notNull(),
//   updatedAt: timestamp("updated_at").defaultNow().notNull(),
// })

// // Order items table
// export const orderItemsTable = pgTable("order_items", {
//   id: serial("id").primaryKey(),
//   orderId: integer("order_id")
//     .references(() => ordersTable.id)
//     .notNull(),
//   productId: integer("product_id")
//     .references(() => productsTable.id)
//     .notNull(),
//   quantity: integer("quantity").notNull(),
//   price: decimal("price", { precision: 10, scale: 2 }).notNull(),
//   createdAt: timestamp("created_at").defaultNow().notNull(),
// })

// // Define relations
// export const usersRelations = relations(usersTable, ({ one }) => ({
//   brand: one(brandsTable, {
//     fields: [usersTable.id],
//     references: [brandsTable.userId],
//   }),
//   creator: one(creatorsTable, {
//     fields: [usersTable.id],
//     references: [creatorsTable.userId],
//   }),
// }))

// export const brandsRelations = relations(brandsTable, ({ one, many }) => ({
//   user: one(usersTable, {
//     fields: [brandsTable.userId],
//     references: [usersTable.id],
//   }),
//   products: many(productsTable),
// }))

// export const creatorsRelations = relations(creatorsTable, ({ one, many }) => ({
//   user: one(usersTable, {
//     fields: [creatorsTable.userId],
//     references: [usersTable.id],
//   }),
//   orders: many(ordersTable),
// }))

// export const productsRelations = relations(productsTable, ({ one, many }) => ({
//   brand: one(brandsTable, {
//     fields: [productsTable.brandId],
//     references: [brandsTable.id],
//   }),
//   images: many(productImagesTable),
//   orderItems: many(orderItemsTable),
// }))

// export const ordersRelations = relations(ordersTable, ({ one, many }) => ({
//   creator: one(creatorsTable, {
//     fields: [ordersTable.creatorId],
//     references: [creatorsTable.id],
//   }),
//   items: many(orderItemsTable),
// }))

// export const orderItemsRelations = relations(orderItemsTable, ({ one }) => ({
//   order: one(ordersTable, {
//     fields: [orderItemsTable.orderId],
//     references: [ordersTable.id],
//   }),
//   product: one(productsTable, {
//     fields: [orderItemsTable.productId],
//     references: [productsTable.id],
//   }),
// }))

// export const productImagesRelations = relations(productImagesTable, ({ one }) => ({
//   product: one(productsTable, {
//     fields: [productImagesTable.productId],
//     references: [productsTable.id],
//   }),
// }))
