import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { v } from "convex/values";

// Simple hash function for password (in production, use bcrypt via action)
function simpleHash(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.codePointAt(i);
    if (char === undefined) {
      continue;
    }
    hash = ((hash << 5) - hash) + char;
    hash &= hash;
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
  handler: async (ctx, args) => {
    if (args.email !== SYSTEM_CREDENTIALS.email) {
      return { message: "Thông tin đăng nhập không đúng", success: false };
    }
    
    if (!verifyPassword(args.password, SYSTEM_CREDENTIALS.passwordHash)) {
      return { message: "Thông tin đăng nhập không đúng", success: false };
    }
    
    // Generate simple session token
    const token = `sys_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    
    // Store session
    await ctx.db.insert("systemSessions", {
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      token, // 24 hours
    });
    
    return { message: "Đăng nhập thành công", success: true, token };
  },
  returns: v.object({
    message: v.string(),
    success: v.boolean(),
    token: v.optional(v.string()),
  }),
});

export const verifySystemSession = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    if (!args.token || !args.token.startsWith("sys_")) {
      return { message: "Token không hợp lệ", valid: false };
    }
    
    const session = await ctx.db
      .query("systemSessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();
    
    if (!session) {
      return { message: "Session không tồn tại", valid: false };
    }
    
    if (session.expiresAt < Date.now()) {
      return { message: "Session đã hết hạn", valid: false };
    }
    
    return { message: "Session hợp lệ", valid: true };
  },
  returns: v.object({
    message: v.string(),
    valid: v.boolean(),
  }),
});

export const logoutSystem = mutation({
  args: { token: v.string() },
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
  returns: v.null(),
});

// ============================================================
// ADMIN AUTH - SuperAdmin and users with RBAC
// ============================================================

export const verifyAdminLogin = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Find admin user by email
    const adminUser = await ctx.db
      .query("adminUsers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    
    if (!adminUser) {
      return { message: "Email hoặc mật khẩu không đúng", success: false };
    }
    
    if (adminUser.status !== "Active") {
      return { message: "Tài khoản đã bị vô hiệu hóa", success: false };
    }
    
    if (!verifyPassword(args.password, adminUser.passwordHash)) {
      return { message: "Email hoặc mật khẩu không đúng", success: false };
    }
    
    // Generate session token
    const token = `adm_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    
    // Store session
    await ctx.db.insert("adminSessions", {
      adminUserId: adminUser._id,
      createdAt: Date.now(),
      expiresAt: Date.now() + 8 * 60 * 60 * 1000,
      token, // 8 hours
    });
    
    // Update last login
    await ctx.db.patch(adminUser._id, { lastLogin: Date.now() });
    
    return {
      message: "Đăng nhập thành công",
      success: true,
      token,
      user: {
        email: adminUser.email,
        id: adminUser._id,
        isSuperAdmin: adminUser.isSuperAdmin ?? false,
        name: adminUser.name,
        roleId: adminUser.roleId,
      },
    };
  },
  returns: v.object({
    message: v.string(),
    success: v.boolean(),
    token: v.optional(v.string()),
    user: v.optional(v.object({
      email: v.string(),
      id: v.string(),
      isSuperAdmin: v.boolean(),
      name: v.string(),
      roleId: v.string(),
    })),
  }),
});

export const verifyAdminSession = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    if (!args.token || !args.token.startsWith("adm_")) {
      return { message: "Token không hợp lệ", valid: false };
    }
    
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();
    
    if (!session) {
      return { message: "Session không tồn tại", valid: false };
    }
    
    if (session.expiresAt < Date.now()) {
      return { message: "Session đã hết hạn", valid: false };
    }
    
    const adminUser = await ctx.db.get(session.adminUserId);
    if (!adminUser || adminUser.status !== "Active") {
      return { message: "Tài khoản không hợp lệ", valid: false };
    }
    
    const role = await ctx.db.get(adminUser.roleId);
    
    return {
      message: "Session hợp lệ",
      user: {
        email: adminUser.email,
        id: adminUser._id,
        isSuperAdmin: adminUser.isSuperAdmin ?? false,
        name: adminUser.name,
        permissions: role?.permissions ?? {},
        roleId: adminUser.roleId,
      },
      valid: true,
    };
  },
  returns: v.object({
    message: v.string(),
    user: v.optional(v.object({
      email: v.string(),
      id: v.string(),
      isSuperAdmin: v.boolean(),
      name: v.string(),
      permissions: v.record(v.string(), v.array(v.string())),
      roleId: v.string(),
    })),
    valid: v.boolean(),
  }),
});

export const logoutAdmin = mutation({
  args: { token: v.string() },
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
  returns: v.null(),
});

// ============================================================
// CUSTOMER AUTH - End user account
// ============================================================

