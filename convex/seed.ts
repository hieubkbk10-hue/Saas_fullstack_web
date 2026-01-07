import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedModules = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Check if already seeded
    const existing = await ctx.db.query("adminModules").first();
    if (existing) {
      console.log("Modules already seeded");
      return null;
    }

    const modules = [
      { key: "posts", name: "Bài viết & Danh mục", description: "Quản lý bài viết, tin tức, blog và danh mục bài viết", icon: "FileText", category: "content" as const, enabled: true, isCore: false, order: 1 },
      { key: "comments", name: "Bình luận", description: "Bình luận cho bài viết và đánh giá sản phẩm", icon: "MessageSquare", category: "content" as const, enabled: true, isCore: false, dependencies: ["posts", "products"], dependencyType: "any" as const, order: 2 },
      { key: "media", name: "Thư viện Media", description: "Quản lý hình ảnh, video, tài liệu", icon: "Image", category: "content" as const, enabled: true, isCore: false, order: 3 },
      
      { key: "products", name: "Sản phẩm & Danh mục", description: "Quản lý sản phẩm, danh mục sản phẩm, kho hàng", icon: "Package", category: "commerce" as const, enabled: true, isCore: false, order: 4 },
      { key: "orders", name: "Đơn hàng", description: "Quản lý đơn hàng, vận chuyển", icon: "ShoppingBag", category: "commerce" as const, enabled: true, isCore: false, dependencies: ["products", "customers"], dependencyType: "all" as const, order: 5 },
      { key: "cart", name: "Giỏ hàng", description: "Chức năng giỏ hàng cho khách", icon: "ShoppingCart", category: "commerce" as const, enabled: true, isCore: false, dependencies: ["products"], dependencyType: "all" as const, order: 6 },
      { key: "wishlist", name: "Sản phẩm yêu thích", description: "Danh sách sản phẩm yêu thích của khách", icon: "Heart", category: "commerce" as const, enabled: false, isCore: false, dependencies: ["products"], dependencyType: "all" as const, order: 7 },
      
      { key: "customers", name: "Khách hàng", description: "Quản lý thông tin khách hàng", icon: "Users", category: "user" as const, enabled: true, isCore: true, order: 8 },
      { key: "users", name: "Người dùng Admin", description: "Quản lý tài khoản admin", icon: "UserCog", category: "user" as const, enabled: true, isCore: true, order: 9 },
      { key: "roles", name: "Vai trò & Quyền", description: "Phân quyền và quản lý vai trò", icon: "Shield", category: "user" as const, enabled: true, isCore: true, order: 10 },
      
      { key: "settings", name: "Cài đặt hệ thống", description: "Cấu hình website và hệ thống", icon: "Settings", category: "system" as const, enabled: true, isCore: true, order: 11 },
      { key: "menus", name: "Menu điều hướng", description: "Quản lý menu header, footer", icon: "Menu", category: "system" as const, enabled: true, isCore: false, order: 12 },
      { key: "homepage", name: "Trang chủ", description: "Cấu hình components trang chủ", icon: "LayoutGrid", category: "system" as const, enabled: true, isCore: false, order: 13 },
      
      { key: "notifications", name: "Thông báo", description: "Gửi thông báo cho người dùng", icon: "Bell", category: "marketing" as const, enabled: true, isCore: false, order: 14 },
      { key: "promotions", name: "Khuyến mãi", description: "Quản lý mã giảm giá, voucher", icon: "Megaphone", category: "marketing" as const, enabled: false, isCore: false, dependencies: ["products", "orders"], dependencyType: "all" as const, order: 15 },
      { key: "analytics", name: "Thống kê", description: "Báo cáo và phân tích dữ liệu", icon: "BarChart3", category: "marketing" as const, enabled: true, isCore: false, order: 16 },
    ];

    for (const mod of modules) {
      await ctx.db.insert("adminModules", mod);
    }

    console.log("Seeded", modules.length, "modules");
    return null;
  },
});

export const seedPresets = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Check if already seeded
    const existing = await ctx.db.query("systemPresets").first();
    if (existing) {
      console.log("Presets already seeded");
      return null;
    }

    const presets = [
      {
        key: "blog",
        name: "Blog / News",
        description: "Blog với bài viết và bình luận",
        enabledModules: ["posts", "comments", "media", "customers", "users", "roles", "settings", "menus", "homepage", "analytics"],
        isDefault: false,
      },
      {
        key: "landing",
        name: "Landing Page",
        description: "Trang giới thiệu đơn giản",
        enabledModules: ["posts", "media", "users", "roles", "settings", "menus", "homepage"],
        isDefault: false,
      },
      {
        key: "catalog",
        name: "Catalog",
        description: "Trưng bày sản phẩm không giỏ hàng",
        enabledModules: ["products", "media", "customers", "users", "roles", "settings", "menus", "homepage", "notifications", "analytics"],
        isDefault: false,
      },
      {
        key: "ecommerce-basic",
        name: "eCommerce Basic",
        description: "Shop đơn giản với giỏ hàng",
        enabledModules: ["products", "orders", "cart", "media", "customers", "users", "roles", "settings", "menus", "homepage", "notifications", "analytics"],
        isDefault: false,
      },
      {
        key: "ecommerce-full",
        name: "eCommerce Full",
        description: "Shop đầy đủ: giỏ hàng, wishlist, khuyến mãi",
        enabledModules: ["posts", "comments", "media", "products", "orders", "cart", "wishlist", "customers", "users", "roles", "settings", "menus", "homepage", "notifications", "promotions", "analytics"],
        isDefault: true,
      },
    ];

    for (const preset of presets) {
      await ctx.db.insert("systemPresets", preset);
    }

    console.log("Seeded", presets.length, "presets");
    return null;
  },
});

