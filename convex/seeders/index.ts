/**
 * Seeder Registry - Export all seeders
 */

export { ProductSeeder } from './products.seeder';
export { seedProductVariants } from './variants.seeder';
export { seedVariantPresetOptions } from './variantPresets.seeder';
export { seedPresetProductOptions, PRESET_PRODUCT_OPTIONS } from './productOptions.seeder';
export { ProductCategorySeeder } from './productCategories.seeder';
export { PostSeeder } from './posts.seeder';
export { OrderSeeder } from './orders.seeder';
export { CustomerSeeder } from './customers.seeder';
export { PromotionsSeeder } from './promotions.seeder';
export { ServiceSeeder } from './services.seeder';

// Export types
export type { SeedConfig, SeedResult, SeedDependency } from './base';
export { BaseSeeder, createSeeder, processBatch } from './base';
export { createVietnameseFaker } from './fakerVi';
export { 
  resolveDependencies, 
  checkDependencies,
  SEED_DEPENDENCIES,
  MODULE_METADATA,
  SEED_PRESETS,
  getDefaultQuantity,
  getModuleInfo,
  type PresetType,
} from './dependencies';