export const registerCustomer = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    password: v.string(),
    phone: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("customers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    if (existing) {
      return { message: "Email đã tồn tại", success: false };
    }

    const customerId = await ctx.db.insert("customers", {
      email: args.email,
      name: args.name,
      ordersCount: 0,
      passwordHash: simpleHash(args.password),
      phone: args.phone,
      status: "Active",
      totalSpent: 0,
    });

    const token = `cus_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    await ctx.db.insert("customerSessions", {
      createdAt: Date.now(),
      customerId,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      token,
    });

    return {
      customer: { email: args.email, id: customerId, name: args.name, phone: args.phone },
      message: "Đăng ký thành công",
      success: true,
      token,
    };
  },
  returns: v.object({
    customer: v.optional(v.object({
      email: v.string(),
      id: v.id("customers"),
      name: v.string(),
      phone: v.string(),
    })),
    message: v.string(),
    success: v.boolean(),
    token: v.optional(v.string()),
  }),
});

export const verifyCustomerLogin = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const customer = await ctx.db
      .query("customers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (!customer || !customer.passwordHash) {
      return { message: "Email hoặc mật khẩu không đúng", success: false };
    }
    if (customer.status !== "Active") {
      return { message: "Tài khoản đã bị vô hiệu hóa", success: false };
    }
    if (!verifyPassword(args.password, customer.passwordHash)) {
      return { message: "Email hoặc mật khẩu không đúng", success: false };
    }

    const token = `cus_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    await ctx.db.insert("customerSessions", {
      createdAt: Date.now(),
      customerId: customer._id,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      token,
    });

    return {
      customer: { email: customer.email, id: customer._id, name: customer.name, phone: customer.phone },
      message: "Đăng nhập thành công",
      success: true,
      token,
    };
  },
  returns: v.object({
    customer: v.optional(v.object({
      email: v.string(),
      id: v.id("customers"),
      name: v.string(),
      phone: v.string(),
    })),
    message: v.string(),
    success: v.boolean(),
    token: v.optional(v.string()),
  }),
});

export const verifyCustomerSession = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    if (!args.token || !args.token.startsWith("cus_")) {
      return { message: "Token không hợp lệ", valid: false };
    }

    const session = await ctx.db
      .query("customerSessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!session) {
      return { message: "Session không tồn tại", valid: false };
    }

    if (session.expiresAt < Date.now()) {
      return { message: "Session đã hết hạn", valid: false };
    }

    const customer = await ctx.db.get(session.customerId);
    if (!customer || customer.status !== "Active") {
      return { message: "Tài khoản không hợp lệ", valid: false };
    }

    return {
      customer: {
        email: customer.email,
        id: customer._id,
        name: customer.name,
        phone: customer.phone,
      },
      message: "Session hợp lệ",
      valid: true,
    };
  },
  returns: v.object({
    customer: v.optional(v.object({
      email: v.string(),
      id: v.id("customers"),
      name: v.string(),
      phone: v.string(),
    })),
    message: v.string(),
    valid: v.boolean(),
  }),
});

export const logoutCustomer = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("customerSessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (session) {
      await ctx.db.delete(session._id);
    }
    return null;
  },
  returns: v.null(),
});

// ============================================================
// ADMIN USER MANAGEMENT (called from /system)
// ============================================================

export const createSuperAdmin = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if SuperAdmin already exists
    const existingSuperAdmin = await ctx.db
      .query("adminUsers")
      .filter((q) => q.eq(q.field("isSuperAdmin"), true))
      .first();
    
    if (existingSuperAdmin) {
      return { message: "SuperAdmin đã tồn tại", success: false };
    }
    
    // Check email unique
    const existingEmail = await ctx.db
      .query("adminUsers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    
    if (existingEmail) {
      return { message: "Email đã được sử dụng", success: false };
    }
    
    // Get or create SuperAdmin role
    let superAdminRole = await ctx.db
      .query("roles")
      .filter((q) => q.eq(q.field("isSuperAdmin"), true))
      .first();
    
    if (!superAdminRole) {
      const roleId = await ctx.db.insert("roles", {
        color: "#ef4444",
        description: "Quản trị viên cao nhất, toàn quyền hệ thống",
        isSuperAdmin: true,
        isSystem: true,
        name: "Super Admin",
        permissions: { "*": ["*"] },
      });
      superAdminRole = await ctx.db.get(roleId);
    }
    
    // Create SuperAdmin user
    await ctx.db.insert("adminUsers", {
      createdAt: Date.now(),
      email: args.email,
      isSuperAdmin: true,
      name: args.name ?? "Super Admin",
      passwordHash: simpleHash(args.password),
      roleId: superAdminRole!._id,
      status: "Active",
    });
    
    return { message: "Đã tạo SuperAdmin thành công", success: true };
  },
  returns: v.object({
    message: v.string(),
    success: v.boolean(),
  }),
});

export const getSuperAdmin = query({
  args: {},
  handler: async (ctx) => {
    const superAdmin = await ctx.db
      .query("adminUsers")
      .filter((q) => q.eq(q.field("isSuperAdmin"), true))
      .first();
    
    if (!superAdmin) {return null;}
    
    return {
      createdAt: superAdmin.createdAt,
      email: superAdmin.email,
      id: superAdmin._id,
      name: superAdmin.name,
      status: superAdmin.status,
    };
  },
  returns: v.union(
    v.object({
      createdAt: v.number(),
      email: v.string(),
      id: v.string(),
      name: v.string(),
      status: v.string(),
    }),
    v.null()
  ),
});

export const updateSuperAdminCredentials = mutation({
  args: {
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    password: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const superAdmin = await ctx.db
      .query("adminUsers")
      .filter((q) => q.eq(q.field("isSuperAdmin"), true))
      .first();
    
    if (!superAdmin) {
      return { message: "SuperAdmin chưa được tạo", success: false };
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
        return { message: "Email đã được sử dụng", success: false };
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
    
    return { message: "Đã cập nhật thông tin SuperAdmin", success: true };
  },
  returns: v.object({
    message: v.string(),
    success: v.boolean(),
  }),
});

// ============================================================
// PERMISSION HELPERS
// ============================================================

export const checkPermission = query({
  args: {
    action: v.string(),
    moduleKey: v.string(),
    token: v.string(),
  },
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
    const {permissions} = role;
    
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
  returns: v.object({
    allowed: v.boolean(),
    reason: v.string(),
  }),
});