export const seedAnalyticsFeatures = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("moduleFeatures")
      .withIndex("by_module", (q) => q.eq("moduleKey", "analytics"))
      .first();
    if (existing) return null;

    const features = [
      { moduleKey: "analytics", featureKey: "enableSales", name: "Báo cáo doanh thu", description: "Thống kê đơn hàng, doanh thu", enabled: true },
      { moduleKey: "analytics", featureKey: "enableCustomers", name: "Báo cáo khách hàng", description: "Khách mới, khách quay lại", enabled: true },
      { moduleKey: "analytics", featureKey: "enableProducts", name: "Báo cáo sản phẩm", description: "SP bán chạy, tồn kho", enabled: true },
      { moduleKey: "analytics", featureKey: "enableTraffic", name: "Báo cáo lượt truy cập", description: "Pageviews, sessions", enabled: false },
    ];

    for (const feature of features) {
      await ctx.db.insert("moduleFeatures", feature);
    }

    // Seed default settings
    await ctx.db.insert("moduleSettings", { moduleKey: "analytics", settingKey: "defaultPeriod", value: "30d" });
    await ctx.db.insert("moduleSettings", { moduleKey: "analytics", settingKey: "autoRefresh", value: true });

    return null;
  },
});

// Seed Posts module: categories, posts, features, fields, settings
export const seedPostsModule = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // 1. Seed roles if not exist (needed for authorId)
    let adminRoleId = (await ctx.db.query("roles").withIndex("by_name", q => q.eq("name", "Admin")).first())?._id;
    if (!adminRoleId) {
      adminRoleId = await ctx.db.insert("roles", {
        name: "Admin",
        description: "Quản trị viên hệ thống",
        color: "#3b82f6",
        isSystem: true,
        isSuperAdmin: true,
        permissions: { "*": ["*"] },
      });
    }

    // 2. Seed users if not exist
    let adminUserId = (await ctx.db.query("users").withIndex("by_email", q => q.eq("email", "admin@example.com")).first())?._id;
    if (!adminUserId) {
      adminUserId = await ctx.db.insert("users", {
        name: "Admin User",
        email: "admin@example.com",
        roleId: adminRoleId,
        status: "Active",
      });
    }

    // 3. Seed post categories
    const existingCategories = await ctx.db.query("postCategories").first();
    if (!existingCategories) {
      const categories = [
        { name: "Tin tức", slug: "tin-tuc", description: "Tin tức mới nhất", order: 0, active: true },
        { name: "Hướng dẫn", slug: "huong-dan", description: "Các bài hướng dẫn chi tiết", order: 1, active: true },
        { name: "Khuyến mãi", slug: "khuyen-mai", description: "Thông tin khuyến mãi", order: 2, active: true },
        { name: "Sự kiện", slug: "su-kien", description: "Các sự kiện sắp diễn ra", order: 3, active: true },
        { name: "Công nghệ", slug: "cong-nghe", description: "Tin công nghệ", order: 4, active: false },
      ];
      for (const cat of categories) {
        await ctx.db.insert("postCategories", cat);
      }
    }

    // 4. Seed posts
    const existingPosts = await ctx.db.query("posts").first();
    if (!existingPosts) {
      const tinTucCat = await ctx.db.query("postCategories").withIndex("by_slug", q => q.eq("slug", "tin-tuc")).first();
      const huongDanCat = await ctx.db.query("postCategories").withIndex("by_slug", q => q.eq("slug", "huong-dan")).first();
      const khuyenMaiCat = await ctx.db.query("postCategories").withIndex("by_slug", q => q.eq("slug", "khuyen-mai")).first();
      
      if (tinTucCat && huongDanCat && khuyenMaiCat) {
        const posts = [
          { title: "Ra mắt sản phẩm mới tháng 1/2025", slug: "ra-mat-san-pham-moi-thang-1-2025", content: "<p>Chúng tôi vui mừng giới thiệu dòng sản phẩm mới nhất với nhiều tính năng đột phá...</p>", excerpt: "Khám phá dòng sản phẩm mới với công nghệ tiên tiến", thumbnail: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400", categoryId: tinTucCat._id, authorId: adminUserId, status: "Published" as const, views: 1250, publishedAt: Date.now() - 86400000, order: 0 },
          { title: "Hướng dẫn sử dụng ứng dụng di động", slug: "huong-dan-su-dung-ung-dung-di-dong", content: "<p>Bài viết này sẽ hướng dẫn bạn từng bước cách sử dụng ứng dụng di động của chúng tôi...</p>", excerpt: "Hướng dẫn chi tiết từ A-Z", thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400", categoryId: huongDanCat._id, authorId: adminUserId, status: "Published" as const, views: 890, publishedAt: Date.now() - 172800000, order: 1 },
          { title: "Giảm giá 50% nhân dịp năm mới", slug: "giam-gia-50-nhan-dip-nam-moi", content: "<p>Chương trình khuyến mãi đặc biệt giảm giá lên đến 50% cho tất cả sản phẩm...</p>", excerpt: "Ưu đãi khủng mừng năm mới 2025", thumbnail: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=400", categoryId: khuyenMaiCat._id, authorId: adminUserId, status: "Published" as const, views: 2100, publishedAt: Date.now() - 259200000, order: 2 },
          { title: "Cập nhật chính sách bảo hành mới", slug: "cap-nhat-chinh-sach-bao-hanh-moi", content: "<p>Chính sách bảo hành mới sẽ có hiệu lực từ ngày 01/02/2025 với nhiều cải tiến...</p>", excerpt: "Thông tin chính sách bảo hành", thumbnail: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400", categoryId: tinTucCat._id, authorId: adminUserId, status: "Draft" as const, views: 0, order: 3 },
          { title: "Hướng dẫn thanh toán online", slug: "huong-dan-thanh-toan-online", content: "<p>Các phương thức thanh toán online được hỗ trợ và hướng dẫn chi tiết...</p>", excerpt: "Thanh toán nhanh chóng, an toàn", thumbnail: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400", categoryId: huongDanCat._id, authorId: adminUserId, status: "Published" as const, views: 650, publishedAt: Date.now() - 345600000, order: 4 },
          { title: "Top 10 sản phẩm bán chạy nhất 2024", slug: "top-10-san-pham-ban-chay-nhat-2024", content: "<p>Điểm lại những sản phẩm được yêu thích nhất trong năm qua...</p>", excerpt: "Những sản phẩm hot nhất năm", thumbnail: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400", categoryId: tinTucCat._id, authorId: adminUserId, status: "Archived" as const, views: 3200, publishedAt: Date.now() - 604800000, order: 5 },
        ];
        for (const post of posts) {
          await ctx.db.insert("posts", post);
        }
      }
    }

    // 5. Seed posts module features
    const existingFeatures = await ctx.db.query("moduleFeatures").withIndex("by_module", q => q.eq("moduleKey", "posts")).first();
    if (!existingFeatures) {
      const features = [
        { moduleKey: "posts", featureKey: "enableTags", name: "Tags", description: "Gắn thẻ cho bài viết", enabled: true, linkedFieldKey: "tags" },
        { moduleKey: "posts", featureKey: "enableFeatured", name: "Nổi bật", description: "Đánh dấu bài viết nổi bật", enabled: true, linkedFieldKey: "featured" },
        { moduleKey: "posts", featureKey: "enableScheduling", name: "Hẹn giờ", description: "Hẹn giờ xuất bản bài viết", enabled: true, linkedFieldKey: "publish_date" },
      ];
      for (const feature of features) {
        await ctx.db.insert("moduleFeatures", feature);
      }
    }

    // 6. Seed posts module fields
    const existingFields = await ctx.db.query("moduleFields").withIndex("by_module", q => q.eq("moduleKey", "posts")).first();
    if (!existingFields) {
      const fields = [
        { moduleKey: "posts", fieldKey: "title", name: "Tiêu đề", type: "text" as const, required: true, enabled: true, isSystem: true, order: 0 },
        { moduleKey: "posts", fieldKey: "content", name: "Nội dung", type: "richtext" as const, required: true, enabled: true, isSystem: true, order: 1 },
        { moduleKey: "posts", fieldKey: "order", name: "Thứ tự", type: "number" as const, required: true, enabled: true, isSystem: true, order: 2 },
        { moduleKey: "posts", fieldKey: "active", name: "Trạng thái", type: "boolean" as const, required: true, enabled: true, isSystem: true, order: 3 },
        { moduleKey: "posts", fieldKey: "excerpt", name: "Mô tả ngắn", type: "textarea" as const, required: false, enabled: true, isSystem: false, order: 4 },
        { moduleKey: "posts", fieldKey: "thumbnail", name: "Ảnh đại diện", type: "image" as const, required: false, enabled: true, isSystem: false, order: 5 },
        { moduleKey: "posts", fieldKey: "category_id", name: "Danh mục", type: "select" as const, required: false, enabled: true, isSystem: false, order: 6 },
        { moduleKey: "posts", fieldKey: "tags", name: "Tags", type: "tags" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableTags", order: 7 },
        { moduleKey: "posts", fieldKey: "featured", name: "Nổi bật", type: "boolean" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableFeatured", order: 8 },
        { moduleKey: "posts", fieldKey: "publish_date", name: "Ngày xuất bản", type: "date" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableScheduling", order: 9 },
      ];
      for (const field of fields) {
        await ctx.db.insert("moduleFields", field);
      }

      // Category fields
      const categoryFields = [
        { moduleKey: "postCategories", fieldKey: "name", name: "Tên", type: "text" as const, required: true, enabled: true, isSystem: true, order: 0 },
        { moduleKey: "postCategories", fieldKey: "order", name: "Thứ tự", type: "number" as const, required: true, enabled: true, isSystem: true, order: 1 },
        { moduleKey: "postCategories", fieldKey: "active", name: "Trạng thái", type: "boolean" as const, required: true, enabled: true, isSystem: true, order: 2 },
        { moduleKey: "postCategories", fieldKey: "description", name: "Mô tả", type: "textarea" as const, required: false, enabled: true, isSystem: false, order: 3 },
        { moduleKey: "postCategories", fieldKey: "thumbnail", name: "Ảnh đại diện", type: "image" as const, required: false, enabled: false, isSystem: false, order: 4 },
      ];
      for (const field of categoryFields) {
        await ctx.db.insert("moduleFields", field);
      }
    }

    // 7. Seed posts module settings
    const existingSettings = await ctx.db.query("moduleSettings").withIndex("by_module", q => q.eq("moduleKey", "posts")).first();
    if (!existingSettings) {
      await ctx.db.insert("moduleSettings", { moduleKey: "posts", settingKey: "postsPerPage", value: 10 });
      await ctx.db.insert("moduleSettings", { moduleKey: "posts", settingKey: "defaultStatus", value: "draft" });
    }

    return null;
  },
});

// Seed Comments (for both posts and products)
export const seedComments = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const existing = await ctx.db.query("comments").first();
    if (existing) return null;

    // Get posts and products to link comments
    const posts = await ctx.db.query("posts").collect();
    const products = await ctx.db.query("products").collect();

    // Post comments
    if (posts.length > 0) {
      const postComments = [
        { content: "Bài viết rất hay và hữu ích! Cảm ơn admin.", authorName: "Nguyễn Văn A", authorEmail: "nguyenvana@gmail.com", authorIp: "192.168.1.100", targetType: "post" as const, targetId: posts[0]?._id, status: "Approved" as const },
        { content: "Mình đã áp dụng và thấy hiệu quả ngay. Tuyệt vời!", authorName: "Trần Thị B", authorEmail: "tranthib@gmail.com", authorIp: "192.168.1.101", targetType: "post" as const, targetId: posts[0]?._id, status: "Approved" as const },
        { content: "Có thể viết thêm về chủ đề này được không ạ?", authorName: "Lê Văn C", authorEmail: "levanc@gmail.com", authorIp: "192.168.1.102", targetType: "post" as const, targetId: posts[1]?._id, status: "Pending" as const },
        { content: "Hướng dẫn chi tiết quá, thank admin!", authorName: "Phạm Thị D", authorEmail: "phamthid@gmail.com", authorIp: "192.168.1.103", targetType: "post" as const, targetId: posts[1]?._id, status: "Approved" as const },
        { content: "Khuyến mãi này còn hiệu lực không ạ?", authorName: "Hoàng Văn E", authorEmail: "hoangvane@gmail.com", authorIp: "192.168.1.104", targetType: "post" as const, targetId: posts[2]?._id, status: "Pending" as const },
        { content: "Spam link quảng cáo", authorName: "Spammer", authorEmail: "spam@spam.com", authorIp: "10.0.0.1", targetType: "post" as const, targetId: posts[0]?._id, status: "Spam" as const },
      ];
      for (const comment of postComments) {
        if (comment.targetId) {
          await ctx.db.insert("comments", comment);
        }
      }
    }

    // Product reviews
    if (products.length > 0) {
      const productReviews = [
        { content: "Sản phẩm chất lượng, đóng gói cẩn thận. Giao hàng nhanh!", authorName: "Trần Minh Tuấn", authorEmail: "tuantran@gmail.com", authorIp: "192.168.1.110", targetType: "product" as const, targetId: products[0]?._id, status: "Approved" as const },
        { content: "Máy đẹp, pin trâu, camera chụp rõ nét. 5 sao!", authorName: "Nguyễn Thị Hoa", authorEmail: "hoanguyen@gmail.com", authorIp: "192.168.1.111", targetType: "product" as const, targetId: products[0]?._id, status: "Approved" as const },
        { content: "Đã dùng được 2 tuần, rất hài lòng với sản phẩm.", authorName: "Lê Văn Hùng", authorEmail: "hungle@gmail.com", authorIp: "192.168.1.112", targetType: "product" as const, targetId: products[1]?._id, status: "Approved" as const },
        { content: "Sản phẩm như mô tả, shop tư vấn nhiệt tình.", authorName: "Phạm Thanh Mai", authorEmail: "maipham@gmail.com", authorIp: "192.168.1.113", targetType: "product" as const, targetId: products[2]?._id, status: "Approved" as const },
        { content: "Vải đẹp, form chuẩn, mặc thoải mái. Sẽ mua thêm màu khác.", authorName: "Hoàng Anh Dũng", authorEmail: "dunghoang@gmail.com", authorIp: "192.168.1.114", targetType: "product" as const, targetId: products[3]?._id, status: "Approved" as const },
        { content: "Giao hàng hơi chậm nhưng sản phẩm ok.", authorName: "Vũ Thị Lan", authorEmail: "lanvu@gmail.com", authorIp: "192.168.1.115", targetType: "product" as const, targetId: products[4]?._id, status: "Pending" as const },
        { content: "Nồi chiên rất tốt, tiết kiệm dầu. Recommend!", authorName: "Đỗ Văn Bình", authorEmail: "binhdo@gmail.com", authorIp: "192.168.1.116", targetType: "product" as const, targetId: products[5]?._id, status: "Approved" as const },
        { content: "Robot hút sạch, app điều khiển dễ dùng.", authorName: "Ngô Thị Hạnh", authorEmail: "hanhngo@gmail.com", authorIp: "192.168.1.117", targetType: "product" as const, targetId: products[6]?._id, status: "Pending" as const },
        { content: "Quảng cáo spam - không liên quan sản phẩm", authorName: "Fake Reviewer", authorEmail: "fake@spam.com", authorIp: "10.0.0.2", targetType: "product" as const, targetId: products[0]?._id, status: "Spam" as const },
      ];
      for (const review of productReviews) {
        if (review.targetId) {
          await ctx.db.insert("comments", review);
        }
      }
    }

    return null;
  },
});

// Clear Comments
export const clearComments = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const comments = await ctx.db.query("comments").collect();
    for (const c of comments) {
      await ctx.db.delete(c._id);
    }
    return null;
  },
});

