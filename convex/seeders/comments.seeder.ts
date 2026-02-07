/**
 * Comments Seeder
 */

import { BaseSeeder, type SeedConfig, type SeedDependency } from './base';
import type { Doc, DataModel } from '../_generated/dataModel';
import type { GenericMutationCtx } from 'convex/server';

type CommentData = Omit<Doc<'comments'>, '_creationTime' | '_id'>;

type CommentTarget = {
  id: string;
  type: CommentData['targetType'];
};

export class CommentsSeeder extends BaseSeeder<CommentData> {
  moduleName = 'comments';
  tableName = 'comments';
  dependencies: SeedDependency[] = [
    { module: 'posts', required: false },
    { module: 'products', required: false },
    { module: 'services', required: false },
  ];

  private targets: CommentTarget[] = [];
  private customers: Doc<'customers'>[] = [];

  constructor(ctx: GenericMutationCtx<DataModel>) {
    super(ctx);
  }

  async seed(config: SeedConfig) {
    await this.seedModuleConfig();
    const [posts, products, services, customers] = await Promise.all([
      this.ctx.db.query('posts').collect(),
      this.ctx.db.query('products').collect(),
      this.ctx.db.query('services').collect(),
      this.ctx.db.query('customers').collect(),
    ]);

    this.targets = [
      ...posts.map(post => ({ id: post._id, type: 'post' as const })),
      ...products.map(product => ({ id: product._id, type: 'product' as const })),
      ...services.map(service => ({ id: service._id, type: 'service' as const })),
    ];
    this.customers = customers;

    if (this.targets.length === 0) {
      throw new Error('No targets found for comments. Seed posts/products/services first.');
    }

    return super.seed(config);
  }

  generateFake(): CommentData {
    const target = this.randomElement(this.targets);
    const status = this.faker.helpers.weightedArrayElement([
      { value: 'Approved' as const, weight: 7 },
      { value: 'Pending' as const, weight: 2 },
      { value: 'Spam' as const, weight: 1 },
    ]);

    const hasRating = target.type !== 'post' && this.randomBoolean(0.6);
    const customer = this.customers.length > 0 && this.randomBoolean(0.5)
      ? this.randomElement(this.customers)
      : undefined;

    return {
      authorEmail: this.randomBoolean(0.7) ? this.faker.internet.email() : undefined,
      authorIp: this.randomBoolean(0.5) ? this.faker.internet.ip() : undefined,
      authorName: customer?.name ?? this.faker.person.fullName(),
      content: this.faker.lorem.sentences({ max: 3, min: 1 }),
      customerId: customer?._id,
      likesCount: this.randomBoolean(0.4) ? this.randomInt(0, 50) : undefined,
      parentId: undefined,
      rating: hasRating ? this.randomInt(1, 5) : undefined,
      status,
      targetId: target.id,
      targetType: target.type,
    };
  }

  validateRecord(record: CommentData): boolean {
    return !!record.authorName && !!record.content && !!record.targetId;
  }

  private async seedModuleConfig(): Promise<void> {
    const existingFeatures = await this.ctx.db
      .query('moduleFeatures')
      .withIndex('by_module', q => q.eq('moduleKey', 'comments'))
      .first();
    if (!existingFeatures) {
      const features = [
        { description: 'Cho phép like/dislike bình luận', enabled: false, featureKey: 'enableLikes', linkedFieldKey: 'likesCount', moduleKey: 'comments', name: 'Lượt thích' },
        { description: 'Cho phép reply bình luận', enabled: true, featureKey: 'enableReplies', linkedFieldKey: 'parentId', moduleKey: 'comments', name: 'Trả lời' },
      ];
      await Promise.all(features.map(feature => this.ctx.db.insert('moduleFeatures', feature)));
    }

    const existingFields = await this.ctx.db
      .query('moduleFields')
      .withIndex('by_module', q => q.eq('moduleKey', 'comments'))
      .collect();
    if (existingFields.length === 0) {
      const fields = [
        { enabled: true, fieldKey: 'content', isSystem: true, moduleKey: 'comments', name: 'Nội dung', order: 0, required: true, type: 'textarea' as const },
        { enabled: true, fieldKey: 'authorName', isSystem: true, moduleKey: 'comments', name: 'Tên người bình luận', order: 1, required: true, type: 'text' as const },
        { enabled: true, fieldKey: 'authorEmail', isSystem: false, moduleKey: 'comments', name: 'Email', order: 2, required: false, type: 'email' as const },
        { enabled: true, fieldKey: 'targetType', isSystem: true, moduleKey: 'comments', name: 'Loại đối tượng', order: 3, required: true, type: 'select' as const },
        { enabled: true, fieldKey: 'targetId', isSystem: true, moduleKey: 'comments', name: 'ID đối tượng', order: 4, required: true, type: 'text' as const },
        { enabled: true, fieldKey: 'status', isSystem: true, moduleKey: 'comments', name: 'Trạng thái', order: 5, required: true, type: 'select' as const },
        { enabled: true, fieldKey: 'rating', isSystem: false, moduleKey: 'comments', name: 'Đánh giá', order: 6, required: false, type: 'number' as const },
        { enabled: true, fieldKey: 'parentId', isSystem: false, linkedFeature: 'enableReplies', moduleKey: 'comments', name: 'Bình luận cha', order: 7, required: false, type: 'select' as const },
        { enabled: false, fieldKey: 'authorIp', isSystem: false, moduleKey: 'comments', name: 'IP', order: 8, required: false, type: 'text' as const },
        { enabled: false, fieldKey: 'likesCount', isSystem: false, linkedFeature: 'enableLikes', moduleKey: 'comments', name: 'Số lượt thích', order: 9, required: false, type: 'number' as const },
      ];
      await Promise.all(fields.map(field => this.ctx.db.insert('moduleFields', field)));
    } else if (!existingFields.some(field => field.fieldKey === 'rating')) {
      await this.ctx.db.insert('moduleFields', {
        enabled: true,
        fieldKey: 'rating',
        isSystem: false,
        moduleKey: 'comments',
        name: 'Đánh giá',
        order: 6,
        required: false,
        type: 'number' as const,
      });
    }

    const existingSettings = await this.ctx.db
      .query('moduleSettings')
      .withIndex('by_module', q => q.eq('moduleKey', 'comments'))
      .first();
    if (!existingSettings) {
      await Promise.all([
        this.ctx.db.insert('moduleSettings', { moduleKey: 'comments', settingKey: 'commentsPerPage', value: 20 }),
        this.ctx.db.insert('moduleSettings', { moduleKey: 'comments', settingKey: 'defaultStatus', value: 'Pending' }),
      ]);
    }
  }
}
