/**
 * Settings Seeder
 */

import { BaseSeeder, type SeedConfig, type SeedDependency, type SeedResult } from './base';
import type { Doc, DataModel } from '../_generated/dataModel';
import type { GenericMutationCtx } from 'convex/server';

type SettingData = Omit<Doc<'settings'>, '_creationTime' | '_id'>;

export class SettingsSeeder extends BaseSeeder<SettingData> {
  moduleName = 'settings';
  tableName = 'settings';
  dependencies: SeedDependency[] = [];

  constructor(ctx: GenericMutationCtx<DataModel>) {
    super(ctx);
  }

  async seed(config: SeedConfig): Promise<SeedResult> {
    const startTime = Date.now();
    this.config = { batchSize: 50, dependencies: true, force: false, ...config };

    if (config.force) {
      await this.clear();
    }

    const created = await this.seedSettingsData();
    await this.seedModuleConfig();

    return {
      created,
      dependencies: [],
      duration: Date.now() - startTime,
      module: this.moduleName,
      skipped: 0,
    };
  }

  generateFake(): SettingData {
    return { group: 'site', key: 'site_name', value: 'VietAdmin' };
  }

  validateRecord(record: SettingData): boolean {
    return !!record.group && !!record.key;
  }

  protected async clear(): Promise<void> {
    const settings = await this.ctx.db.query('settings').collect();
    await Promise.all(settings.map(setting => this.ctx.db.delete(setting._id)));
  }

  private async seedSettingsData(): Promise<number> {
    const existingSettings = await this.ctx.db.query('settings').first();
    if (existingSettings) {
      return 0;
    }

    const settingsData: SettingData[] = [
      { group: 'site', key: 'site_name', value: 'VietAdmin' },
      { group: 'site', key: 'site_tagline', value: 'Hệ thống quản trị website' },
      { group: 'site', key: 'site_url', value: '' },
      { group: 'site', key: 'site_logo', value: '' },
      { group: 'site', key: 'site_favicon', value: '' },
      { group: 'site', key: 'site_timezone', value: 'Asia/Ho_Chi_Minh' },
      { group: 'site', key: 'site_language', value: 'vi' },
      { group: 'site', key: 'site_brand_color', value: '#3b82f6' },
      { group: 'contact', key: 'contact_email', value: 'contact@vietadmin.com' },
      { group: 'contact', key: 'contact_phone', value: '0901234567' },
      { group: 'contact', key: 'contact_address', value: '123 Nguyễn Huệ, Quận 1, TP.HCM' },
      { group: 'contact', key: 'contact_hotline', value: '1900 1234' },
      { group: 'contact', key: 'contact_zalo', value: '0901234567' },
      { group: 'contact', key: 'contact_messenger', value: '' },
      { group: 'seo', key: 'seo_title', value: 'VietAdmin - Hệ thống quản trị website' },
      { group: 'seo', key: 'seo_robots', value: 'User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /system/\nDisallow: /api/' },
      { group: 'seo', key: 'seo_description', value: 'VietAdmin là hệ thống quản trị website hiện đại, dễ sử dụng' },
      { group: 'seo', key: 'seo_keywords', value: 'admin, quản trị, website, cms' },
      { group: 'seo', key: 'seo_og_image', value: '' },
      { group: 'seo', key: 'seo_business_type', value: 'LocalBusiness' },
      { group: 'seo', key: 'seo_opening_hours', value: 'Mo-Su 08:00-22:00' },
      { group: 'seo', key: 'seo_price_range', value: '$$' },
      { group: 'seo', key: 'seo_geo_lat', value: '' },
      { group: 'seo', key: 'seo_geo_lng', value: '' },
      { group: 'seo', key: 'seo_hreflang', value: '' },
      { group: 'social', key: 'social_facebook', value: '' },
      { group: 'social', key: 'social_instagram', value: '' },
      { group: 'social', key: 'social_youtube', value: '' },
      { group: 'social', key: 'social_tiktok', value: '' },
      { group: 'social', key: 'social_zalo', value: '' },
      { group: 'mail', key: 'mail_from_name', value: 'VietAdmin' },
      { group: 'mail', key: 'mail_from_email', value: 'noreply@vietadmin.com' },
      { group: 'mail', key: 'mail_driver', value: 'smtp' },
      { group: 'mail', key: 'mail_host', value: '' },
      { group: 'mail', key: 'mail_port', value: 587 },
      { group: 'mail', key: 'mail_encryption', value: 'tls' },
      {
        group: 'experience',
        key: 'product_detail_ui',
        value: {
          layoutStyle: 'classic',
          showAddToCart: true,
          showClassicHighlights: true,
          showRating: true,
          showWishlist: true,
          showBuyNow: true,
        },
      },
      {
        group: 'experience',
        key: 'wishlist_ui',
        value: {
          layoutStyle: 'grid',
          showNote: true,
          showNotification: true,
          showWishlistButton: true,
        },
      },
      {
        group: 'experience',
        key: 'cart_ui',
        value: {
          layoutStyle: 'drawer',
          showExpiry: false,
          showNote: false,
        },
      },
      {
        group: 'experience',
        key: 'checkout_ui',
        value: {
          flowStyle: 'multi-step',
          showBuyNow: true,
          layouts: {
            'single-page': {
              orderSummaryPosition: 'right',
              showPaymentMethods: true,
              showShippingOptions: true,
            },
            'multi-step': {
              orderSummaryPosition: 'right',
              showPaymentMethods: true,
              showShippingOptions: true,
            },
          },
        },
      },
      {
        group: 'experience',
        key: 'comments_rating_ui',
        value: {
          commentsSortOrder: 'newest',
          ratingDisplayStyle: 'both',
          showLikes: true,
          showModeration: true,
          showReplies: true,
        },
      },
    ];

    await Promise.all(settingsData.map(setting => this.ctx.db.insert('settings', setting)));
    return settingsData.length;
  }

