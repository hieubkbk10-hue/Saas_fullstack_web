import type {
  DataScale,
  SaleMode,
  WizardState,
} from './types';

export type ExtraFeatureOption = {
  description: string;
  key: string;
  label: string;
  requiredProducts?: boolean;
  requiredPosts?: boolean;
  requiredServices?: boolean;
  modules: string[];
};

export type WebsiteTypeOption = {
  description: string;
  key: WizardState['websiteType'];
  label: string;
  modules: string[];
};

export type VariantPresetExample = {
  example: string;
  key: string;
  label: string;
};

const CORE_MODULES = ['settings', 'menus', 'homepage', 'media', 'users', 'roles'];

export const WEBSITE_TYPE_OPTIONS: WebsiteTypeOption[] = [
  {
    description: 'Landing page, brochure',
    key: 'landing',
    label: 'Chỉ giới thiệu',
    modules: [...CORE_MODULES],
  },
  {
    description: 'Bài viết, danh mục bài',
    key: 'blog',
    label: 'Viết blog/tin tức',
    modules: [...CORE_MODULES, 'posts', 'postCategories', 'comments'],
  },
  {
    description: 'Có SP nhưng KHÔNG có giỏ hàng',
    key: 'catalog',
    label: 'Trưng bày sản phẩm',
    modules: [...CORE_MODULES, 'products', 'productCategories'],
  },
  {
    description: 'Giỏ hàng + đặt hàng + thanh toán',
    key: 'ecommerce',
    label: 'Bán hàng online',
    modules: [...CORE_MODULES, 'products', 'productCategories', 'orders', 'cart', 'customers'],
  },
  {
    description: 'Salon, tư vấn, sửa chữa',
    key: 'services',
    label: 'Cung cấp dịch vụ',
    modules: [...CORE_MODULES, 'services', 'serviceCategories'],
  },
];

export const EXTRA_FEATURE_OPTIONS: ExtraFeatureOption[] = [
  {
    description: 'Viết tin tức, chia sẻ kiến thức',
    key: 'posts',
    label: 'Bài viết & Blog',
    modules: ['posts', 'postCategories'],
  },
  {
    description: 'Khách hàng comment, rate sản phẩm',
    key: 'comments',
    label: 'Bình luận & Đánh giá',
    modules: ['comments'],
    requiredProducts: false,
    requiredPosts: false,
  },
  {
    description: 'Nút “Thêm vào yêu thích”',
    key: 'wishlist',
    label: 'Yêu thích',
    modules: ['wishlist'],
    requiredProducts: true,
  },
  {
    description: 'Voucher, flash sale, combo',
    key: 'promotions',
    label: 'Mã giảm giá',
    modules: ['promotions'],
    requiredProducts: true,
  },
  {
    description: 'Gửi notification cho khách',
    key: 'notifications',
    label: 'Thông báo',
    modules: ['notifications'],
  },
  {
    description: 'Ngoài sản phẩm còn có dịch vụ',
    key: 'services',
    label: 'Dịch vụ',
    modules: ['services', 'serviceCategories'],
  },
];

export const VARIANT_PRESET_EXAMPLES: VariantPresetExample[] = [
  { key: 'size_color', label: 'Size + Màu', example: 'Áo Size S Đỏ, Áo Size M Xanh' },
  { key: 'color_only', label: 'Chỉ Màu', example: 'Ốp lưng Đen, Ốp lưng Trắng' },
  { key: 'size_only', label: 'Chỉ Size', example: 'Găng tay S, Găng tay M' },
  { key: 'storage_color', label: 'Dung lượng + Màu', example: 'iPhone 128GB Đen, 256GB Trắng' },
  { key: 'dimension_material', label: 'Kích thước + Chất liệu', example: 'Bàn 80x60 Gỗ, 100x80 Kim loại' },
  { key: 'volume_shade', label: 'Dung tích + Tone', example: 'Kem 30ml Tone sáng, 50ml Tone tối' },
  { key: 'weight_flavor', label: 'Khối lượng + Hương vị', example: 'Cà phê 250g Vanilla, 500g Mocha' },
  { key: 'duration_package', label: 'Thời hạn + Gói', example: '1 tháng Basic, 1 năm Premium' },
  { key: 'material_color', label: 'Chất liệu + Màu', example: 'Nhẫn Vàng Đen, Bạc Trắng' },
  { key: 'dosage_quantity', label: 'Liều lượng + Số lượng', example: 'Vitamin 500mg 60 viên' },
  { key: 'size_age', label: 'Size + Độ tuổi', example: 'Tã Size S 0-6M, Size M 6-12M' },
];