// Clear posts DATA only (posts, categories) - keeps config (features, fields, settings)
export const clearPostsData = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Delete posts
    const posts = await ctx.db.query("posts").collect();
    for (const post of posts) {
      await ctx.db.delete(post._id);
    }

    // Delete post categories
    const categories = await ctx.db.query("postCategories").collect();
    for (const cat of categories) {
      await ctx.db.delete(cat._id);
    }

    return null;
  },
});

// Clear posts module CONFIG (features, fields, settings) - for full reset
export const clearPostsConfig = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Delete posts module features
    const features = await ctx.db.query("moduleFeatures").withIndex("by_module", q => q.eq("moduleKey", "posts")).collect();
    for (const f of features) {
      await ctx.db.delete(f._id);
    }

    // Delete posts module fields
    const fields = await ctx.db.query("moduleFields").withIndex("by_module", q => q.eq("moduleKey", "posts")).collect();
    for (const f of fields) {
      await ctx.db.delete(f._id);
    }
    const catFields = await ctx.db.query("moduleFields").withIndex("by_module", q => q.eq("moduleKey", "postCategories")).collect();
    for (const f of catFields) {
      await ctx.db.delete(f._id);
    }

    // Delete posts module settings
    const settings = await ctx.db.query("moduleSettings").withIndex("by_module", q => q.eq("moduleKey", "posts")).collect();
    for (const s of settings) {
      await ctx.db.delete(s._id);
    }

    return null;
  },
});

