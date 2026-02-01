export type Locale = 'vi' | 'en';

const vi = {
    // Layout
    sidebar: {
      analytics: 'Phân tích',
      collapse: 'Thu gọn',
      control: 'Điều khiển',
      experiences: 'Trải nghiệm',
      modules: 'Quản lý Module',
      overview: 'Tổng quan',
      platform: 'Nền tảng',
      seo: 'SEO & Khám phá',
    },
    header: {
      darkMode: 'Chuyển sang chế độ tối',
      lightMode: 'Chuyển sang chế độ sáng',
      search: 'Tìm kiếm...',
    },
    footer: {
      systemHealthy: 'Hệ thống: Hoạt động tốt',
    },
    pages: {
      analyticsIntegrations: 'Tích hợp Analytics',
      dashboard: 'Bảng điều khiển',
      experiences: 'Cấu hình Trải nghiệm',
      moduleManagement: 'Quản lý Module',
      seoConfiguration: 'Cấu hình SEO',
    },

    // Overview page
    overview: {
      addConfig: 'Thêm cấu hình',
      bandwidthTrend: 'Xu hướng băng thông',
      bandwidthUsage: 'Sử dụng băng thông theo',
      dashboardConfig: 'Cấu hình Convex Dashboard',
      dbBandwidth: 'Băng thông Database',
      fileBandwidth: 'Băng thông File',
      noConfig: 'Chưa cấu hình link Convex Dashboard',
      noDataDesc: 'Dữ liệu sẽ được tracking tự động khi có hoạt động trên hệ thống.',
      noDataTitle: 'Chưa có dữ liệu bandwidth',
      notes: 'Ghi chú',
      openDashboard: 'Mở Dashboard',
      subtitle: 'Giám sát và quản lý tài nguyên hệ thống',
      timeRanges: {
        '1m': '1 tháng',
        '1y': '1 năm',
        '3m': '3 tháng',
        '7d': '7 ngày',
        'today': 'Hôm nay',
      },
      title: 'Tổng quan',
    },

    // Modules page
    modules: {
      all: 'Tất cả',
      categories: {
        commerce: 'Thương mại',
        content: 'Nội dung',
        marketing: 'Marketing',
        system: 'Hệ thống',
        user: 'Người dùng',
      },
      configure: 'Cấu hình',
      custom: 'Tùy chỉnh',
      dependsOn: 'Phụ thuộc',
      disabled: 'tắt',
      download: 'Tải về',
      enabled: 'bật',
      manualConfig: 'Cấu hình thủ công',
      moduleConfig: 'Cấu hình Module',
      needParent: 'Cần bật parent',
      noModuleFound: 'Không tìm thấy module nào',
      presetDescriptions: {
        blog: 'Blog với bài viết và bình luận',
        catalog: 'Trưng bày sản phẩm không giỏ hàng',
        'ecommerce-basic': 'Shop đơn giản với giỏ hàng',
        'ecommerce-full': 'Shop đầy đủ: giỏ hàng, wishlist, khuyến mãi',
        landing: 'Trang giới thiệu đơn giản',
      },
      presets: {
        blog: 'Blog / Tin tức',
        catalog: 'Danh mục',
        'ecommerce-basic': 'Thương mại cơ bản',
        'ecommerce-full': 'Thương mại đầy đủ',
        landing: 'Trang đích',
      },
      searchModule: 'Tìm kiếm module...',
      selectPreset: 'Chọn preset',
      subtitle: 'Bật/tắt các chức năng cho Admin Dashboard',
      title: 'Quản lý Module',
      viewConfig: 'Xem Config',
    },

    // Common
    common: {
      add: 'Thêm',
      cancel: 'Hủy',
      close: 'Đóng',
      confirm: 'Xác nhận',
      delete: 'Xóa',
      edit: 'Sửa',
      error: 'Có lỗi xảy ra',
      loading: 'Đang tải...',
      save: 'Lưu',
      usage: 'Sử dụng',
    },
};

const en: typeof vi = {
    // Layout
    sidebar: {
      analytics: 'Analytics',
      collapse: 'Collapse',
      control: 'Control',
      experiences: 'Experiences',
      modules: 'Module Management',
      overview: 'Overview',
      platform: 'Platform',
      seo: 'SEO & Discovery',
    },
    header: {
      darkMode: 'Switch to Dark Mode',
      lightMode: 'Switch to Light Mode',
      search: 'Search...',
    },
    footer: {
      systemHealthy: 'System: Healthy',
    },
    pages: {
      analyticsIntegrations: 'Analytics Integrations',
      dashboard: 'Dashboard',
      experiences: 'Experience Configuration',
      moduleManagement: 'Module Management',
      seoConfiguration: 'SEO Configuration',
    },

    // Overview page
    overview: {
      addConfig: 'Add Configuration',
      bandwidthTrend: 'Bandwidth Trend',
      bandwidthUsage: 'Bandwidth usage in',
      dashboardConfig: 'Convex Dashboard Configuration',
      dbBandwidth: 'Database Bandwidth',
      fileBandwidth: 'File Bandwidth',
      noConfig: 'Convex Dashboard link not configured',
      noDataDesc: 'Data will be tracked automatically when there is activity on the system.',
      noDataTitle: 'No bandwidth data yet',
      notes: 'Notes',
      openDashboard: 'Open Dashboard',
      subtitle: 'Monitor and manage system resources',
      timeRanges: {
        '1m': '1 month',
        '1y': '1 year',
        '3m': '3 months',
        '7d': '7 days',
        'today': 'Today',
      },
      title: 'Overview',
    },

    // Modules page
    modules: {
      all: 'All',
      categories: {
        commerce: 'Commerce',
        content: 'Content',
        marketing: 'Marketing',
        system: 'System',
        user: 'User',
      },
      configure: 'Configure',
      custom: 'Custom',
      dependsOn: 'Depends on',
      disabled: 'disabled',
      download: 'Download',
      enabled: 'enabled',
      manualConfig: 'Manual configuration',
      moduleConfig: 'Module Configuration',
      needParent: 'Enable parent first',
      noModuleFound: 'No module found',
      presetDescriptions: {
        blog: 'Blog with posts and comments',
        catalog: 'Product showcase without cart',
        'ecommerce-basic': 'Simple shop with cart',
        'ecommerce-full': 'Full shop: cart, wishlist, promotions',
        landing: 'Simple landing page',
      },
      presets: {
        blog: 'Blog / News',
        catalog: 'Catalog',
        'ecommerce-basic': 'eCommerce Basic',
        'ecommerce-full': 'eCommerce Full',
        landing: 'Landing Page',
      },
      searchModule: 'Search module...',
      selectPreset: 'Select preset',
      subtitle: 'Enable/disable features for Admin Dashboard',
      title: 'Module Management',
      viewConfig: 'View Config',
    },

    // Common
    common: {
      add: 'Add',
      cancel: 'Cancel',
      close: 'Close',
      confirm: 'Confirm',
      delete: 'Delete',
      edit: 'Edit',
      error: 'An error occurred',
      loading: 'Loading...',
      save: 'Save',
      usage: 'Usage',
    },
};

export const translations: Record<Locale, typeof vi> = { en, vi };

export type TranslationKeys = typeof vi;
