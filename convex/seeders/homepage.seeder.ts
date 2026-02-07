/**
 * Homepage Seeder
 */

import { BaseSeeder, type SeedConfig, type SeedDependency, type SeedResult } from './base';
import type { Doc, DataModel } from '../_generated/dataModel';
import type { GenericMutationCtx } from 'convex/server';

type HomeComponentData = Omit<Doc<'homeComponents'>, '_creationTime' | '_id'>;

export class HomepageSeeder extends BaseSeeder<HomeComponentData> {
  moduleName = 'homepage';
  tableName = 'homeComponents';
  dependencies: SeedDependency[] = [
    { module: 'posts', required: false },
    { module: 'products', required: false },
  ];

  constructor(ctx: GenericMutationCtx<DataModel>) {
    super(ctx);
  }

  async seed(config: SeedConfig): Promise<SeedResult> {
    const startTime = Date.now();
    this.config = { batchSize: 50, dependencies: true, force: false, ...config };

    if (config.force) {
      await this.clear();
    }

    const created = await this.seedComponents();
    await this.seedModuleConfig();
    await this.seedStats();

    return {
      created,
      dependencies: [],
      duration: Date.now() - startTime,
      module: this.moduleName,
      skipped: 0,
    };
  }

  generateFake(): HomeComponentData {
    return {
      active: true,
      config: {},
      order: 0,
      title: 'Section',
      type: 'custom',
    };
  }

  validateRecord(record: HomeComponentData): boolean {
    return !!record.title && !!record.type;
  }

  protected async clear(): Promise<void> {
    const components = await this.ctx.db.query('homeComponents').collect();
    const stats = await this.ctx.db.query('homeComponentStats').collect();
    await Promise.all([
      ...components.map(component => this.ctx.db.delete(component._id)),
      ...stats.map(stat => this.ctx.db.delete(stat._id)),
    ]);
  }

  private async seedComponents(): Promise<number> {
    const existing = await this.ctx.db.query('homeComponents').first();
    if (existing) {
      return 0;
    }

    const components: HomeComponentData[] = [
      {
        active: true,
        config: {
          backgroundImage: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920',
          buttonLink: '/products',
          buttonText: 'Khám phá ngay',
          heading: 'Chào mừng đến VietAdmin',
          subheading: 'Hệ thống quản trị website chuyên nghiệp',
        },
        order: 0,
        title: 'Hero Banner',
        type: 'hero',
      },
      {
        active: true,
        config: {
          content: 'VietAdmin là giải pháp quản trị website toàn diện, được thiết kế riêng cho doanh nghiệp Việt Nam.',
          heading: 'Về chúng tôi',
          image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
        },
        order: 1,
        title: 'Giới thiệu',
        type: 'about',
      },
      {
        active: true,
        config: {
          heading: 'Sản phẩm nổi bật',
          limit: 8,
          showButton: true,
          showPrice: true,
          subheading: 'Những sản phẩm được yêu thích nhất',
        },
        order: 2,
        title: 'Sản phẩm nổi bật',
        type: 'products',
      },
      {
        active: true,
        config: {
          heading: 'Tin tức & Bài viết',
          limit: 6,
          showDate: true,
          showExcerpt: true,
          subheading: 'Cập nhật những thông tin mới nhất',
        },
        order: 3,
        title: 'Bài viết mới',
        type: 'posts',
      },
      {
        active: false,
        config: {
          heading: 'Đối tác của chúng tôi',
          logos: [],
        },
        order: 4,
        title: 'Đối tác',
        type: 'partners',
      },
      {
        active: true,
        config: {
          heading: 'Liên hệ với chúng tôi',
          showForm: true,
          showMap: false,
          subheading: 'Chúng tôi luôn sẵn sàng hỗ trợ bạn',
        },
        order: 5,
        title: 'Liên hệ',
        type: 'contact',
      },
    ];

    await Promise.all(components.map(component => this.ctx.db.insert('homeComponents', component)));
    return components.length;
  }

