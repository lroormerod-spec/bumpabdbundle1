import { pgTable, serial, text, boolean, real, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default(""),
  email: text("email").notNull().unique(),
  realEmail: text("real_email"),
  avatar: text("avatar"),
  isAdmin: boolean("is_admin").notNull().default(false),
  onboarded: boolean("onboarded").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Registries
export const registries = pgTable("registries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  parentNames: text("parent_names").notNull().default(""),
  dueDate: text("due_date"),
  shareSlug: text("share_slug").notNull().unique(),
  coverImage: text("cover_image"),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRegistrySchema = createInsertSchema(registries).omit({ id: true, createdAt: true });
export type InsertRegistry = z.infer<typeof insertRegistrySchema>;
export type Registry = typeof registries.$inferSelect;

// Registry Items
export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  registryId: integer("registry_id").notNull(),
  title: text("title").notNull(),
  price: real("price"),
  image: text("image"),
  retailer: text("retailer"),
  url: text("url"),
  category: text("category").notNull().default("Other"),
  notes: text("notes"),
  isPurchased: boolean("is_purchased").notNull().default(false),
  purchasedBy: text("purchased_by"),
  priceAlert: boolean("price_alert").notNull().default(false),
  lastKnownPrice: real("last_known_price"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertItemSchema = createInsertSchema(items).omit({ id: true, createdAt: true });
export type InsertItem = z.infer<typeof insertItemSchema>;
export type Item = typeof items.$inferSelect;

// OTP Codes
export const otpCodes = pgTable("otp_codes", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export type OtpCode = typeof otpCodes.$inferSelect;

// Blog Posts
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull().default(""),
  excerpt: text("excerpt"),
  coverImage: text("cover_image"),
  author: text("author").notNull().default("Bump & Bundle"),
  status: text("status").notNull().default("draft"), // draft | published
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

// SEO Settings
export const seoSettings = pgTable("seo_settings", {
  id: serial("id").primaryKey(),
  pageKey: text("page_key").notNull().unique(),
  title: text("title"),
  description: text("description"),
  keywords: text("keywords"),
});

export type SeoSetting = typeof seoSettings.$inferSelect;

// Checklist Items
export const checklistItems = pgTable("checklist_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  label: text("label").notNull(),
  checked: boolean("checked").notNull().default(false),
  category: text("category").notNull().default("General"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type ChecklistItem = typeof checklistItems.$inferSelect;

// Saved Baby Names
export const savedNames = pgTable("saved_names", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  gender: text("gender"),
  meaning: text("meaning"),
  liked: boolean("liked").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export type SavedName = typeof savedNames.$inferSelect;

// Affiliate Clicks
export const affiliateClicks = pgTable("affiliate_clicks", {
  id: serial("id").primaryKey(),
  retailer: text("retailer"),
  productTitle: text("product_title"),
  originalUrl: text("original_url"),
  finalUrl: text("final_url"),
  userId: integer("user_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type AffiliateClick = typeof affiliateClicks.$inferSelect;

// Page Content
export const pageContent = pgTable("page_content", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type PageContent = typeof pageContent.$inferSelect;

// Bump Photos
export const magicLinks = pgTable("magic_links", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  email: text("email").notNull(),
  userId: integer("user_id"),
  used: boolean("used").notNull().default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
export type MagicLink = typeof magicLinks.$inferSelect;

export const affiliateConfig = pgTable("affiliate_config", {
  id: serial("id").primaryKey(),
  retailerName: text("retailer_name").notNull(),
  retailerDomain: text("retailer_domain").notNull().unique(),
  network: text("network").notNull(), // 'awin', 'amazon_associates', 'rakuten', 'cj', 'manual'
  publisherId: text("publisher_id"),  // your ID on the network (same across retailers)
  programmeId: text("programme_id"),  // retailer-specific programme ID
  trackingParam: text("tracking_param"), // custom override if needed
  customUrlTemplate: text("custom_url_template"), // full template e.g. for Rakuten
  active: boolean("active").notNull().default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
export type AffiliateConfig = typeof affiliateConfig.$inferSelect;

export const bumpPhotos = pgTable("bump_photos", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  imageUrl: text("image_url").notNull(),
  week: integer("week"),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type BumpPhoto = typeof bumpPhotos.$inferSelect;