const SCALE_QUANTITIES: Record<DataScale, Record<string, number>> = {
  low: {
    cart: 5,
    comments: 10,
    customers: 5,
    homepage: 6,
    menus: 2,
    orders: 5,
    postCategories: 3,
    posts: 5,
    productCategories: 3,
    products: 5,
    promotions: 5,
    roles: 4,
    serviceCategories: 3,
    services: 5,
    settings: 15,
    users: 5,
    wishlist: 5,
    notifications: 5,
    media: 10,
  },
  medium: {
    cart: 20,
    comments: 30,
    customers: 20,
    homepage: 6,
    menus: 3,
    orders: 20,
    postCategories: 5,
    posts: 15,
    productCategories: 5,
    products: 20,
    promotions: 10,
    roles: 4,
    serviceCategories: 5,
    services: 15,
    settings: 15,
    users: 10,
    wishlist: 15,
    notifications: 10,
    media: 20,
  },
  high: {
    cart: 50,
    comments: 80,
    customers: 50,
    homepage: 6,
    menus: 4,
    orders: 50,
    postCategories: 6,
    posts: 30,
    productCategories: 8,
    products: 50,
    promotions: 20,
    roles: 4,
    serviceCategories: 6,
    services: 25,
    settings: 15,
    users: 12,
    wishlist: 30,
    notifications: 20,
    media: 30,
  },
};

export function getBaseModules(websiteType: WizardState['websiteType']): string[] {
  return WEBSITE_TYPE_OPTIONS.find((option) => option.key === websiteType)?.modules ?? [];
}

export function applySaleModeOverrides(modules: Set<string>, saleMode: SaleMode): void {
  if (saleMode === 'contact') {
    modules.delete('cart');
    modules.delete('orders');
    modules.delete('wishlist');
    modules.delete('promotions');
  }

  if (saleMode === 'affiliate') {
    modules.delete('cart');
    modules.delete('orders');
  }
}

export function buildModuleSelection(state: WizardState): string[] {
  const modules = new Set(getBaseModules(state.websiteType));

  for (const feature of state.extraFeatures) {
    const option = EXTRA_FEATURE_OPTIONS.find((item) => item.key === feature);
    if (option) {
      option.modules.forEach((moduleKey) => modules.add(moduleKey));
    }
  }

  if (modules.has('products')) {
    modules.add('productCategories');
  }

  if (modules.has('posts')) {
    modules.add('postCategories');
  }

  if (modules.has('services')) {
    modules.add('serviceCategories');
  }

  if (modules.has('orders') || modules.has('cart') || modules.has('wishlist')) {
    modules.add('customers');
    modules.add('products');
    modules.add('productCategories');
  }

  if (modules.has('promotions')) {
    modules.add('products');
    modules.add('productCategories');
  }

  if (modules.has('comments') && !modules.has('posts') && !modules.has('products')) {
    modules.delete('comments');
  }

  if (modules.has('products')) {
    applySaleModeOverrides(modules, state.saleMode);
  }

  return Array.from(modules);
}

export function buildSeedConfigs(selectedModules: string[], scale: DataScale) {
  const quantities = SCALE_QUANTITIES[scale];
  return selectedModules
    .filter((moduleKey) => quantities[moduleKey] !== undefined)
    .map((moduleKey) => ({
      module: moduleKey,
      quantity: quantities[moduleKey],
    }));
}
