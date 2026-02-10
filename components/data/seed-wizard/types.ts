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
  email: string;
  phone: string;
  siteName: string;
  tagline: string;
};

export type WizardState = {
  businessInfo: BusinessInfo;
  clearBeforeSeed: boolean;
  dataScale: DataScale;
  digitalDeliveryType: DigitalDeliveryType;
  extraFeatures: Set<string>;
  productType: ProductType;
  saleMode: SaleMode;
  variantEnabled: boolean;
  variantImages: VariantImages;
  variantPresetKey: VariantPresetKey;
  variantPricing: VariantPricing;
  variantStock: VariantStock;
  websiteType: WebsiteType;
};
