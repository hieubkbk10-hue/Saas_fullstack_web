export type ExperienceKey = 
  | 'product_detail_ui'
  | 'wishlist_ui'
  | 'cart_ui'
  | 'checkout_ui'
  | 'comments_rating_ui';

export type ColorScheme = 'pink' | 'orange' | 'green' | 'purple' | 'cyan';

export const EXPERIENCE_COLORS: Record<ExperienceKey, ColorScheme> = {
  product_detail_ui: 'cyan',
  wishlist_ui: 'pink',
  cart_ui: 'orange',
  checkout_ui: 'green',
  comments_rating_ui: 'purple',
};

export const EXPERIENCE_GROUP = 'experience';

export const MESSAGES = {
  loading: 'Đang tải...',
  saveError: 'Có lỗi khi lưu cấu hình',
  saveSuccess: (name: string) => `Đã lưu cấu hình trải nghiệm ${name}`,
};

export const EXPERIENCE_NAMES: Record<ExperienceKey, string> = {
  product_detail_ui: 'Product Detail',
  wishlist_ui: 'Wishlist',
  cart_ui: 'Giỏ hàng',
  checkout_ui: 'Checkout',
  comments_rating_ui: 'Comments & Rating',
};
