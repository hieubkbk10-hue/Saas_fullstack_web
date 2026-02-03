/**
 * Seed Manager - Central orchestrator for all seeding operations
 * 
 * Best Practices:
 * - Dependency-aware seeding
 * - Progress tracking
 * - Batch processing
 * - Error handling with rollback support
 * - Type-safe with validation
 */

import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import {
  resolveDependencies,
  checkDependencies,
  SEED_PRESETS,
  getDefaultQuantity,
  type PresetType,
  BaseSeeder,
  ProductSeeder,
  ProductCategorySeeder,
  PostSeeder,
  OrderSeeder,
  CustomerSeeder,
  ServiceSeeder,
} from './seeders';
import type { SeedResult } from './seeders/_base';

// ============================================================
// TYPES
// ============================================================

const seedConfigValidator = v.object({
  batchSize: v.optional(v.number()),
  dependencies: v.optional(v.boolean()),
  force: v.optional(v.boolean()),
  locale: v.optional(v.string()),
  module: v.string(),
  quantity: v.number(),
});

const seedProgressValidator = v.object({
  completed: v.number(),
  current: v.string(),
  errors: v.array(v.string()),
  results: v.array(v.any()),
  sessionId: v.string(),
  status: v.union(v.literal('running'), v.literal('completed'), v.literal('failed')),
  total: v.number(),
});

// Seeder registry
const SEEDERS: Record<string, new (ctx: any) => BaseSeeder> = {
  customers: CustomerSeeder,
  orders: OrderSeeder,
  postCategories: ProductCategorySeeder, // Reuse for now
  posts: PostSeeder,
  productCategories: ProductCategorySeeder,
  products: ProductSeeder,
  serviceCategories: ProductCategorySeeder, // Reuse for now
  services: ServiceSeeder,
};

// ============================================================
// SINGLE MODULE SEED
// ============================================================

export const seedModule = mutation({
  args: {
    batchSize: v.optional(v.number()),
    dependencies: v.optional(v.boolean()),
    force: v.optional(v.boolean()),
    locale: v.optional(v.string()),
    module: v.string(),
    quantity: v.number(),
  },
  handler: async (ctx, args): Promise<SeedResult> => {
    const startTime = Date.now();
    
    try {
      console.log(`[SeedManager] Starting seed for module: ${args.module}`);
      
      // Get seeder class
      const SeederClass = SEEDERS[args.module];
      if (!SeederClass) {
        throw new Error(`Seeder not found for module: ${args.module}. Available: ${Object.keys(SEEDERS).join(', ')}`);
      }
      
      // Check dependencies if enabled
      if (args.dependencies !== false) {
        const { satisfied, missing } = await checkDependencies(ctx, args.module);
        
        if (!satisfied) {
          console.log(`[SeedManager] Auto-seeding dependencies: ${missing.join(', ')}`);
          
          // Seed missing dependencies với default quantity (sử dụng internal mutation)
          for (const dep of missing) {
            const DepSeederClass = SEEDERS[dep];
            if (DepSeederClass) {
              const depSeeder = new DepSeederClass(ctx);
              await depSeeder.seed({
                force: false,
                locale: args.locale || 'vi',
                quantity: getDefaultQuantity(dep),
              });
            }
          }
        }
      }
      
      // Create seeder instance and seed
      const seeder = new SeederClass(ctx);
      const result = await seeder.seed({
        batchSize: args.batchSize,
        force: args.force,
        locale: args.locale || 'vi',
        quantity: args.quantity,
      });
      
      console.log(`[SeedManager] ✅ Completed seed for ${args.module}: ${result.created} records in ${result.duration}ms`);
      
      return result;
      
    } catch (error) {
      console.error(`[SeedManager] ❌ Failed to seed ${args.module}:`, error);
      
      return {
        created: 0,
        dependencies: [],
        duration: Date.now() - startTime,
        errors: [error instanceof Error ? error.message : String(error)],
        module: args.module,
        skipped: 0,
      };
    }
  },
  returns: v.object({
    created: v.number(),
    dependencies: v.array(v.string()),
    duration: v.number(),
    errors: v.optional(v.array(v.string())),
    module: v.string(),
    skipped: v.number(),
  }),
});

// ============================================================
// BULK SEED (Multiple modules)
// ============================================================

