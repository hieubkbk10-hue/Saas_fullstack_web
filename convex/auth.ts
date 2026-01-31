import { query, mutation } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { v } from "convex/values";

// Simple hash function for password (in production, use bcrypt via action)
function simpleHash(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `sh_${Math.abs(hash).toString(16)}_${password.length}`;
}

function verifyPassword(password: string, hashedPassword: string): boolean {
  return simpleHash(password) === hashedPassword;
}

// ============================================================
// SYSTEM AUTH - Hardcoded single account for /system
// ============================================================

const SYSTEM_CREDENTIALS = {
  email: "hieubkav",
  passwordHash: simpleHash("Hieu0948066514"),
};

export const verifySystemLogin = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    token: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    if (args.email !== SYSTEM_CREDENTIALS.email) {
      return { success: false, message: "Thông tin đăng nhập không đúng" };
    }
    
    if (!verifyPassword(args.password, SYSTEM_CREDENTIALS.passwordHash)) {
      return { success: false, message: "Thông tin đăng nhập không đúng" };
    }
    
    // Generate simple session token
    const token = `sys_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    
    // Store session
    await ctx.db.insert("systemSessions", {
      token,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });
    
    return { success: true, message: "Đăng nhập thành công", token };
  },
});

export const verifySystemSession = query({
  args: { token: v.string() },
  returns: v.object({
    valid: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    if (!args.token || !args.token.startsWith("sys_")) {
      return { valid: false, message: "Token không hợp lệ" };
    }
    
    const session = await ctx.db
      .query("systemSessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();
    
    if (!session) {
      return { valid: false, message: "Session không tồn tại" };
    }
    
    if (session.expiresAt < Date.now()) {
      return { valid: false, message: "Session đã hết hạn" };
    }
    
    return { valid: true, message: "Session hợp lệ" };
  },
});

export const logoutSystem = mutation({
  args: { token: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("systemSessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();
    
    if (session) {
      await ctx.db.delete(session._id);
    }
    return null;
  },
});

// ============================================================
// ADMIN AUTH - SuperAdmin and users with RBAC
// ============================================================

export const verifyAdminLogin = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    token: v.optional(v.string()),
    user: v.optional(v.object({
      id: v.string(),
      name: v.string(),
      email: v.string(),
      roleId: v.string(),
      isSuperAdmin: v.boolean(),
    })),
  }),
  handler: async (ctx, args) => {
    // Find admin user by email
    const adminUser = await ctx.db
      .query("adminUsers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    
    if (!adminUser) {
      return { success: false, message: "Email hoặc mật khẩu không đúng" };
    }
    
    if (adminUser.status !== "Active") {
      return { success: false, message: "Tài khoản đã bị vô hiệu hóa" };
    }
    
    if (!verifyPassword(args.password, adminUser.passwordHash)) {
      return { success: false, message: "Email hoặc mật khẩu không đúng" };
    }
    
    // Generate session token
    const token = `adm_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    
    // Store session
    await ctx.db.insert("adminSessions", {
      token,
      adminUserId: adminUser._id,
      createdAt: Date.now(),
      expiresAt: Date.now() + 8 * 60 * 60 * 1000, // 8 hours
    });
    
    // Update last login
    await ctx.db.patch(adminUser._id, { lastLogin: Date.now() });
    
    return {
      success: true,
      message: "Đăng nhập thành công",
      token,
      user: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        roleId: adminUser.roleId,
        isSuperAdmin: adminUser.isSuperAdmin ?? false,
      },
    };
  },
});

export const verifyAdminSession = query({
  args: { token: v.string() },
  returns: v.object({
    valid: v.boolean(),
    message: v.string(),
    user: v.optional(v.object({
      id: v.string(),
      name: v.string(),
      email: v.string(),
      roleId: v.string(),
      isSuperAdmin: v.boolean(),
      permissions: v.record(v.string(), v.array(v.string())),
    })),
  }),
  handler: async (ctx, args) => {
    if (!args.token || !args.token.startsWith("adm_")) {
      return { valid: false, message: "Token không hợp lệ" };
    }
    
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();
    
    if (!session) {
      return { valid: false, message: "Session không tồn tại" };
    }
    
    if (session.expiresAt < Date.now()) {
      return { valid: false, message: "Session đã hết hạn" };
    }
    
    const adminUser = await ctx.db.get(session.adminUserId);
    if (!adminUser || adminUser.status !== "Active") {
      return { valid: false, message: "Tài khoản không hợp lệ" };
    }
    
    const role = await ctx.db.get(adminUser.roleId);
    
    return {
      valid: true,
      message: "Session hợp lệ",
      user: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        roleId: adminUser.roleId,
        isSuperAdmin: adminUser.isSuperAdmin ?? false,
        permissions: role?.permissions ?? {},
      },
    };
  },
});

export const logoutAdmin = mutation({
  args: { token: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();
    
    if (session) {
      await ctx.db.delete(session._id);
    }
    return null;
  },
});

// ============================================================
// ADMIN USER MANAGEMENT (called from /system)
// ============================================================

