import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ============================================================
  // LEVEL 1: SYSTEM CONFIGURATION (cho /system)
  // ============================================================

  // 1. adminModules - Quản lý modules bật/tắt
  adminModules: defineTable({
    category: v.union(
      v.literal("content"),
      v.literal("commerce"),
      v.literal("user"),
      v.literal("system"),
      v.literal("marketing")
    ),
    dependencies: v.optional(v.array(v.string())),
    dependencyType: v.optional(v.union(v.literal("all"), v.literal("any"))),
    description: v.string(),
    enabled: v.boolean(),
    icon: v.string(),
    isCore: v.boolean(),
    key: v.string(),
    name: v.string(),
    order: v.number(),
    updatedBy: v.optional(v.id("users")),
  })
    .index("by_key", ["key"])
    .index("by_category_enabled", ["category", "enabled"])
    .index("by_enabled_order", ["enabled", "order"]),

  // 2. moduleFields - Cấu hình fields động cho mỗi module
  moduleFields: defineTable({
    enabled: v.boolean(),
    fieldKey: v.string(),
    group: v.optional(v.string()),
    isSystem: v.boolean(),
    linkedFeature: v.optional(v.string()),
    moduleKey: v.string(),
    name: v.string(),
    order: v.number(),
    required: v.boolean(),
    type: v.union(
      v.literal("text"),
      v.literal("textarea"),
      v.literal("richtext"),
      v.literal("number"),
      v.literal("price"),
      v.literal("boolean"),
      v.literal("image"),
      v.literal("gallery"),
      v.literal("select"),
      v.literal("date"),
      v.literal("daterange"),
      v.literal("email"),
      v.literal("phone"),
      v.literal("tags"),
      v.literal("password"),
      v.literal("json"),
      v.literal("color")
    ),
  })
    .index("by_module", ["moduleKey"])
    .index("by_module_enabled", ["moduleKey", "enabled"])
    .index("by_module_order", ["moduleKey", "order"]),

  // 3. moduleFeatures - Features bật/tắt cho từng module
  moduleFeatures: defineTable({
    description: v.optional(v.string()),
    enabled: v.boolean(),
    featureKey: v.string(),
    linkedFieldKey: v.optional(v.string()),
    moduleKey: v.string(),
    name: v.string(),
  })
    .index("by_module", ["moduleKey"])
    .index("by_module_feature", ["moduleKey", "featureKey"]),

  // 4. moduleSettings - Settings cấu hình cho module
  moduleSettings: defineTable({
    moduleKey: v.string(),
    settingKey: v.string(),
    value: v.any(),
  })
    .index("by_module", ["moduleKey"])
    .index("by_module_setting", ["moduleKey", "settingKey"]),

  // 5. systemPresets - Preset configurations
  systemPresets: defineTable({
    description: v.string(),
    enabledModules: v.array(v.string()),
    isDefault: v.optional(v.boolean()),
    key: v.string(),
    name: v.string(),
  }).index("by_key", ["key"]),

  // 6. convexDashboard - Link tới Convex Dashboard để xem usage
  convexDashboard: defineTable({
    dashboardUrl: v.string(),
    email: v.optional(v.string()),
    notes: v.optional(v.string()),
    password: v.optional(v.string()),
  }),

  // 6a. usageStats - Track bandwidth usage theo ngày
  usageStats: defineTable({
    date: v.string(), // "2026-01-09"
    dbReads: v.number(),
    dbWrites: v.number(),
    fileReads: v.number(),
    fileWrites: v.number(),
    estimatedDbBandwidth: v.number(), // KB
    estimatedFileBandwidth: v.number(), // KB
  }).index("by_date", ["date"]),

  // 7. systemSessions - Sessions cho /system login
  systemSessions: defineTable({
    createdAt: v.number(),
    expiresAt: v.number(),
    token: v.string(),
  }).index("by_token", ["token"]),

  // 8. adminUsers - Tài khoản admin (khác với users table - đây là auth)
  adminUsers: defineTable({
    createdAt: v.number(),
    email: v.string(),
    isSuperAdmin: v.optional(v.boolean()),
    lastLogin: v.optional(v.number()),
    name: v.string(),
    passwordHash: v.string(),
    roleId: v.id("roles"),
    status: v.union(v.literal("Active"), v.literal("Inactive")),
  })
    .index("by_email", ["email"])
    .index("by_role", ["roleId"])
    .index("by_status", ["status"]),

  // 9. adminSessions - Sessions cho /admin login
  adminSessions: defineTable({
    adminUserId: v.id("adminUsers"),
    createdAt: v.number(),
    expiresAt: v.number(),
    token: v.string(),
  })
    .index("by_token", ["token"])
    .index("by_adminUser", ["adminUserId"]),

  // 10. rateLimitBuckets - Rate limiting buckets
  rateLimitBuckets: defineTable({
    key: v.string(), // "mutation:{name}:{identifier}" or "global:{identifier}"
    tokens: v.number(),
    lastRefill: v.number(),
  }).index("by_key", ["key"]),

  // ============================================================
  // LEVEL 2: DATA TABLES (cho /admin)
  // ============================================================

  // 6. users - Quản trị viên hệ thống
  users: defineTable({
    avatar: v.optional(v.string()),
    email: v.string(),
    lastLogin: v.optional(v.number()),
    name: v.string(),
    phone: v.optional(v.string()),
    roleId: v.id("roles"),
    status: v.union(
      v.literal("Active"),
      v.literal("Inactive"),
      v.literal("Banned")
    ),
  })
    .index("by_email", ["email"])
    .index("by_role_status", ["roleId", "status"])
    .index("by_status", ["status"]),

  // 7. roles - RBAC
  roles: defineTable({
    color: v.optional(v.string()),
    description: v.string(),
    isSuperAdmin: v.optional(v.boolean()),
    isSystem: v.boolean(),
    name: v.string(),
    permissions: v.record(v.string(), v.array(v.string())),
  })
    .index("by_name", ["name"])
    .index("by_isSystem", ["isSystem"]),

  // 7a. userStats - Counter table cho user statistics (tránh full scan)
  userStats: defineTable({
    key: v.string(), // "total", "Active", "Inactive", "Banned"
    count: v.number(),
  }).index("by_key", ["key"]),

  // 7b. roleStats - Counter table cho role statistics (tránh full scan)
  roleStats: defineTable({
    key: v.string(), // "total", "system", "custom"
    count: v.number(),
  }).index("by_key", ["key"]),

  // 7c. homeComponentStats - Counter table cho homepage components (tránh full scan)
  homeComponentStats: defineTable({
    key: v.string(), // "total", "active", "inactive", or type names like "hero", "about"
    count: v.number(),
  }).index("by_key", ["key"]),

  // 7d. notificationStats - Counter table cho notifications (tránh full scan)
  notificationStats: defineTable({
    key: v.string(), // "total", "Draft", "Scheduled", "Sent", "Cancelled", "totalReads"
    count: v.number(),
  }).index("by_key", ["key"]),

  // 7e. promotionStats - Counter table cho promotions (tránh full scan)
  promotionStats: defineTable({
    key: v.string(), // "total", "Active", "Inactive", "Expired", "Scheduled", "totalUsed", "percent", "fixed"
    count: v.number(),
  }).index("by_key", ["key"]),

  // 8. customers - Khách hàng
  customers: defineTable({
    address: v.optional(v.string()),
    avatar: v.optional(v.string()),
    city: v.optional(v.string()),
    email: v.string(),
    name: v.string(),
    notes: v.optional(v.string()),
    ordersCount: v.number(),
    phone: v.string(),
    status: v.union(v.literal("Active"), v.literal("Inactive")),
    totalSpent: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"])
    .index("by_status_totalSpent", ["status", "totalSpent"])
    .index("by_city_status", ["city", "status"]),

  // 9. productCategories - Danh mục sản phẩm (Hierarchical)
  productCategories: defineTable({
    active: v.boolean(),
    description: v.optional(v.string()),
    image: v.optional(v.string()),
    name: v.string(),
    order: v.number(),
    parentId: v.optional(v.id("productCategories")),
    slug: v.string(),
  })
    .index("by_slug", ["slug"])
    .index("by_parent", ["parentId"])
    .index("by_parent_order", ["parentId", "order"])
    .index("by_active", ["active"]),

  // 10. products - Sản phẩm
  products: defineTable({
    name: v.string(),
    sku: v.string(),
    slug: v.string(),
    categoryId: v.id("productCategories"),
    price: v.number(),
    salePrice: v.optional(v.number()),
    stock: v.number(),
    status: v.union(
      v.literal("Active"),
      v.literal("Draft"),
      v.literal("Archived")
    ),
    image: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    sales: v.number(),
    description: v.optional(v.string()),
    order: v.number(),
    // SEO fields
    metaTitle: v.optional(v.string()),
    metaDescription: v.optional(v.string()),
  })
    .index("by_sku", ["sku"])
    .index("by_slug", ["slug"])
    .index("by_category_status", ["categoryId", "status"])
    .index("by_status_price", ["status", "price"])
    .index("by_status_stock", ["status", "stock"])
    .index("by_status_sales", ["status", "sales"])
    .index("by_status_order", ["status", "order"]),

  // 10a. productStats - Counter table cho product statistics (tránh full scan)
  productStats: defineTable({
    key: v.string(), // "total", "Active", "Draft", "Archived"
    count: v.number(),
    lastOrder: v.number(),
  }).index("by_key", ["key"]),

  // 11. postCategories - Danh mục bài viết (Hierarchical)
  postCategories: defineTable({
    active: v.boolean(),
    description: v.optional(v.string()),
    name: v.string(),
    order: v.number(),
    parentId: v.optional(v.id("postCategories")),
    slug: v.string(),
    thumbnail: v.optional(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_parent", ["parentId"])
    .index("by_parent_order", ["parentId", "order"])
    .index("by_active", ["active"]),

  // 12. posts - Bài viết
  posts: defineTable({
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    excerpt: v.optional(v.string()),
    thumbnail: v.optional(v.string()),
    categoryId: v.id("postCategories"),
    authorId: v.optional(v.id("users")),
    authorName: v.optional(v.string()),
    status: v.union(
      v.literal("Published"),
      v.literal("Draft"),
      v.literal("Archived")
    ),
    views: v.number(),
    publishedAt: v.optional(v.number()),
    order: v.number(),
    // SEO fields
    metaTitle: v.optional(v.string()),
    metaDescription: v.optional(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_category_status", ["categoryId", "status"])
    .index("by_author_name_status", ["authorName", "status"])
    .index("by_status_publishedAt", ["status", "publishedAt"])
    .index("by_status_views", ["status", "views"]),

  // 13. comments - Bình luận (Polymorphic) - SVC-011: Added "service" targetType
  comments: defineTable({
    authorEmail: v.optional(v.string()),
    authorIp: v.optional(v.string()),
    authorName: v.string(),
    content: v.string(),
    customerId: v.optional(v.id("customers")),
    likesCount: v.optional(v.number()),
    parentId: v.optional(v.id("comments")),
    rating: v.optional(v.number()),
    status: v.union(
      v.literal("Pending"),
      v.literal("Approved"),
      v.literal("Spam")
    ),
    targetId: v.string(),
    targetType: v.union(v.literal("post"), v.literal("product"), v.literal("service")),
  })
    .index("by_target_status", ["targetType", "targetId", "status"])
    .index("by_status", ["status"])
    .index("by_parent", ["parentId"])
    .index("by_customer", ["customerId"]),

  // 14. images - Thư viện media
  images: defineTable({
    alt: v.optional(v.string()),
    filename: v.string(),
    folder: v.optional(v.string()),
    height: v.optional(v.number()),
    mimeType: v.string(),
    size: v.number(),
    storageId: v.id("_storage"),
    uploadedBy: v.optional(v.id("users")),
    width: v.optional(v.number()),
  })
    .index("by_folder", ["folder"])
    .index("by_mimeType", ["mimeType"])
    .index("by_uploadedBy", ["uploadedBy"]),

  // 14a. mediaStats - Counter table cho media statistics (tránh full scan)
  mediaStats: defineTable({
    key: v.string(), // "total", "image", "video", "document", "other"
    count: v.number(),
    totalSize: v.number(),
  }).index("by_key", ["key"]),

  // 14b. mediaFolders - Track folders riêng (tránh scan ALL images)
  mediaFolders: defineTable({
    count: v.number(),
    name: v.string(),
  }).index("by_name", ["name"]),

  // 15. menus - Menu động
  menus: defineTable({
    location: v.string(),
    name: v.string(),
  }).index("by_location", ["location"]),

  // 16. menuItems - Menu items (Hierarchical)
  menuItems: defineTable({
    active: v.boolean(),
    depth: v.number(),
    icon: v.optional(v.string()),
    label: v.string(),
    menuId: v.id("menus"),
    openInNewTab: v.optional(v.boolean()),
    order: v.number(),
    parentId: v.optional(v.id("menuItems")),
    url: v.string(),
  })
    .index("by_menu_order", ["menuId", "order"])
    .index("by_menu_depth", ["menuId", "depth"])
    .index("by_parent", ["parentId"])
    .index("by_menu_active", ["menuId", "active"]),

  // 17. homeComponents - Trang chủ động
  homeComponents: defineTable({
    active: v.boolean(),
    config: v.any(),
    order: v.number(),
    title: v.string(),
    type: v.string(),
  })
    .index("by_active_order", ["active", "order"])
    .index("by_type", ["type"]),

  // 18. settings - Cấu hình hệ thống (Key-Value)
  settings: defineTable({
    group: v.string(),
    key: v.string(),
    value: v.any(),
  })
    .index("by_key", ["key"])
    .index("by_group", ["group"]),

  // 19. activityLogs - Audit Trail
  activityLogs: defineTable({
    action: v.string(),
    details: v.optional(v.any()),
    ip: v.optional(v.string()),
    targetId: v.string(),
    targetType: v.string(),
    userId: v.id("users"),
  })
    .index("by_user", ["userId"])
    .index("by_targetType", ["targetType"])
    .index("by_action", ["action"]),

  // 20. orders - Đơn hàng
  orders: defineTable({
    customerId: v.id("customers"),
    items: v.array(
      v.object({
        price: v.number(),
        productId: v.id("products"),
        productName: v.string(),
        quantity: v.number(),
      })
    ),
    note: v.optional(v.string()),
    orderNumber: v.string(),
    paymentMethod: v.optional(
      v.union(
        v.literal("COD"),
        v.literal("BankTransfer"),
        v.literal("CreditCard"),
        v.literal("EWallet")
      )
    ),
    paymentStatus: v.optional(
      v.union(
        v.literal("Pending"),
        v.literal("Paid"),
        v.literal("Failed"),
        v.literal("Refunded")
      )
    ),
    shippingAddress: v.optional(v.string()),
    shippingFee: v.number(),
    status: v.union(
      v.literal("Pending"),
      v.literal("Processing"),
      v.literal("Shipped"),
      v.literal("Delivered"),
      v.literal("Cancelled")
    ),
    subtotal: v.number(),
    totalAmount: v.number(),
    trackingNumber: v.optional(v.string()),
  })
    .index("by_orderNumber", ["orderNumber"])
    .index("by_customer", ["customerId"])
    .index("by_status", ["status"])
    .index("by_paymentStatus", ["paymentStatus"]),

  // 21. wishlist - Sản phẩm yêu thích
  wishlist: defineTable({
    customerId: v.id("customers"),
    note: v.optional(v.string()),
    productId: v.id("products"),
  })
    .index("by_customer", ["customerId"])
    .index("by_product", ["productId"])
    .index("by_customer_product", ["customerId", "productId"]),

  // 22. carts - Giỏ hàng
  carts: defineTable({
    customerId: v.optional(v.id("customers")),
    expiresAt: v.optional(v.number()),
    itemsCount: v.number(),
    note: v.optional(v.string()),
    sessionId: v.optional(v.string()),
    status: v.union(
      v.literal("Active"),
      v.literal("Converted"),
      v.literal("Abandoned")
    ),
    totalAmount: v.number(),
  })
    .index("by_customer", ["customerId"])
    .index("by_session", ["sessionId"])
    .index("by_status", ["status"])
    .index("by_expiresAt", ["expiresAt"])
    // FIX Issue #8: Compound indexes for efficient filtering
    .index("by_customer_status", ["customerId", "status"])
    .index("by_session_status", ["sessionId", "status"]),

  // 23. cartItems - Items trong giỏ hàng
  cartItems: defineTable({
    cartId: v.id("carts"),
    price: v.number(),
    productId: v.id("products"),
    productImage: v.optional(v.string()),
    productName: v.string(),
    quantity: v.number(),
    subtotal: v.number(),
  })
    .index("by_cart", ["cartId"])
    .index("by_product", ["productId"]),

  // 24. notifications - Thông báo hệ thống
  notifications: defineTable({
    content: v.string(),
    order: v.number(),
    readCount: v.number(),
    scheduledAt: v.optional(v.number()),
    sendEmail: v.optional(v.boolean()),
    sentAt: v.optional(v.number()),
    status: v.union(
      v.literal("Draft"),
      v.literal("Scheduled"),
      v.literal("Sent"),
      v.literal("Cancelled")
    ),
    targetIds: v.optional(v.array(v.string())),
    targetType: v.union(
      v.literal("all"),
      v.literal("customers"),
      v.literal("users"),
      v.literal("specific")
    ),
    title: v.string(),
    type: v.union(
      v.literal("info"),
      v.literal("success"),
      v.literal("warning"),
      v.literal("error")
    ),
  })
    .index("by_status", ["status"])
    .index("by_type", ["type"])
    .index("by_targetType", ["targetType"])
    .index("by_scheduledAt", ["scheduledAt"])
    .index("by_status_order", ["status", "order"]),

  // 25. pageViews - Tracking lượt truy cập
  pageViews: defineTable({
    browser: v.optional(v.string()),
    country: v.optional(v.string()),
    device: v.optional(v.union(v.literal("mobile"), v.literal("desktop"), v.literal("tablet"))),
    os: v.optional(v.string()),
    path: v.string(),
    referrer: v.optional(v.string()),
    sessionId: v.string(),
    userAgent: v.optional(v.string()),
  })
    .index("by_path", ["path"])
    .index("by_session", ["sessionId"]),

  // 26. serviceCategories - Danh mục dịch vụ (Hierarchical)
  serviceCategories: defineTable({
    active: v.boolean(),
    description: v.optional(v.string()),
    name: v.string(),
    order: v.number(),
    parentId: v.optional(v.id("serviceCategories")),
    slug: v.string(),
    thumbnail: v.optional(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_parent", ["parentId"])
    .index("by_parent_order", ["parentId", "order"])
    .index("by_active", ["active"]),

  // 27. services - Dịch vụ
  services: defineTable({
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    excerpt: v.optional(v.string()),
    thumbnail: v.optional(v.string()),
    categoryId: v.id("serviceCategories"),
    price: v.optional(v.number()),
    duration: v.optional(v.string()),
    status: v.union(
      v.literal("Published"),
      v.literal("Draft"),
      v.literal("Archived")
    ),
    views: v.number(),
    publishedAt: v.optional(v.number()),
    order: v.number(),
    featured: v.optional(v.boolean()),
    // SEO fields
    metaTitle: v.optional(v.string()),
    metaDescription: v.optional(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_category_status", ["categoryId", "status"])
    .index("by_status_publishedAt", ["status", "publishedAt"])
    .index("by_status_views", ["status", "views"])
    .index("by_status_order", ["status", "order"])
    .index("by_status_featured", ["status", "featured"]), // SVC-012: Index for featured services

  // 28. promotions - Khuyến mãi & Voucher
  promotions: defineTable({
    applicableIds: v.optional(v.array(v.string())),
    applicableTo: v.optional(
      v.union(v.literal("all"), v.literal("products"), v.literal("categories"))
    ),
    code: v.string(),
    description: v.optional(v.string()),
    discountType: v.union(v.literal("percent"), v.literal("fixed")),
    discountValue: v.number(),
    endDate: v.optional(v.number()),
    maxDiscountAmount: v.optional(v.number()),
    minOrderAmount: v.optional(v.number()),
    name: v.string(),
    order: v.number(),
    startDate: v.optional(v.number()),
    status: v.union(
      v.literal("Active"),
      v.literal("Inactive"),
      v.literal("Expired"),
      v.literal("Scheduled")
    ),
    usageLimit: v.optional(v.number()),
    usedCount: v.number(),
  })
    .index("by_code", ["code"])
    .index("by_status", ["status"])
    .index("by_status_order", ["status", "order"])
    .index("by_startDate", ["startDate"])
    .index("by_endDate", ["endDate"]),

  // ============================================================
  // SEED PROGRESS TRACKING
  // ============================================================

  seedProgress: defineTable({
    sessionId: v.string(),
    status: v.union(v.literal("running"), v.literal("completed"), v.literal("failed")),
    current: v.string(),
    completed: v.number(),
    total: v.number(),
    results: v.array(v.any()),
    errors: v.array(v.string()),
  }).index("by_session", ["sessionId"]),
});
