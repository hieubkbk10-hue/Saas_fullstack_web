/**
 * Media Seeder
 */

import { BaseSeeder, type SeedConfig, type SeedDependency, type SeedResult } from './base';
import type { DataModel } from '../_generated/dataModel';
import type { GenericMutationCtx } from 'convex/server';

export class MediaSeeder extends BaseSeeder {
  moduleName = 'media';
  tableName = 'images';
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

    await this.seedModuleConfig();

    return {
      created: 0,
      dependencies: [],
      duration: Date.now() - startTime,
      module: this.moduleName,
      skipped: 0,
    };
  }

  generateFake(): unknown {
    return {};
  }

  validateRecord(): boolean {
    return true;
  }

  protected async clear(): Promise<void> {
    const images = await this.ctx.db.query('images').collect();
    for (const img of images) {
      try {
        await this.ctx.storage.delete(img.storageId);
      } catch {
        // ignore missing storage
      }
      await this.ctx.db.delete(img._id);
    }

    const [stats, folders] = await Promise.all([
      this.ctx.db.query('mediaStats').collect(),
      this.ctx.db.query('mediaFolders').collect(),
    ]);
    await Promise.all([
      ...stats.map(stat => this.ctx.db.delete(stat._id)),
      ...folders.map(folder => this.ctx.db.delete(folder._id)),
    ]);
  }

  private async seedModuleConfig(): Promise<void> {
    const existingFeatures = await this.ctx.db
      .query('moduleFeatures')
      .withIndex('by_module', q => q.eq('moduleKey', 'media'))
      .first();
    if (!existingFeatures) {
      const features = [
        { description: 'Tổ chức media theo thư mục', enabled: true, featureKey: 'enableFolders', linkedFieldKey: 'folder', moduleKey: 'media', name: 'Thư mục' },
        { description: 'Mô tả thay thế cho hình ảnh (SEO)', enabled: true, featureKey: 'enableAltText', linkedFieldKey: 'alt', moduleKey: 'media', name: 'Alt Text' },
        { description: 'Lưu width/height của ảnh', enabled: true, featureKey: 'enableDimensions', linkedFieldKey: 'dimensions', moduleKey: 'media', name: 'Kích thước ảnh' },
      ];
      await Promise.all(features.map(feature => this.ctx.db.insert('moduleFeatures', feature)));
    }

    const existingFields = await this.ctx.db
      .query('moduleFields')
      .withIndex('by_module', q => q.eq('moduleKey', 'media'))
      .first();
    if (!existingFields) {
      const fields = [
        { enabled: true, fieldKey: 'filename', isSystem: true, moduleKey: 'media', name: 'Tên file', order: 0, required: true, type: 'text' as const },
        { enabled: true, fieldKey: 'mimeType', isSystem: true, moduleKey: 'media', name: 'Loại file', order: 1, required: true, type: 'text' as const },
        { enabled: true, fieldKey: 'size', isSystem: true, moduleKey: 'media', name: 'Kích thước', order: 2, required: true, type: 'number' as const },
        { enabled: true, fieldKey: 'storageId', isSystem: true, moduleKey: 'media', name: 'Storage ID', order: 3, required: true, type: 'text' as const },
        { enabled: true, fieldKey: 'folder', isSystem: false, linkedFeature: 'enableFolders', moduleKey: 'media', name: 'Thư mục', order: 4, required: false, type: 'select' as const },
        { enabled: true, fieldKey: 'alt', isSystem: false, linkedFeature: 'enableAltText', moduleKey: 'media', name: 'Alt Text', order: 5, required: false, type: 'text' as const },
        { enabled: true, fieldKey: 'width', isSystem: false, linkedFeature: 'enableDimensions', moduleKey: 'media', name: 'Chiều rộng', order: 6, required: false, type: 'number' as const },
        { enabled: true, fieldKey: 'height', isSystem: false, linkedFeature: 'enableDimensions', moduleKey: 'media', name: 'Chiều cao', order: 7, required: false, type: 'number' as const },
        { enabled: false, fieldKey: 'uploadedBy', isSystem: false, moduleKey: 'media', name: 'Người upload', order: 8, required: false, type: 'select' as const },
      ];
      await Promise.all(fields.map(field => this.ctx.db.insert('moduleFields', field)));
    }

    const existingSettings = await this.ctx.db
      .query('moduleSettings')
      .withIndex('by_module', q => q.eq('moduleKey', 'media'))
      .first();
    if (!existingSettings) {
      await Promise.all([
        this.ctx.db.insert('moduleSettings', { moduleKey: 'media', settingKey: 'itemsPerPage', value: 24 }),
        this.ctx.db.insert('moduleSettings', { moduleKey: 'media', settingKey: 'maxFileSize', value: 5 }),
        this.ctx.db.insert('moduleSettings', { moduleKey: 'media', settingKey: 'allowedTypes', value: 'image/*,video/*,application/pdf' }),
      ]);
    }
  }
}
