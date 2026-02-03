/**
 * Seeder Registry - Export all seeders
 */

export { ProductSeeder } from './products.seeder';
export { ProductCategorySeeder } from './productCategories.seeder';
export { PostSeeder } from './posts.seeder';
export { OrderSeeder } from './orders.seeder';
export { CustomerSeeder } from './customers.seeder';
export { ServiceSeeder } from './services.seeder';

// Export types
export type { SeedConfig, SeedResult, SeedDependency } from './_base';
export { BaseSeeder, createSeeder, processBatch } from './_base';
export { createVietnameseFaker } from './_faker-vi';
export { 
  resolveDependencies, 
  checkDependencies,
  SEED_DEPENDENCIES,
  MODULE_METADATA,
  SEED_PRESETS,
  getDefaultQuantity,
  getModuleInfo,
  type PresetType,
} from './_dependencies';
