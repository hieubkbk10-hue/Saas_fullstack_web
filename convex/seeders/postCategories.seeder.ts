/**
 * Post Category Seeder
 */

import { BaseSeeder, type SeedDependency } from './base';
import type { Doc } from '../_generated/dataModel';

type PostCategoryData = Omit<Doc<'postCategories'>, '_creationTime' | '_id'>;

const CATEGORIES = [
  { description: 'Tin tức mới nhất', name: 'Tin tức' },
  { description: 'Bài viết hướng dẫn', name: 'Hướng dẫn' },
  { description: 'Khuyến mãi & ưu đãi', name: 'Khuyến mãi' },
  { description: 'Chia sẻ kinh nghiệm', name: 'Kinh nghiệm' },
  { description: 'Góc giải đáp', name: 'Hỏi đáp' },
];

export class PostCategorySeeder extends BaseSeeder<PostCategoryData> {
  moduleName = 'postCategories';
  tableName = 'postCategories';
  dependencies: SeedDependency[] = [];

  private categoryIndex = 0;

  generateFake(): PostCategoryData {
    const cat = CATEGORIES[this.categoryIndex % CATEGORIES.length];
    const slug = this.slugify(cat.name);

    const data: PostCategoryData = {
      active: this.randomBoolean(0.9),
      description: cat.description,
      name: cat.name,
      order: this.categoryIndex,
      slug: this.categoryIndex > 0 ? `${slug}-${this.categoryIndex}` : slug,
      thumbnail: this.randomBoolean(0.4)
        ? `https://picsum.photos/seed/post-cat-${this.categoryIndex}/600/400`
        : undefined,
    };

    this.categoryIndex += 1;
    return data;
  }

  validateRecord(record: PostCategoryData): boolean {
    return !!record.name && !!record.slug;
  }
}