// Clear ALL posts module (data + config) - legacy, use clearPostsData + clearPostsConfig instead
export const clearPostsModule = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Delete posts
    const posts = await ctx.db.query("posts").collect();
    for (const post of posts) {
      await ctx.db.delete(post._id);
    }

    // Delete post categories
    const categories = await ctx.db.query("postCategories").collect();
    for (const cat of categories) {
      await ctx.db.delete(cat._id);
    }

    // Delete posts module features
    const features = await ctx.db.query("moduleFeatures").withIndex("by_module", q => q.eq("moduleKey", "posts")).collect();
    for (const f of features) {
      await ctx.db.delete(f._id);
    }

    // Delete posts module fields
    const fields = await ctx.db.query("moduleFields").withIndex("by_module", q => q.eq("moduleKey", "posts")).collect();
    for (const f of fields) {
      await ctx.db.delete(f._id);
    }
    const catFields = await ctx.db.query("moduleFields").withIndex("by_module", q => q.eq("moduleKey", "postCategories")).collect();
    for (const f of catFields) {
      await ctx.db.delete(f._id);
    }

    // Delete posts module settings
    const settings = await ctx.db.query("moduleSettings").withIndex("by_module", q => q.eq("moduleKey", "posts")).collect();
    for (const s of settings) {
      await ctx.db.delete(s._id);
    }

    return null;
  },
});