export const createSuperAdmin = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.optional(v.string()),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    // Check if SuperAdmin already exists
    const existingSuperAdmin = await ctx.db
      .query("adminUsers")
      .filter((q) => q.eq(q.field("isSuperAdmin"), true))
      .first();
    
    if (existingSuperAdmin) {
      return { success: false, message: "SuperAdmin đã tồn tại" };
    }
    
    // Check email unique
    const existingEmail = await ctx.db
      .query("adminUsers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    
    if (existingEmail) {
      return { success: false, message: "Email đã được sử dụng" };
    }
    
    // Get or create SuperAdmin role
    let superAdminRole = await ctx.db
      .query("roles")
      .filter((q) => q.eq(q.field("isSuperAdmin"), true))
      .first();
    
    if (!superAdminRole) {
      const roleId = await ctx.db.insert("roles", {
        name: "Super Admin",
        description: "Quản trị viên cao nhất, toàn quyền hệ thống",
        color: "#ef4444",
        isSystem: true,
        isSuperAdmin: true,
        permissions: { "*": ["*"] },
      });
      superAdminRole = await ctx.db.get(roleId);
    }
    
    // Create SuperAdmin user
    await ctx.db.insert("adminUsers", {
      name: args.name || "Super Admin",
      email: args.email,
      passwordHash: simpleHash(args.password),
      roleId: superAdminRole!._id,
      status: "Active",
      isSuperAdmin: true,
      createdAt: Date.now(),
    });
    
    return { success: true, message: "Đã tạo SuperAdmin thành công" };
  },
});

export const getSuperAdmin = query({
  args: {},
  returns: v.union(
    v.object({
      id: v.string(),
      name: v.string(),
      email: v.string(),
      status: v.string(),
      createdAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const superAdmin = await ctx.db
      .query("adminUsers")
      .filter((q) => q.eq(q.field("isSuperAdmin"), true))
      .first();
    
    if (!superAdmin) return null;
    
    return {
      id: superAdmin._id,
      name: superAdmin.name,
      email: superAdmin.email,
      status: superAdmin.status,
      createdAt: superAdmin.createdAt,
    };
  },
});

export const updateSuperAdminCredentials = mutation({
  args: {
    email: v.optional(v.string()),
    password: v.optional(v.string()),
    name: v.optional(v.string()),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    const superAdmin = await ctx.db
      .query("adminUsers")
      .filter((q) => q.eq(q.field("isSuperAdmin"), true))
      .first();
    
    if (!superAdmin) {
      return { success: false, message: "SuperAdmin chưa được tạo" };
    }
    
    const updates: Partial<Doc<"adminUsers">> = {};
    
    if (args.email && args.email !== superAdmin.email) {
      // Check email unique
      const emailToCheck = args.email;
      const existingEmail = await ctx.db
        .query("adminUsers")
        .withIndex("by_email", (q) => q.eq("email", emailToCheck))
        .unique();
      
      if (existingEmail) {
        return { success: false, message: "Email đã được sử dụng" };
      }
      updates.email = args.email;
    }
    
    if (args.password) {
      updates.passwordHash = simpleHash(args.password);
    }
    
    if (args.name) {
      updates.name = args.name;
    }
    
    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(superAdmin._id, updates);
    }
    
    return { success: true, message: "Đã cập nhật thông tin SuperAdmin" };
  },
});

// ============================================================
// PERMISSION HELPERS
// ============================================================

export const checkPermission = query({
  args: {
    token: v.string(),
    moduleKey: v.string(),
    action: v.string(),
  },
  returns: v.object({
    allowed: v.boolean(),
    reason: v.string(),
  }),
  handler: async (ctx, args) => {
    // Verify session first
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();
    
    if (!session || session.expiresAt < Date.now()) {
      return { allowed: false, reason: "Session không hợp lệ" };
    }
    
    const adminUser = await ctx.db.get(session.adminUserId);
    if (!adminUser || adminUser.status !== "Active") {
      return { allowed: false, reason: "Tài khoản không hợp lệ" };
    }
    
    // SuperAdmin has all permissions
    if (adminUser.isSuperAdmin) {
      return { allowed: true, reason: "SuperAdmin" };
    }
    
    const role = await ctx.db.get(adminUser.roleId);
    if (!role) {
      return { allowed: false, reason: "Role không tồn tại" };
    }
    
    // Check if module is enabled
    const moduleRecord = await ctx.db
      .query("adminModules")
      .withIndex("by_key", (q) => q.eq("key", args.moduleKey))
      .unique();
    
    if (!moduleRecord || !moduleRecord.enabled) {
      return { allowed: false, reason: "Module chưa được bật" };
    }
    
    // Check permissions
    const permissions = role.permissions;
    
    // Check wildcard
    if (permissions["*"]?.includes("*") || permissions["*"]?.includes(args.action)) {
      return { allowed: true, reason: "Wildcard permission" };
    }
    
    // Check module-specific permission
    if (permissions[args.moduleKey]?.includes("*") || permissions[args.moduleKey]?.includes(args.action)) {
      return { allowed: true, reason: "Module permission" };
    }
    
    return { allowed: false, reason: "Không có quyền thực hiện" };
  },
});
