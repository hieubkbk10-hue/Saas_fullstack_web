import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ============================================================
  // LEVEL 1: SYSTEM CONFIGURATION (cho /system)
  // ============================================================

  // 1. adminModules - Quản lý modules bật/tắt
  adminModules: defineTable({
    key: v.string(),
    name: v.string(),
    description: v.string(),
    icon: v.string(),
    category: v.union(
      v.literal("content"),
      v.literal("commerce"),
      v.literal("user"),
      v.literal("system"),
      v.literal("marketing")
    ),
    enabled: v.boolean(),
    isCore: v.boolean(),
    dependencies: v.optional(v.array(v.string())),
    dependencyType: v.optional(v.union(v.literal("all"), v.literal("any"))),
    order: v.number(),
    updatedBy: v.optional(v.id("users")),
  })
    .index("by_key", ["key"])
    .index("by_category_enabled", ["category", "enabled"])
    .index("by_enabled_order", ["enabled", "order"]),

  // 2. moduleFields - Cấu hình fields động cho mỗi module
  moduleFields: defineTable({
    moduleKey: v.string(),
    fieldKey: v.string(),
    name: v.string(),
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
    required: v.boolean(),
    enabled: v.boolean(),
    isSystem: v.boolean(),
    linkedFeature: v.optional(v.string()),
    order: v.number(),
    group: v.optional(v.string()),
  })
    .index("by_module", ["moduleKey"])
    .index("by_module_enabled", ["moduleKey", "enabled"])
    .index("by_module_order", ["moduleKey", "order"]),

  // 3. moduleFeatures - Features bật/tắt cho từng module
  moduleFeatures: defineTable({
    moduleKey: v.string(),
    featureKey: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    enabled: v.boolean(),
    linkedFieldKey: v.optional(v.string()),
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
    key: v.string(),
    name: v.string(),
    description: v.string(),
    enabledModules: v.array(v.string()),
    isDefault: v.optional(v.boolean()),
  }).index("by_key", ["key"]),

  // 6. convexDashboard - Link tới Convex Dashboard để xem usage
  convexDashboard: defineTable({
    dashboardUrl: v.string(),
    email: v.optional(v.string()),
    password: v.optional(v.string()),
    notes: v.optional(v.string()),
  }),

  // ============================================================
  // LEVEL 2: DATA TABLES (cho /admin)
  // ============================================================

  // 6. users - Quản trị viên hệ thống
  users: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    avatar: v.optional(v.string()),
    roleId: v.id("roles"),
    status: v.union(
      v.literal("Active"),
      v.literal("Inactive"),
      v.literal("Banned")
    ),
    lastLogin: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_role_status", ["roleId", "status"])
    .index("by_status", ["status"]),

  // 7. roles - RBAC
  roles: defineTable({
    name: v.string(),
    description: v.string(),
    color: v.optional(v.string()),
    isSystem: v.boolean(),
    isSuperAdmin: v.optional(v.boolean()),
    permissions: v.record(v.string(), v.array(v.string())),
  })
    .index("by_name", ["name"])
    .index("by_isSystem", ["isSystem"]),

  // 8. customers - Khách hàng
  customers: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    avatar: v.optional(v.string()),
    status: v.union(v.literal("Active"), v.literal("Inactive")),
    ordersCount: v.number(),
    totalSpent: v.number(),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    notes: v.optional(v.string()),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"])
    .index("by_status_totalSpent", ["status", "totalSpent"])
    .index("by_city_status", ["city", "status"]),

  // 9. productCategories - Danh mục sản phẩm (Hierarchical)
  productCategories: defineTable({
    name: v.string(),
    slug: v.string(),
    parentId: v.optional(v.id("productCategories")),
    description: v.optional(v.string()),
    image: v.optional(v.string()),
    order: v.number(),
    active: v.boolean(),
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
  })
    .index("by_sku", ["sku"])
    .index("by_slug", ["slug"])
    .index("by_category_status", ["categoryId", "status"])
    .index("by_status_price", ["status", "price"])
    .index("by_status_stock", ["status", "stock"])
    .index("by_status_sales", ["status", "sales"])
    .index("by_status_order", ["status", "order"]),

  // 11. postCategories - Danh mục bài viết (Hierarchical)
  postCategories: defineTable({
    name: v.string(),
    slug: v.string(),
    parentId: v.optional(v.id("postCategories")),
    description: v.optional(v.string()),
    thumbnail: v.optional(v.string()),
    order: v.number(),
    active: v.boolean(),
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
    authorId: v.id("users"),
    status: v.union(
      v.literal("Published"),
      v.literal("Draft"),
      v.literal("Archived")
    ),
    views: v.number(),
    publishedAt: v.optional(v.number()),
    order: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_category_status", ["categoryId", "status"])
    .index("by_author_status", ["authorId", "status"])
    .index("by_status_publishedAt", ["status", "publishedAt"])
    .index("by_status_views", ["status", "views"]),

  // 13. comments - Bình luận (Polymorphic)
  comments: defineTable({
    content: v.string(),
    authorName: v.string(),
    authorEmail: v.optional(v.string()),
    authorIp: v.optional(v.string()),
    targetType: v.union(v.literal("post"), v.literal("product")),
    targetId: v.string(),
    parentId: v.optional(v.id("comments")),
    status: v.union(
      v.literal("Pending"),
      v.literal("Approved"),
      v.literal("Spam")
    ),
    customerId: v.optional(v.id("customers")),
  })
    .index("by_target_status", ["targetType", "targetId", "status"])
    .index("by_status", ["status"])
    .index("by_parent", ["parentId"])
    .index("by_customer", ["customerId"]),

  // 14. images - Thư viện media
  images: defineTable({
    storageId: v.id("_storage"),
    filename: v.string(),
    mimeType: v.string(),
    size: v.number(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    alt: v.optional(v.string()),
    folder: v.optional(v.string()),
    uploadedBy: v.optional(v.id("users")),
  })
    .index("by_folder", ["folder"])
    .index("by_mimeType", ["mimeType"])
    .index("by_uploadedBy", ["uploadedBy"]),

  // 15. menus - Menu động
  menus: defineTable({
    name: v.string(),
    location: v.string(),
  }).index("by_location", ["location"]),

  // 16. menuItems - Menu items (Hierarchical)
  menuItems: defineTable({
    menuId: v.id("menus"),
    label: v.string(),
    url: v.string(),
    order: v.number(),
    depth: v.number(),
    parentId: v.optional(v.id("menuItems")),
    icon: v.optional(v.string()),
    openInNewTab: v.optional(v.boolean()),
    active: v.boolean(),
  })
    .index("by_menu_order", ["menuId", "order"])
    .index("by_menu_depth", ["menuId", "depth"])
    .index("by_parent", ["parentId"])
    .index("by_menu_active", ["menuId", "active"]),

  // 17. homeComponents - Trang chủ động
  homeComponents: defineTable({
    type: v.string(),
    title: v.string(),
    active: v.boolean(),
    order: v.number(),
    config: v.any(),
  })
    .index("by_active_order", ["active", "order"])
    .index("by_type", ["type"]),

  // 18. settings - Cấu hình hệ thống (Key-Value)
  settings: defineTable({
    key: v.string(),
    value: v.any(),
    group: v.string(),
  })
    .index("by_key", ["key"])
    .index("by_group", ["group"]),

  // 19. activityLogs - Audit Trail
  activityLogs: defineTable({
    userId: v.id("users"),
    action: v.string(),
    targetType: v.string(),
    targetId: v.string(),
    details: v.optional(v.any()),
    ip: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_targetType", ["targetType"])
    .index("by_action", ["action"]),

  // 20. orders - Đơn hàng
  orders: defineTable({
    orderNumber: v.string(),
    customerId: v.id("customers"),
    items: v.array(
      v.object({
        productId: v.id("products"),
        productName: v.string(),
        quantity: v.number(),
        price: v.number(),
      })
    ),
    subtotal: v.number(),
    shippingFee: v.number(),
    totalAmount: v.number(),
    status: v.union(
      v.literal("Pending"),
      v.literal("Processing"),
      v.literal("Shipped"),
      v.literal("Delivered"),
      v.literal("Cancelled")
    ),
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
    trackingNumber: v.optional(v.string()),
    note: v.optional(v.string()),
  })
    .index("by_orderNumber", ["orderNumber"])
    .index("by_customer", ["customerId"])
    .index("by_status", ["status"])
    .index("by_paymentStatus", ["paymentStatus"]),

  // 21. wishlist - Sản phẩm yêu thích
  wishlist: defineTable({
    customerId: v.id("customers"),
    productId: v.id("products"),
    note: v.optional(v.string()),
  })
    .index("by_customer", ["customerId"])
    .index("by_product", ["productId"])
    .index("by_customer_product", ["customerId", "productId"]),

  // 22. carts - Giỏ hàng
  carts: defineTable({
    customerId: v.optional(v.id("customers")),
    sessionId: v.optional(v.string()),
    status: v.union(
      v.literal("Active"),
      v.literal("Converted"),
      v.literal("Abandoned")
    ),
    itemsCount: v.number(),
    totalAmount: v.number(),
    expiresAt: v.optional(v.number()),
    note: v.optional(v.string()),
  })
    .index("by_customer", ["customerId"])
    .index("by_session", ["sessionId"])
    .index("by_status", ["status"])
    .index("by_expiresAt", ["expiresAt"]),

  // 23. cartItems - Items trong giỏ hàng
  cartItems: defineTable({
    cartId: v.id("carts"),
    productId: v.id("products"),
    productName: v.string(),
    productImage: v.optional(v.string()),
    quantity: v.number(),
    price: v.number(),
    subtotal: v.number(),
  })
    .index("by_cart", ["cartId"])
    .index("by_product", ["productId"]),

  // 24. notifications - Thông báo hệ thống
  notifications: defineTable({
    title: v.string(),
    content: v.string(),
    type: v.union(
      v.literal("info"),
      v.literal("success"),
      v.literal("warning"),
      v.literal("error")
    ),
    targetType: v.union(
      v.literal("all"),
      v.literal("customers"),
      v.literal("users"),
      v.literal("specific")
    ),
    targetIds: v.optional(v.array(v.string())),
    status: v.union(
      v.literal("Draft"),
      v.literal("Scheduled"),
      v.literal("Sent"),
      v.literal("Cancelled")
    ),
    sendEmail: v.optional(v.boolean()),
    scheduledAt: v.optional(v.number()),
    sentAt: v.optional(v.number()),
    readCount: v.number(),
    order: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_type", ["type"])
    .index("by_targetType", ["targetType"])
    .index("by_scheduledAt", ["scheduledAt"])
    .index("by_status_order", ["status", "order"]),

  // 25. pageViews - Tracking lượt truy cập
  pageViews: defineTable({
    path: v.string(),
    sessionId: v.string(),
    referrer: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    country: v.optional(v.string()),
    device: v.optional(v.union(v.literal("mobile"), v.literal("desktop"), v.literal("tablet"))),
    os: v.optional(v.string()),
    browser: v.optional(v.string()),
  })
    .index("by_path", ["path"])
    .index("by_session", ["sessionId"]),

  // 26. promotions - Khuyến mãi & Voucher
  promotions: defineTable({
    name: v.string(),
    code: v.string(),
    description: v.optional(v.string()),
    discountType: v.union(v.literal("percent"), v.literal("fixed")),
    discountValue: v.number(),
    minOrderAmount: v.optional(v.number()),
    maxDiscountAmount: v.optional(v.number()),
    usageLimit: v.optional(v.number()),
    usedCount: v.number(),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    status: v.union(
      v.literal("Active"),
      v.literal("Inactive"),
      v.literal("Expired"),
      v.literal("Scheduled")
    ),
    applicableTo: v.optional(
      v.union(v.literal("all"), v.literal("products"), v.literal("categories"))
    ),
    applicableIds: v.optional(v.array(v.string())),
    order: v.number(),
  })
    .index("by_code", ["code"])
    .index("by_status", ["status"])
    .index("by_status_order", ["status", "order"])
    .index("by_startDate", ["startDate"])
    .index("by_endDate", ["endDate"]),
});