export const seedAll = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Seed modules
    const existingModules = await ctx.db.query("adminModules").first();
    if (!existingModules) {
      const modules = [
        { key: "posts", name: "Bài viết & Danh mục", description: "Quản lý bài viết, tin tức, blog và danh mục bài viết", icon: "FileText", category: "content" as const, enabled: true, isCore: false, order: 1 },
        { key: "comments", name: "Bình luận", description: "Bình luận cho bài viết và đánh giá sản phẩm", icon: "MessageSquare", category: "content" as const, enabled: true, isCore: false, dependencies: ["posts", "products"], dependencyType: "any" as const, order: 2 },
        { key: "media", name: "Thư viện Media", description: "Quản lý hình ảnh, video, tài liệu", icon: "Image", category: "content" as const, enabled: true, isCore: false, order: 3 },
        { key: "products", name: "Sản phẩm & Danh mục", description: "Quản lý sản phẩm, danh mục sản phẩm, kho hàng", icon: "Package", category: "commerce" as const, enabled: true, isCore: false, order: 4 },
        { key: "orders", name: "Đơn hàng", description: "Quản lý đơn hàng, vận chuyển", icon: "ShoppingBag", category: "commerce" as const, enabled: true, isCore: false, dependencies: ["products", "customers"], dependencyType: "all" as const, order: 5 },
        { key: "cart", name: "Giỏ hàng", description: "Chức năng giỏ hàng cho khách", icon: "ShoppingCart", category: "commerce" as const, enabled: true, isCore: false, dependencies: ["products"], dependencyType: "all" as const, order: 6 },
        { key: "wishlist", name: "Sản phẩm yêu thích", description: "Danh sách sản phẩm yêu thích của khách", icon: "Heart", category: "commerce" as const, enabled: false, isCore: false, dependencies: ["products"], dependencyType: "all" as const, order: 7 },
        { key: "customers", name: "Khách hàng", description: "Quản lý thông tin khách hàng", icon: "Users", category: "user" as const, enabled: true, isCore: true, order: 8 },
        { key: "users", name: "Người dùng Admin", description: "Quản lý tài khoản admin", icon: "UserCog", category: "user" as const, enabled: true, isCore: true, order: 9 },
        { key: "roles", name: "Vai trò & Quyền", description: "Phân quyền và quản lý vai trò", icon: "Shield", category: "user" as const, enabled: true, isCore: true, order: 10 },
        { key: "settings", name: "Cài đặt hệ thống", description: "Cấu hình website và hệ thống", icon: "Settings", category: "system" as const, enabled: true, isCore: true, order: 11 },
        { key: "menus", name: "Menu điều hướng", description: "Quản lý menu header, footer", icon: "Menu", category: "system" as const, enabled: true, isCore: false, order: 12 },
        { key: "homepage", name: "Trang chủ", description: "Cấu hình components trang chủ", icon: "LayoutGrid", category: "system" as const, enabled: true, isCore: false, order: 13 },
        { key: "notifications", name: "Thông báo", description: "Gửi thông báo cho người dùng", icon: "Bell", category: "marketing" as const, enabled: true, isCore: false, order: 14 },
        { key: "promotions", name: "Khuyến mãi", description: "Quản lý mã giảm giá, voucher", icon: "Megaphone", category: "marketing" as const, enabled: false, isCore: false, dependencies: ["products", "orders"], dependencyType: "all" as const, order: 15 },
        { key: "analytics", name: "Thống kê", description: "Báo cáo và phân tích dữ liệu", icon: "BarChart3", category: "marketing" as const, enabled: true, isCore: false, order: 16 },
      ];
      for (const mod of modules) {
        await ctx.db.insert("adminModules", mod);
      }
    }

    // Seed presets
    const existingPresets = await ctx.db.query("systemPresets").first();
    if (!existingPresets) {
      const presets = [
        { key: "blog", name: "Blog / News", description: "Blog với bài viết và bình luận", enabledModules: ["posts", "comments", "media", "customers", "users", "roles", "settings", "menus", "homepage", "analytics"], isDefault: false },
        { key: "landing", name: "Landing Page", description: "Trang giới thiệu đơn giản", enabledModules: ["posts", "media", "users", "roles", "settings", "menus", "homepage"], isDefault: false },
        { key: "catalog", name: "Catalog", description: "Trưng bày sản phẩm không giỏ hàng", enabledModules: ["products", "media", "customers", "users", "roles", "settings", "menus", "homepage", "notifications", "analytics"], isDefault: false },
        { key: "ecommerce-basic", name: "eCommerce Basic", description: "Shop đơn giản với giỏ hàng", enabledModules: ["products", "orders", "cart", "media", "customers", "users", "roles", "settings", "menus", "homepage", "notifications", "analytics"], isDefault: false },
        { key: "ecommerce-full", name: "eCommerce Full", description: "Shop đầy đủ: giỏ hàng, wishlist, khuyến mãi", enabledModules: ["posts", "comments", "media", "products", "orders", "cart", "wishlist", "customers", "users", "roles", "settings", "menus", "homepage", "notifications", "promotions", "analytics"], isDefault: true },
      ];
      for (const preset of presets) {
        await ctx.db.insert("systemPresets", preset);
      }
    }

    return null;
  },
});

