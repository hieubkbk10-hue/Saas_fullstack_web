export type WebsiteType = 'landing' | 'blog' | 'catalog' | 'ecommerce' | 'services';

export type SaleMode = 'cart' | 'contact' | 'affiliate';

export type ProductType = 'physical' | 'digital' | 'both';

export type DigitalDeliveryType = 'account' | 'license' | 'download' | 'custom';

export type VariantPresetKey = string;

export type VariantPricing = 'product' | 'variant';
export type VariantStock = 'product' | 'variant';
export type VariantImages = 'inherit' | 'override' | 'both';

export type DataScale = 'low' | 'medium' | 'high';

export type BusinessInfo = {
  address: string;
  brandColor: string;
  businessType: string;
  email: string;
  openingHours: string;
  phone: string;
  siteName: string;
  socialFacebook: string;
  tagline: string;
};

export type ExperiencePresetKey = string;

export type QuickConfig = {
  commentsDefaultStatus: 'Pending' | 'Approved';
  lowStockThreshold: number;
  orderStatusPreset: 'simple' | 'standard' | 'advanced';
  ordersPerPage: number;
  postsDefaultStatus: 'draft' | 'published';
  postsPerPage: number;
  productsDefaultStatus: 'Draft' | 'Active';
  productsPerPage: number;
};

export type WizardState = {
  businessInfo: BusinessInfo;
  clearBeforeSeed: boolean;
  dataScale: DataScale;
  digitalDeliveryType: DigitalDeliveryType;
  experiencePresetKey: ExperiencePresetKey;
  extraFeatures: Set<string>;
  productType: ProductType;
  quickConfig: QuickConfig;
  quickConfigSkipped: boolean;
  saleMode: SaleMode;
  variantEnabled: boolean;
  variantImages: VariantImages;
  variantPresetKey: VariantPresetKey;
  variantPricing: VariantPricing;
  variantStock: VariantStock;
  websiteType: WebsiteType;
};
