import type { GenericMutationCtx } from 'convex/server';
import type { DataModel } from '../_generated/dataModel';
import type { BaseSeeder } from './base';
import { CustomerSeeder } from './customers.seeder';
import { OrderSeeder } from './orders.seeder';
import { PostSeeder } from './posts.seeder';
import { ProductCategorySeeder } from './productCategories.seeder';
import { ProductSeeder } from './products.seeder';
import { PromotionsSeeder } from './promotions.seeder';
import { ServiceSeeder } from './services.seeder';

export type SeederConstructor = new (ctx: GenericMutationCtx<DataModel>) => BaseSeeder;

export const SEEDER_REGISTRY: Record<string, SeederConstructor> = {
  customers: CustomerSeeder,
  orders: OrderSeeder,
  postCategories: ProductCategorySeeder,
  posts: PostSeeder,
  productCategories: ProductCategorySeeder,
  products: ProductSeeder,
  promotions: PromotionsSeeder,
  serviceCategories: ProductCategorySeeder,
  services: ServiceSeeder,
};

export function getSeeder(moduleKey: string): SeederConstructor | undefined {
  return SEEDER_REGISTRY[moduleKey];
}

export function listSeedableModuleKeys(): string[] {
  return Object.keys(SEEDER_REGISTRY);
}