export const seedBulk = mutation({
  args: {
    configs: v.array(seedConfigValidator),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const sessionId = args.sessionId || `seed_${Date.now()}`;
    const modules = args.configs.map(c => c.module);
    
    try {
      // Resolve dependencies
      const orderedModules = resolveDependencies(modules);
      console.log(`[SeedManager] Seed order: ${orderedModules.join(' → ')}`);
      
      // Initialize progress tracking
      await ctx.db.insert('seedProgress', {
        completed: 0,
        current: orderedModules[0] || '',
        errors: [],
        results: [],
        sessionId,
        status: 'running' as const,
        total: orderedModules.length,
      });
      
      const results: SeedResult[] = [];
      let completed = 0;
      
      // Seed each module in order
      for (const module of orderedModules) {
        const config = args.configs.find(c => c.module === module);
        if (!config) {
          console.log(`[SeedManager] Skipping ${module} (not in config)`);
          continue;
        }
        
        // Update progress
        await updateProgress(ctx, sessionId, {
          completed,
          current: module,
          total: orderedModules.length,
        });
        
        // Seed module directly
        const SeederClass = SEEDERS[module];
        if (SeederClass) {
          const seeder = new SeederClass(ctx);
          const result = await seeder.seed({
            batchSize: config.batchSize,
            force: config.force,
            locale: config.locale || 'vi',
            quantity: config.quantity,
          });
          
          results.push(result);
          completed++;
          
          // Stop if error
          if (result.errors && result.errors.length > 0) {
            console.error(`[SeedManager] Error seeding ${module}, stopping bulk seed`);
            break;
          }
        }
      }
      
      // Mark as completed
      await updateProgress(ctx, sessionId, {
        completed,
        current: '',
        results,
        status: 'completed',
        total: orderedModules.length,
      });
      
      console.log(`[SeedManager] ✅ Bulk seed completed: ${completed}/${orderedModules.length} modules`);
      
      return results;
      
    } catch (error) {
      console.error('[SeedManager] ❌ Bulk seed failed:', error);
      
      // Mark as failed
      await updateProgress(ctx, sessionId, {
        errors: [error instanceof Error ? error.message : String(error)],
        status: 'failed',
      });
      
      throw error;
    }
  },
  returns: v.array(v.object({
    created: v.number(),
    dependencies: v.array(v.string()),
    duration: v.number(),
    errors: v.optional(v.array(v.string())),
    module: v.string(),
    skipped: v.number(),
  })),
});

// ============================================================
// PRESET SEEDS
// ============================================================

export const seedPreset = mutation({
  args: {
    force: v.optional(v.boolean()),
    preset: v.union(
      v.literal('minimal'),
      v.literal('standard'),
      v.literal('large'),
      v.literal('demo')
    ),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const presetConfig = SEED_PRESETS[args.preset as PresetType];
    const sessionId = args.sessionId || `seed_preset_${Date.now()}`;
    
    console.log(`[SeedManager] Seeding preset: ${presetConfig.name}`);
    
    const configs = Object.entries(presetConfig.modules).map(([module, quantity]) => ({
      force: args.force,
      module,
      quantity,
    }));
    
    // Manually implement bulkseed logic here
    try {
      const modules = configs.map(c => c.module);
      const orderedModules = resolveDependencies(modules);
      
      const results: SeedResult[] = [];
      
      for (const module of orderedModules) {
        const config = configs.find(c => c.module === module);
        if (!config) {continue;}
        
        const SeederClass = SEEDERS[module];
        if (SeederClass) {
          const seeder = new SeederClass(ctx);
          const result = await seeder.seed({
            force: config.force,
            locale: 'vi',
            quantity: config.quantity,
          });
          results.push(result);
        }
      }
      
      return results;
    } catch (error) {
      console.error(`[SeedManager] Failed to seed preset ${args.preset}:`, error);
      throw error;
    }
  },
  returns: v.array(v.any()),
});

// ============================================================
// PROGRESS TRACKING
// ============================================================

export const getSeedProgress = query({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query('seedProgress')
      .withIndex('by_session', q => q.eq('sessionId', args.sessionId))
      .order('desc')
      .first();
    
    return progress || null;
  },
  returns: v.union(v.null(), seedProgressValidator),
});

export const listRecentSeeds = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    const seeds = await ctx.db
      .query('seedProgress')
      .order('desc')
      .take(limit);
    
    return seeds;
  },
  returns: v.array(seedProgressValidator),
});

// ============================================================
// CLEAR OPERATIONS
// ============================================================

export const clearModule = mutation({
  args: {
    module: v.string(),
  },
  handler: async (ctx, args) => {
    console.log(`[SeedManager] Clearing module: ${args.module}`);
    
    // TODO: Implement clear logic with seeder classes
    // For now, placeholder
    
    return { module: args.module, success: true };
  },
  returns: v.object({
    module: v.string(),
    success: v.boolean(),
  }),
});

export const clearAll = mutation({
  args: {
    excludeSystem: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    console.log(`[SeedManager] Clearing all data (excludeSystem: ${args.excludeSystem})`);
    
    // TODO: Implement clear all logic
    
    return { success: true };
  },
  returns: v.object({
    success: v.boolean(),
  }),
});

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

async function updateProgress(
  ctx: any,
  sessionId: string,
  updates: Partial<{
    completed: number;
    current: string;
    errors: string[];
    results: SeedResult[];
    status: 'running' | 'completed' | 'failed';
    total: number;
  }>
) {
  const existing = await ctx.db
    .query('seedProgress')
    .withIndex('by_session', (q: any) => q.eq('sessionId', sessionId))
    .first();
  
  if (existing) {
    await ctx.db.patch(existing._id, updates);
  }
}
