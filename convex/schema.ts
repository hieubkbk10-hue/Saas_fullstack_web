import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Example table - customize as needed
  users: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.optional(v.string()),
  }).index("by_email", ["email"]),
});