// ============ PRODUCTS MODULE ============

export const seedProductsModule = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // 1. Seed product categories
    const existingCategories = await ctx.db.query("productCategories").first();
    if (!existingCategories) {
      const categories = [
        { name: "Điện tử", slug: "dien-tu", description: "Thiết bị điện tử, công nghệ", order: 0, active: true },
        { name: "Thời trang", slug: "thoi-trang", description: "Quần áo, phụ kiện thời trang", order: 1, active: true },
        { name: "Gia dụng", slug: "gia-dung", description: "Đồ dùng gia đình", order: 2, active: true },
        { name: "Sách & Văn phòng phẩm", slug: "sach-van-phong-pham", description: "Sách, vở, dụng cụ văn phòng", order: 3, active: true },
        { name: "Thể thao", slug: "the-thao", description: "Dụng cụ, trang phục thể thao", order: 4, active: false },
      ];
      for (const cat of categories) {
        await ctx.db.insert("productCategories", cat);
      }
    }

    // 2. Seed products
    const existingProducts = await ctx.db.query("products").first();
    if (!existingProducts) {
      const dienTuCat = await ctx.db.query("productCategories").withIndex("by_slug", q => q.eq("slug", "dien-tu")).first();
      const thoiTrangCat = await ctx.db.query("productCategories").withIndex("by_slug", q => q.eq("slug", "thoi-trang")).first();
      const giaDungCat = await ctx.db.query("productCategories").withIndex("by_slug", q => q.eq("slug", "gia-dung")).first();
      
      if (dienTuCat && thoiTrangCat && giaDungCat) {
        const products = [
          { name: "iPhone 15 Pro Max", sku: "IP15PM-256", slug: "iphone-15-pro-max", categoryId: dienTuCat._id, price: 34990000, salePrice: 32990000, stock: 50, status: "Active" as const, image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400", sales: 125, description: "iPhone 15 Pro Max 256GB chính hãng Apple", order: 0 },
          { name: "Samsung Galaxy S24 Ultra", sku: "SS-S24U-512", slug: "samsung-galaxy-s24-ultra", categoryId: dienTuCat._id, price: 33990000, stock: 35, status: "Active" as const, image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400", sales: 89, description: "Samsung Galaxy S24 Ultra 512GB", order: 1 },
          { name: "MacBook Pro M3", sku: "MBP-M3-14", slug: "macbook-pro-m3", categoryId: dienTuCat._id, price: 49990000, stock: 20, status: "Active" as const, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400", sales: 45, description: "MacBook Pro 14 inch chip M3", order: 2 },
          { name: "Áo Polo Nam Premium", sku: "POLO-NAM-001", slug: "ao-polo-nam-premium", categoryId: thoiTrangCat._id, price: 450000, salePrice: 350000, stock: 200, status: "Active" as const, image: "https://images.unsplash.com/photo-1625910513413-5fc5f8b9920b?w=400", sales: 320, description: "Áo polo nam cao cấp, chất liệu cotton", order: 3 },
          { name: "Quần Jean Nam Slim Fit", sku: "JEAN-NAM-001", slug: "quan-jean-nam-slim-fit", categoryId: thoiTrangCat._id, price: 650000, stock: 150, status: "Active" as const, image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400", sales: 180, description: "Quần jean nam form slim fit", order: 4 },
          { name: "Nồi chiên không dầu Philips", sku: "AF-PHILIPS-01", slug: "noi-chien-khong-dau-philips", categoryId: giaDungCat._id, price: 3500000, salePrice: 2990000, stock: 80, status: "Active" as const, image: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=400", sales: 95, description: "Nồi chiên không dầu Philips 4.1L", order: 5 },
          { name: "Robot hút bụi Xiaomi", sku: "ROBOT-XIAOMI-01", slug: "robot-hut-bui-xiaomi", categoryId: giaDungCat._id, price: 8500000, stock: 5, status: "Active" as const, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", sales: 42, description: "Robot hút bụi lau nhà Xiaomi", order: 6 },
          { name: "Tai nghe AirPods Pro 2", sku: "APP2-2024", slug: "tai-nghe-airpods-pro-2", categoryId: dienTuCat._id, price: 6990000, stock: 0, status: "Draft" as const, image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400", sales: 0, description: "Tai nghe AirPods Pro thế hệ 2", order: 7 },
          { name: "Váy đầm nữ dự tiệc", sku: "DRESS-NU-001", slug: "vay-dam-nu-du-tiec", categoryId: thoiTrangCat._id, price: 890000, stock: 60, status: "Archived" as const, image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400", sales: 75, description: "Váy đầm nữ sang trọng dự tiệc", order: 8 },
        ];
        for (const product of products) {
          await ctx.db.insert("products", product);
        }
      }
    }

    // 3. Seed module features
    const existingFeatures = await ctx.db.query("moduleFeatures").withIndex("by_module", q => q.eq("moduleKey", "products")).first();
    if (!existingFeatures) {
      const features = [
        { moduleKey: "products", featureKey: "enableSalePrice", name: "Giá khuyến mãi", description: "Hiển thị giá khuyến mãi cho sản phẩm", enabled: true, linkedFieldKey: "salePrice" },
        { moduleKey: "products", featureKey: "enableGallery", name: "Thư viện ảnh", description: "Cho phép nhiều ảnh sản phẩm", enabled: true, linkedFieldKey: "images" },
        { moduleKey: "products", featureKey: "enableSKU", name: "Mã SKU", description: "Quản lý mã SKU sản phẩm", enabled: true, linkedFieldKey: "sku" },
        { moduleKey: "products", featureKey: "enableStock", name: "Quản lý kho", description: "Theo dõi số lượng tồn kho", enabled: true, linkedFieldKey: "stock" },
      ];
      for (const feature of features) {
        await ctx.db.insert("moduleFeatures", feature);
      }
    }

    // 4. Seed module fields for products
    const existingFields = await ctx.db.query("moduleFields").withIndex("by_module", q => q.eq("moduleKey", "products")).first();
    if (!existingFields) {
      const productFields = [
        { moduleKey: "products", fieldKey: "name", name: "Tên sản phẩm", type: "text" as const, required: true, enabled: true, isSystem: true, order: 0 },
        { moduleKey: "products", fieldKey: "slug", name: "Slug", type: "text" as const, required: true, enabled: true, isSystem: true, order: 1 },
        { moduleKey: "products", fieldKey: "sku", name: "Mã SKU", type: "text" as const, required: true, enabled: true, isSystem: false, linkedFeature: "enableSKU", order: 2 },
        { moduleKey: "products", fieldKey: "price", name: "Giá bán", type: "price" as const, required: true, enabled: true, isSystem: true, order: 3 },
        { moduleKey: "products", fieldKey: "salePrice", name: "Giá khuyến mãi", type: "price" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableSalePrice", order: 4 },
        { moduleKey: "products", fieldKey: "stock", name: "Tồn kho", type: "number" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableStock", order: 5 },
        { moduleKey: "products", fieldKey: "status", name: "Trạng thái", type: "select" as const, required: true, enabled: true, isSystem: true, order: 6 },
        { moduleKey: "products", fieldKey: "categoryId", name: "Danh mục", type: "select" as const, required: true, enabled: true, isSystem: true, order: 7 },
        { moduleKey: "products", fieldKey: "description", name: "Mô tả", type: "richtext" as const, required: false, enabled: true, isSystem: false, order: 8 },
        { moduleKey: "products", fieldKey: "image", name: "Ảnh đại diện", type: "image" as const, required: false, enabled: true, isSystem: false, order: 9 },
        { moduleKey: "products", fieldKey: "images", name: "Thư viện ảnh", type: "gallery" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableGallery", order: 10 },
      ];
      for (const field of productFields) {
        await ctx.db.insert("moduleFields", field);
      }

      // Category fields
      const categoryFields = [
        { moduleKey: "productCategories", fieldKey: "name", name: "Tên danh mục", type: "text" as const, required: true, enabled: true, isSystem: true, order: 0 },
        { moduleKey: "productCategories", fieldKey: "slug", name: "Slug", type: "text" as const, required: true, enabled: true, isSystem: true, order: 1 },
        { moduleKey: "productCategories", fieldKey: "order", name: "Thứ tự", type: "number" as const, required: true, enabled: true, isSystem: true, order: 2 },
        { moduleKey: "productCategories", fieldKey: "active", name: "Trạng thái", type: "boolean" as const, required: true, enabled: true, isSystem: true, order: 3 },
        { moduleKey: "productCategories", fieldKey: "description", name: "Mô tả", type: "textarea" as const, required: false, enabled: true, isSystem: false, order: 4 },
        { moduleKey: "productCategories", fieldKey: "image", name: "Hình ảnh", type: "image" as const, required: false, enabled: false, isSystem: false, order: 5 },
      ];
      for (const field of categoryFields) {
        await ctx.db.insert("moduleFields", field);
      }
    }

    // 5. Seed module settings
    const existingSettings = await ctx.db.query("moduleSettings").withIndex("by_module", q => q.eq("moduleKey", "products")).first();
    if (!existingSettings) {
      await ctx.db.insert("moduleSettings", { moduleKey: "products", settingKey: "productsPerPage", value: 12 });
      await ctx.db.insert("moduleSettings", { moduleKey: "products", settingKey: "defaultStatus", value: "Draft" });
      await ctx.db.insert("moduleSettings", { moduleKey: "products", settingKey: "lowStockThreshold", value: 10 });
    }

    return null;
  },
});

// Clear products DATA only (products, categories) - keeps config
export const clearProductsData = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    for (const p of products) {
      await ctx.db.delete(p._id);
    }
    const categories = await ctx.db.query("productCategories").collect();
    for (const cat of categories) {
      await ctx.db.delete(cat._id);
    }
    return null;
  },
});

// Clear products module CONFIG (features, fields, settings)
export const clearProductsConfig = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const features = await ctx.db.query("moduleFeatures").withIndex("by_module", q => q.eq("moduleKey", "products")).collect();
    for (const f of features) {
      await ctx.db.delete(f._id);
    }
    const fields = await ctx.db.query("moduleFields").withIndex("by_module", q => q.eq("moduleKey", "products")).collect();
    for (const f of fields) {
      await ctx.db.delete(f._id);
    }
    const catFields = await ctx.db.query("moduleFields").withIndex("by_module", q => q.eq("moduleKey", "productCategories")).collect();
    for (const f of catFields) {
      await ctx.db.delete(f._id);
    }
    const settings = await ctx.db.query("moduleSettings").withIndex("by_module", q => q.eq("moduleKey", "products")).collect();
    for (const s of settings) {
      await ctx.db.delete(s._id);
    }
    return null;
  },
});
