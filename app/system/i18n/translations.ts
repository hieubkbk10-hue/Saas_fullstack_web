export type Locale = 'vi' | 'en';

const vi = {
    // Layout
    sidebar: {
      platform: 'Nền tảng',
      control: 'Điều khiển',
      overview: 'Tổng quan',
      modules: 'Quản lý Module',
      analytics: 'Phân tích',
      seo: 'SEO & Khám phá',
      collapse: 'Thu gọn',
    },
    header: {
      search: 'Tìm kiếm...',
      lightMode: 'Chuyển sang chế độ sáng',
      darkMode: 'Chuyển sang chế độ tối',
    },
    footer: {
      systemHealthy: 'Hệ thống: Hoạt động tốt',
    },
    pages: {
      dashboard: 'Bảng điều khiển',
      moduleManagement: 'Quản lý Module',
      analyticsIntegrations: 'Tích hợp Analytics',
      seoConfiguration: 'Cấu hình SEO',
    },

    // Overview page
    overview: {
      title: 'Tổng quan',
      subtitle: 'Giám sát và quản lý tài nguyên hệ thống',
      dashboardConfig: 'Cấu hình Convex Dashboard',
      noConfig: 'Chưa cấu hình link Convex Dashboard',
      addConfig: 'Thêm cấu hình',
      openDashboard: 'Mở Dashboard',
      notes: 'Ghi chú',
      bandwidthTrend: 'Xu hướng băng thông',
      bandwidthUsage: 'Sử dụng băng thông theo',
      dbBandwidth: 'Băng thông Database',
      fileBandwidth: 'Băng thông File',
      timeRanges: {
        'today': 'Hôm nay',
        '7d': '7 ngày',
        '1m': '1 tháng',
        '3m': '3 tháng',
        '1y': '1 năm',
      },
    },

    // Modules page
    modules: {
      title: 'Quản lý Module',
      subtitle: 'Bật/tắt các chức năng cho Admin Dashboard',
      enabled: 'bật',
      disabled: 'tắt',
      selectPreset: 'Chọn preset',
      custom: 'Tùy chỉnh',
      manualConfig: 'Cấu hình thủ công',
      viewConfig: 'Xem Config',
      download: 'Tải về',
      searchModule: 'Tìm kiếm module...',
      all: 'Tất cả',
      configure: 'Cấu hình',
      needParent: 'Cần bật parent',
      dependsOn: 'Phụ thuộc',
      noModuleFound: 'Không tìm thấy module nào',
      moduleConfig: 'Cấu hình Module',
      categories: {
        content: 'Nội dung',
        commerce: 'Thương mại',
        user: 'Người dùng',
        system: 'Hệ thống',
        marketing: 'Marketing',
      },
      presets: {
        blog: 'Blog / Tin tức',
        landing: 'Trang đích',
        catalog: 'Danh mục',
        'ecommerce-basic': 'Thương mại cơ bản',
        'ecommerce-full': 'Thương mại đầy đủ',
      },
      presetDescriptions: {
        blog: 'Blog với bài viết và bình luận',
        landing: 'Trang giới thiệu đơn giản',
        catalog: 'Trưng bày sản phẩm không giỏ hàng',
        'ecommerce-basic': 'Shop đơn giản với giỏ hàng',
        'ecommerce-full': 'Shop đầy đủ: giỏ hàng, wishlist, khuyến mãi',
      },
    },

    // Common
    common: {
      loading: 'Đang tải...',
      error: 'Có lỗi xảy ra',
      save: 'Lưu',
      cancel: 'Hủy',
      close: 'Đóng',
      confirm: 'Xác nhận',
      delete: 'Xóa',
      edit: 'Sửa',
      add: 'Thêm',
      usage: 'Sử dụng',
    },
};

const en: typeof vi = {
    // Layout
    sidebar: {
      platform: 'Platform',
      control: 'Control',
      overview: 'Overview',
      modules: 'Module Management',
      analytics: 'Analytics',
      seo: 'SEO & Discovery',
      collapse: 'Collapse',
    },
    header: {
      search: 'Search...',
      lightMode: 'Switch to Light Mode',
      darkMode: 'Switch to Dark Mode',
    },
    footer: {
      systemHealthy: 'System: Healthy',
    },
    pages: {
      dashboard: 'Dashboard',
      moduleManagement: 'Module Management',
      analyticsIntegrations: 'Analytics Integrations',
      seoConfiguration: 'SEO Configuration',
    },

    // Overview page
    overview: {
      title: 'Overview',
      subtitle: 'Monitor and manage system resources',
      dashboardConfig: 'Convex Dashboard Configuration',
      noConfig: 'Convex Dashboard link not configured',
      addConfig: 'Add Configuration',
      openDashboard: 'Open Dashboard',
      notes: 'Notes',
      bandwidthTrend: 'Bandwidth Trend',
      bandwidthUsage: 'Bandwidth usage in',
      dbBandwidth: 'Database Bandwidth',
      fileBandwidth: 'File Bandwidth',
      timeRanges: {
        'today': 'Today',
        '7d': '7 days',
        '1m': '1 month',
        '3m': '3 months',
        '1y': '1 year',
      },
    },

    // Modules page
    modules: {
      title: 'Module Management',
      subtitle: 'Enable/disable features for Admin Dashboard',
      enabled: 'enabled',
      disabled: 'disabled',
      selectPreset: 'Select preset',
      custom: 'Custom',
      manualConfig: 'Manual configuration',
      viewConfig: 'View Config',
      download: 'Download',
      searchModule: 'Search module...',
      all: 'All',
      configure: 'Configure',
      needParent: 'Enable parent first',
      dependsOn: 'Depends on',
      noModuleFound: 'No module found',
      moduleConfig: 'Module Configuration',
      categories: {
        content: 'Content',
        commerce: 'Commerce',
        user: 'User',
        system: 'System',
        marketing: 'Marketing',
      },
      presets: {
        blog: 'Blog / News',
        landing: 'Landing Page',
        catalog: 'Catalog',
        'ecommerce-basic': 'eCommerce Basic',
        'ecommerce-full': 'eCommerce Full',
      },
      presetDescriptions: {
        blog: 'Blog with posts and comments',
        landing: 'Simple landing page',
        catalog: 'Product showcase without cart',
        'ecommerce-basic': 'Simple shop with cart',
        'ecommerce-full': 'Full shop: cart, wishlist, promotions',
      },
    },

    // Common
    common: {
      loading: 'Loading...',
      error: 'An error occurred',
      save: 'Save',
      cancel: 'Cancel',
      close: 'Close',
      confirm: 'Confirm',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      usage: 'Usage',
    },
};

export const translations: Record<Locale, typeof vi> = { vi, en };

export type TranslationKeys = typeof vi;
