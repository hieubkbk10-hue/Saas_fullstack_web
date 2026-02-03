/**
 * Post Seeder
 * 
 * Generates blog posts with Vietnamese content
 */

import { BaseSeeder, type SeedConfig, type SeedDependency } from './base';
import { createVietnameseFaker } from './fakerVi';
import type { Doc, DataModel } from '../_generated/dataModel';
import type { GenericMutationCtx } from 'convex/server';

type PostData = Omit<Doc<'posts'>, '_id' | '_creationTime'>;

export class PostSeeder extends BaseSeeder<PostData> {
  moduleName = 'posts';
  tableName = 'posts';
  dependencies: SeedDependency[] = [
    { minRecords: 1, module: 'postCategories', required: true },
    { minRecords: 1, module: 'users', required: false },
  ];
  
  private categories: Doc<'postCategories'>[] = [];
  private users: Doc<'users'>[] = [];
  private viFaker: ReturnType<typeof createVietnameseFaker>;
  private postCount = 0;
  
  constructor(ctx: GenericMutationCtx<DataModel>) {
    super(ctx);
    this.viFaker = createVietnameseFaker(this.faker);
  }
  
  async seed(config: SeedConfig) {
    // Load dependencies
    [this.categories, this.users] = await Promise.all([
      this.ctx.db.query('postCategories').collect(),
      this.ctx.db.query('users').collect(),
    ]);
    
    if (this.categories.length === 0) {
      throw new Error('No post categories found. Seed postCategories first.');
    }
    
    console.log(`[PostSeeder] Found ${this.categories.length} categories, ${this.users.length} users`);
    
    return super.seed(config);
  }
  
  generateFake(): PostData {
    const category = this.randomElement(this.categories);
    const title = this.viFaker.postTitle();
    const slug = this.slugify(title) + '-' + this.postCount++;
    
    const status = this.faker.helpers.weightedArrayElement([
      { value: 'Published' as const, weight: 7 },
      { value: 'Draft' as const, weight: 2 },
      { value: 'Archived' as const, weight: 1 },
    ]);
    
    // Generate content với multiple paragraphs
    const paragraphCount = this.randomInt(3, 8);
    const content = Array.from({ length: paragraphCount }, () => 
      `<p>${this.faker.lorem.paragraph()}</p>`
    ).join('\n');
    
    return {
      authorName: this.users.length > 0 
        ? this.randomElement(this.users).name 
        : this.viFaker.fullName(),
      categoryId: category._id,
      content,
      excerpt: this.viFaker.postExcerpt(),
      order: this.postCount,
      publishedAt: status === 'Published' 
        ? Date.now() - this.randomInt(0, 30 * 24 * 60 * 60 * 1000) // Last 30 days
        : undefined,
      slug,
      status,
      thumbnail: `https://picsum.photos/seed/${slug}/800/600`,
      title,
      views: status === 'Published' ? this.randomInt(0, 5000) : 0,
    };
  }
  
  validateRecord(record: PostData): boolean {
    return (
      !!record.title &&
      !!record.slug &&
      !!record.content &&
      !!record.categoryId
    );
  }
}