  private async seedModuleConfig(): Promise<void> {
    const existingFeatures = await this.ctx.db
      .query('moduleFeatures')
      .withIndex('by_module', q => q.eq('moduleKey', 'homepage'))
      .first();
    if (!existingFeatures) {
      const features = [
        { description: 'Banner chính đầu trang', enabled: true, featureKey: 'enableHero', moduleKey: 'homepage', name: 'Hero Banner' },
        { description: 'Section giới thiệu công ty', enabled: true, featureKey: 'enableAbout', moduleKey: 'homepage', name: 'Giới thiệu' },
        { description: 'Hiển thị sản phẩm featured', enabled: true, featureKey: 'enableProducts', moduleKey: 'homepage', name: 'Sản phẩm nổi bật' },
        { description: 'Hiển thị bài viết gần đây', enabled: true, featureKey: 'enablePosts', moduleKey: 'homepage', name: 'Bài viết mới' },
        { description: 'Logo đối tác/khách hàng', enabled: false, featureKey: 'enablePartners', moduleKey: 'homepage', name: 'Đối tác' },
        { description: 'Form liên hệ nhanh', enabled: true, featureKey: 'enableContact', moduleKey: 'homepage', name: 'Liên hệ' },
      ];
      await Promise.all(features.map(feature => this.ctx.db.insert('moduleFeatures', feature)));
    }

    const existingFields = await this.ctx.db
      .query('moduleFields')
      .withIndex('by_module', q => q.eq('moduleKey', 'homepage'))
      .first();
    if (!existingFields) {
      const fields = [
        { enabled: true, fieldKey: 'title', isSystem: true, moduleKey: 'homepage', name: 'Tên section', order: 0, required: true, type: 'text' as const },
        { enabled: true, fieldKey: 'type', isSystem: true, moduleKey: 'homepage', name: 'Loại section', order: 1, required: true, type: 'select' as const },
        { enabled: true, fieldKey: 'order', isSystem: true, moduleKey: 'homepage', name: 'Thứ tự', order: 2, required: true, type: 'number' as const },
        { enabled: true, fieldKey: 'active', isSystem: true, moduleKey: 'homepage', name: 'Trạng thái', order: 3, required: true, type: 'boolean' as const },
        { enabled: true, fieldKey: 'config', isSystem: false, moduleKey: 'homepage', name: 'Cấu hình JSON', order: 4, required: false, type: 'textarea' as const },
        { enabled: true, fieldKey: 'background', isSystem: false, moduleKey: 'homepage', name: 'Ảnh nền', order: 5, required: false, type: 'image' as const },
      ];
      await Promise.all(fields.map(field => this.ctx.db.insert('moduleFields', field)));
    }

    const existingSettings = await this.ctx.db
      .query('moduleSettings')
      .withIndex('by_module', q => q.eq('moduleKey', 'homepage'))
      .first();
    if (!existingSettings) {
      await Promise.all([
        this.ctx.db.insert('moduleSettings', { moduleKey: 'homepage', settingKey: 'maxSections', value: 10 }),
        this.ctx.db.insert('moduleSettings', { moduleKey: 'homepage', settingKey: 'defaultSectionType', value: 'hero' }),
      ]);
    }
  }

  private async seedStats(): Promise<void> {
    const existingStats = await this.ctx.db.query('homeComponentStats').first();
    if (existingStats) {
      return;
    }

    const components = await this.ctx.db.query('homeComponents').collect();
    const counts: Record<string, number> = { active: 0, inactive: 0, total: 0 };
    for (const component of components) {
      counts.total += 1;
      if (component.active) {
        counts.active += 1;
      } else {
        counts.inactive += 1;
      }
      counts[component.type] = (counts[component.type] || 0) + 1;
    }

    await Promise.all(
      Object.entries(counts).map(([key, count]) => this.ctx.db.insert('homeComponentStats', { count, key }))
    );
  }
}