  private async seedModuleConfig(): Promise<void> {
    const existingFeatures = await this.ctx.db
      .query('moduleFeatures')
      .withIndex('by_module', q => q.eq('moduleKey', 'settings'))
      .first();
    if (!existingFeatures) {
      const features = [
        { description: 'Quản lý email, phone, địa chỉ', enabled: true, featureKey: 'enableContact', moduleKey: 'settings', name: 'Thông tin liên hệ' },
        { description: 'Meta title, description, keywords', enabled: true, featureKey: 'enableSEO', moduleKey: 'settings', name: 'SEO cơ bản' },
        { description: 'Links Facebook, Instagram, Youtube...', enabled: true, featureKey: 'enableSocial', moduleKey: 'settings', name: 'Mạng xã hội' },
        { description: 'SMTP settings để gửi email', enabled: false, featureKey: 'enableMail', moduleKey: 'settings', name: 'Cấu hình Email' },
      ];
      await Promise.all(features.map(feature => this.ctx.db.insert('moduleFeatures', feature)));
    }

    const existingFields = await this.ctx.db
      .query('moduleFields')
      .withIndex('by_module', q => q.eq('moduleKey', 'settings'))
      .first();
    if (!existingFields) {
      const fields = [
        { enabled: true, fieldKey: 'site_name', group: 'site', isSystem: true, moduleKey: 'settings', name: 'Tên website', order: 0, required: true, type: 'text' as const },
        { enabled: true, fieldKey: 'site_tagline', group: 'site', isSystem: false, moduleKey: 'settings', name: 'Slogan', order: 1, required: false, type: 'text' as const },
        { enabled: true, fieldKey: 'site_url', group: 'site', isSystem: true, moduleKey: 'settings', name: 'URL Website', order: 2, required: false, type: 'text' as const },
        { enabled: true, fieldKey: 'site_logo', group: 'site', isSystem: true, moduleKey: 'settings', name: 'Logo', order: 3, required: false, type: 'image' as const },
        { enabled: true, fieldKey: 'site_favicon', group: 'site', isSystem: true, moduleKey: 'settings', name: 'Favicon', order: 4, required: false, type: 'image' as const },
        { enabled: true, fieldKey: 'site_timezone', group: 'site', isSystem: false, moduleKey: 'settings', name: 'Múi giờ', order: 5, required: false, type: 'select' as const },
        { enabled: true, fieldKey: 'site_language', group: 'site', isSystem: false, moduleKey: 'settings', name: 'Ngôn ngữ', order: 6, required: false, type: 'select' as const },
        { enabled: true, fieldKey: 'site_brand_color', group: 'site', isSystem: false, moduleKey: 'settings', name: 'Màu thương hiệu', order: 7, required: false, type: 'color' as const },
        { enabled: true, fieldKey: 'contact_email', group: 'contact', isSystem: false, linkedFeature: 'enableContact', moduleKey: 'settings', name: 'Email', order: 6, required: false, type: 'email' as const },
        { enabled: true, fieldKey: 'contact_phone', group: 'contact', isSystem: false, linkedFeature: 'enableContact', moduleKey: 'settings', name: 'Số điện thoại', order: 7, required: false, type: 'phone' as const },
        { enabled: true, fieldKey: 'contact_address', group: 'contact', isSystem: false, linkedFeature: 'enableContact', moduleKey: 'settings', name: 'Địa chỉ', order: 8, required: false, type: 'textarea' as const },
        { enabled: true, fieldKey: 'contact_hotline', group: 'contact', isSystem: false, linkedFeature: 'enableContact', moduleKey: 'settings', name: 'Hotline', order: 9, required: false, type: 'text' as const },
        { enabled: true, fieldKey: 'contact_zalo', group: 'contact', isSystem: false, linkedFeature: 'enableContact', moduleKey: 'settings', name: 'Zalo', order: 10, required: false, type: 'text' as const },
        { enabled: true, fieldKey: 'contact_messenger', group: 'contact', isSystem: false, linkedFeature: 'enableContact', moduleKey: 'settings', name: 'Facebook Messenger', order: 11, required: false, type: 'text' as const },
        { enabled: true, fieldKey: 'seo_title', group: 'seo', isSystem: false, linkedFeature: 'enableSEO', moduleKey: 'settings', name: 'Meta Title', order: 10, required: false, type: 'text' as const },
        { enabled: true, fieldKey: 'seo_description', group: 'seo', isSystem: false, linkedFeature: 'enableSEO', moduleKey: 'settings', name: 'Meta Description', order: 11, required: false, type: 'textarea' as const },
        { enabled: true, fieldKey: 'seo_keywords', group: 'seo', isSystem: false, linkedFeature: 'enableSEO', moduleKey: 'settings', name: 'Keywords', order: 12, required: false, type: 'tags' as const },
        { enabled: true, fieldKey: 'seo_og_image', group: 'seo', isSystem: false, linkedFeature: 'enableSEO', moduleKey: 'settings', name: 'OG Image', order: 13, required: false, type: 'image' as const },
        { enabled: true, fieldKey: 'seo_robots', group: 'seo', isSystem: false, linkedFeature: 'enableSEO', moduleKey: 'settings', name: 'Robots.txt', order: 14, required: false, type: 'textarea' as const },
        { enabled: true, fieldKey: 'seo_business_type', group: 'seo', isSystem: false, linkedFeature: 'enableSEO', moduleKey: 'settings', name: 'Loại hình doanh nghiệp', order: 15, required: false, type: 'select' as const },
        { enabled: true, fieldKey: 'seo_opening_hours', group: 'seo', isSystem: false, linkedFeature: 'enableSEO', moduleKey: 'settings', name: 'Giờ mở cửa', order: 16, required: false, type: 'text' as const },
        { enabled: true, fieldKey: 'seo_price_range', group: 'seo', isSystem: false, linkedFeature: 'enableSEO', moduleKey: 'settings', name: 'Khoảng giá', order: 17, required: false, type: 'text' as const },
        { enabled: true, fieldKey: 'seo_geo_lat', group: 'seo', isSystem: false, linkedFeature: 'enableSEO', moduleKey: 'settings', name: 'Vĩ độ (Latitude)', order: 18, required: false, type: 'number' as const },
        { enabled: true, fieldKey: 'seo_geo_lng', group: 'seo', isSystem: false, linkedFeature: 'enableSEO', moduleKey: 'settings', name: 'Kinh độ (Longitude)', order: 19, required: false, type: 'number' as const },
        { enabled: true, fieldKey: 'seo_hreflang', group: 'seo', isSystem: false, linkedFeature: 'enableSEO', moduleKey: 'settings', name: 'Hreflang', order: 20, required: false, type: 'textarea' as const },
        { enabled: true, fieldKey: 'social_facebook', group: 'social', isSystem: false, linkedFeature: 'enableSocial', moduleKey: 'settings', name: 'Facebook', order: 14, required: false, type: 'text' as const },
        { enabled: true, fieldKey: 'social_instagram', group: 'social', isSystem: false, linkedFeature: 'enableSocial', moduleKey: 'settings', name: 'Instagram', order: 15, required: false, type: 'text' as const },
        { enabled: true, fieldKey: 'social_youtube', group: 'social', isSystem: false, linkedFeature: 'enableSocial', moduleKey: 'settings', name: 'Youtube', order: 16, required: false, type: 'text' as const },
        { enabled: false, fieldKey: 'social_tiktok', group: 'social', isSystem: false, linkedFeature: 'enableSocial', moduleKey: 'settings', name: 'TikTok', order: 17, required: false, type: 'text' as const },
        { enabled: false, fieldKey: 'social_zalo', group: 'social', isSystem: false, linkedFeature: 'enableSocial', moduleKey: 'settings', name: 'Zalo', order: 18, required: false, type: 'text' as const },
        { enabled: false, fieldKey: 'mail_from_name', group: 'mail', isSystem: false, linkedFeature: 'enableMail', moduleKey: 'settings', name: 'Tên người gửi', order: 19, required: false, type: 'text' as const },
        { enabled: false, fieldKey: 'mail_from_email', group: 'mail', isSystem: false, linkedFeature: 'enableMail', moduleKey: 'settings', name: 'Email người gửi', order: 20, required: false, type: 'email' as const },
        { enabled: false, fieldKey: 'mail_driver', group: 'mail', isSystem: false, linkedFeature: 'enableMail', moduleKey: 'settings', name: 'Mail driver', order: 21, required: false, type: 'text' as const },
        { enabled: false, fieldKey: 'mail_host', group: 'mail', isSystem: false, linkedFeature: 'enableMail', moduleKey: 'settings', name: 'SMTP Host', order: 22, required: false, type: 'text' as const },
        { enabled: false, fieldKey: 'mail_port', group: 'mail', isSystem: false, linkedFeature: 'enableMail', moduleKey: 'settings', name: 'SMTP Port', order: 23, required: false, type: 'number' as const },
        { enabled: false, fieldKey: 'mail_encryption', group: 'mail', isSystem: false, linkedFeature: 'enableMail', moduleKey: 'settings', name: 'Encryption', order: 24, required: false, type: 'text' as const },
      ];
      await Promise.all(fields.map(field => this.ctx.db.insert('moduleFields', field)));
    }
  }
}
