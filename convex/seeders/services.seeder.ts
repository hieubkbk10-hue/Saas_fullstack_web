/**
 * Service Seeder
 * 
 * Generates service data
 */

import { BaseSeeder, type SeedDependency } from './base';
import { createVietnameseFaker } from './fakerVi';
import type { Doc } from '../_generated/dataModel';

type ServiceData = Omit<Doc<'services'>, '_id' | '_creationTime'>;

export class ServiceSeeder extends BaseSeeder<ServiceData> {
  moduleName = 'services';
  tableName = 'services';
  dependencies: SeedDependency[] = [
    { minRecords: 1, module: 'serviceCategories', required: true },
  ];
  
  private categories: Doc<'serviceCategories'>[] = [];
  private viFaker: ReturnType<typeof createVietnameseFaker>;
  private serviceCount = 0;
  
  constructor(ctx: any) {
    super(ctx);
    this.viFaker = createVietnameseFaker(this.faker);
  }
  
  async seed(config: any) {
    this.categories = await this.ctx.db.query('serviceCategories').collect();
    
    if (this.categories.length === 0) {
      throw new Error('No service categories found. Seed serviceCategories first.');
    }
    
    return super.seed(config);
  }
  
  generateFake(): ServiceData {
    const category = this.randomElement(this.categories);
    const title = this.viFaker.serviceName();
    const slug = this.slugify(title) + '-' + this.serviceCount++;
    
    const hasPrice = this.randomBoolean(0.7); // 70% có giá
    const price = hasPrice ? this.randomInt(500_000, 20_000_000) : undefined;
    
    const status = this.faker.helpers.weightedArrayElement([
      { value: 'Published' as const, weight: 7 },
      { value: 'Draft' as const, weight: 2 },
      { value: 'Archived' as const, weight: 1 },
    ]);
    
    return {
      categoryId: category._id,
      content: `<p>${this.faker.lorem.paragraphs(3, '</p><p>')}</p>`,
      order: this.serviceCount,
      price,
      slug,
      status,
      thumbnail: `https://picsum.photos/seed/${slug}/600/400`,
      title,
      views: status === 'Published' ? this.randomInt(0, 1000) : 0,
    };
  }
  
  validateRecord(record: ServiceData): boolean {
    return !!record.title && !!record.slug && !!record.categoryId;
  }
}
