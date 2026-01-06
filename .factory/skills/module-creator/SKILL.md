---
name: module-creator
description: "Tạo module admin chuẩn cho hệ thống VietAdmin với Convex backend và Next.js frontend. Sử dụng khi user muốn: (1) Tạo module mới như Products, Orders, Customers, (2) Tạo CRUD pages cho admin, (3) Tạo system config page, (4) Tạo seed data và queries/mutations cho Convex. Module được tạo theo chuẩn Posts module với đầy đủ: Convex backend, admin pages (list/create/edit), system config page, seed data."
version: 1.0.0
---

# Module Creator - Tạo Module Admin Chuẩn

## Overview

Skill này giúp tạo module admin hoàn chỉnh theo chuẩn của hệ thống VietAdmin, bao gồm:

1. **Convex Backend**: Schema, queries, mutations
2. **Admin Pages**: List, Create, Edit pages với CRUD hoàn chỉnh
3. **System Config Page**: Quản lý features, fields, settings
4. **Seed Data**: Dữ liệu mẫu cho module

## Khi nào sử dụng

- User yêu cầu tạo module mới (Products, Orders, Customers, Media...)
- User muốn tạo CRUD pages cho một entity
- User cần system config page để quản lý cấu hình module
- User muốn tạo seed data cho module

## Quy trình tạo Module

### Phase 1: Thu thập thông tin

Hỏi user các thông tin sau:

```markdown
1. **Tên module**: VD: products, orders, customers
2. **Tên hiển thị**: VD: Sản phẩm, Đơn hàng, Khách hàng
3. **Các trường dữ liệu chính**: VD: name, price, description, status
4. **Có sub-entity không?**: VD: products có productCategories
5. **Các tính năng bổ sung**: VD: tags, featured, scheduling
6. **Icon module**: VD: Package, ShoppingBag, Users (Lucide icons)
7. **Category module**: content | commerce | user | system | marketing
```

### Phase 2: Tạo Convex Backend

#### 2.1 Tạo Schema (nếu chưa có)

Thêm vào `convex/schema.ts`:

```typescript
// Main entity
[moduleName]: defineTable({
  name: v.string(),
  slug: v.string(),
  // ... other fields
  status: v.union(v.literal("Active"), v.literal("Inactive")),
  order: v.number(),
})
  .index("by_slug", ["slug"])
  .index("by_status", ["status"])
  .index("by_order", ["order"]),

// Sub-entity (nếu có)
[moduleName]Categories: defineTable({
  name: v.string(),
  slug: v.string(),
  description: v.optional(v.string()),
  parentId: v.optional(v.id("[moduleName]Categories")),
  order: v.number(),
  active: v.boolean(),
})
  .index("by_slug", ["slug"])
  .index("by_parent", ["parentId"])
  .index("by_active", ["active"]),
```

#### 2.2 Tạo Queries/Mutations

File: `convex/[moduleName].ts`

```typescript
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const [moduleName]Doc = v.object({
  _id: v.id("[moduleName]"),
  _creationTime: v.number(),
  // ... fields
});

// Queries
export const listAll = query({
  args: {},
  returns: v.array([moduleName]Doc),
  handler: async (ctx) => {
    return await ctx.db.query("[moduleName]").collect();
  },
});

export const getById = query({
  args: { id: v.id("[moduleName]") },
  returns: v.union([moduleName]Doc, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Mutations
export const create = mutation({
  args: { /* fields */ },
  returns: v.id("[moduleName]"),
  handler: async (ctx, args) => {
    // Validation
    // Insert
  },
});

export const update = mutation({
  args: { id: v.id("[moduleName]"), /* fields */ },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Validation
    // Update
  },
});

export const remove = mutation({
  args: { id: v.id("[moduleName]") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return null;
  },
});
```

### Phase 3: Tạo Seed Data

Thêm vào `convex/seed.ts`:

```typescript
// Seed [ModuleName]
export const seed[ModuleName] = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const existing = await ctx.db.query("[moduleName]").first();
    if (existing) return null;

    // Seed categories (nếu có)
    const categories = [
      { name: "Category 1", slug: "category-1", order: 0, active: true },
      // ...
    ];
    const categoryIds: Id<"[moduleName]Categories">[] = [];
    for (const cat of categories) {
      const id = await ctx.db.insert("[moduleName]Categories", cat);
      categoryIds.push(id);
    }

    // Seed main entities
    const items = [
      { name: "Item 1", slug: "item-1", categoryId: categoryIds[0], status: "Active", order: 0 },
      // ...
    ];
    for (const item of items) {
      await ctx.db.insert("[moduleName]", item);
    }

    // Seed module features
    const features = [
      { moduleKey: "[moduleName]", featureKey: "enableTags", name: "Tags", enabled: true },
      // ...
    ];
    for (const f of features) {
      await ctx.db.insert("moduleFeatures", f);
    }

    // Seed module fields
    const fields = [
      { moduleKey: "[moduleName]", fieldKey: "name", name: "Tên", type: "string", required: true, enabled: true, isSystem: true, order: 0 },
      { moduleKey: "[moduleName]", fieldKey: "description", name: "Mô tả", type: "text", required: false, enabled: true, isSystem: false, order: 1 },
      // ...
    ];
    for (const f of fields) {
      await ctx.db.insert("moduleFields", f);
    }

    // Seed module settings
    const settings = [
      { moduleKey: "[moduleName]", settingKey: "itemsPerPage", value: 10 },
      { moduleKey: "[moduleName]", settingKey: "defaultStatus", value: "Active" },
    ];
    for (const s of settings) {
      await ctx.db.insert("moduleSettings", s);
    }

    return null;
  },
});

// Clear [ModuleName] Data
export const clear[ModuleName]Data = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const items = await ctx.db.query("[moduleName]").collect();
    for (const item of items) {
      await ctx.db.delete(item._id);
    }
    const cats = await ctx.db.query("[moduleName]Categories").collect();
    for (const cat of cats) {
      await ctx.db.delete(cat._id);
    }
    return null;
  },
});
```

### Phase 4: Tạo Admin Pages

#### 4.1 List Page

File: `app/admin/[module-name]/page.tsx`

```typescript
'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Plus, Edit, Trash2, Search, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Card, Badge, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui';
import { SortableHeader, BulkActionBar, SelectCheckbox, useSortableData } from '../components/TableUtilities';
import { ModuleGuard } from '../components/ModuleGuard';

export default function [ModuleName]ListPage() {
  return (
    <ModuleGuard moduleKey="[moduleName]">
      <[ModuleName]Content />
    </ModuleGuard>
  );
}

function [ModuleName]Content() {
  // Queries
  const itemsData = useQuery(api.[moduleName].listAll);
  const deleteItem = useMutation(api.[moduleName].remove);
  const seedModule = useMutation(api.seed.seed[ModuleName]);
  const clearData = useMutation(api.seed.clear[ModuleName]Data);

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Id<"[moduleName]">[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });

  const isLoading = itemsData === undefined;

  // Handlers
  const handleDelete = async (id: Id<"[moduleName]">) => {
    if (confirm('Xóa mục này?')) {
      await deleteItem({ id });
      toast.success('Đã xóa thành công');
    }
  };

  const handleReset = async () => {
    if (confirm('Reset dữ liệu?')) {
      await clearData();
      await seedModule();
      toast.success('Đã reset dữ liệu');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Render
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">[Module Display Name]</h1>
          <p className="text-sm text-slate-500">Quản lý [module display name]</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}><RefreshCw size={16}/> Reset</Button>
          <Link href="/admin/[module-name]/create">
            <Button><Plus size={16}/> Thêm mới</Button>
          </Link>
        </div>
      </div>

      {/* Table */}
      <Card>
        <Table>
          {/* ... table content */}
        </Table>
      </Card>
    </div>
  );
}
```

#### 4.2 Create Page

File: `app/admin/[module-name]/create/page.tsx`

```typescript
'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Card, CardContent, Input, Label } from '../../components/ui';

const MODULE_KEY = '[moduleName]';

export default function [ModuleName]CreatePage() {
  const router = useRouter();
  const createItem = useMutation(api.[moduleName].create);
  const fieldsData = useQuery(api.admin.modules.listEnabledModuleFields, { moduleKey: MODULE_KEY });

  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check enabled fields
  const enabledFields = useMemo(() => {
    const fields = new Set<string>();
    fieldsData?.forEach(f => fields.add(f.fieldKey));
    return fields;
  }, [fieldsData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createItem({ name, /* ... */ });
      toast.success('Tạo thành công');
      router.push('/admin/[module-name]');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Lỗi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="p-6 space-y-4">
          {/* System fields - always shown */}
          <div className="space-y-2">
            <Label>Tên <span className="text-red-500">*</span></Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          {/* Conditional fields */}
          {enabledFields.has('description') && (
            <div className="space-y-2">
              <Label>Mô tả</Label>
              <Input /* ... */ />
            </div>
          )}
        </CardContent>
      </Card>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2 size={16} className="animate-spin mr-2" />}
        Tạo mới
      </Button>
    </form>
  );
}
```

#### 4.3 Edit Page

File: `app/admin/[module-name]/[id]/edit/page.tsx`

Tương tự Create page nhưng:
- Lấy data từ `useQuery(api.[moduleName].getById, { id })`
- Dùng `useEffect` để sync state khi data load
- Gọi `updateItem` mutation thay vì `createItem`

### Phase 5: Tạo System Config Page

File: `app/system/modules/[module-name]/page.tsx`

```typescript
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { [Icon], Loader2, Database, Settings } from 'lucide-react';
import { FieldConfig } from '@/types/moduleConfig';
import { 
  ModuleHeader, ModuleStatus, ConventionNote, Code,
  SettingsCard, SettingInput, SettingSelect,
  FeaturesCard, FieldsCard
} from '@/components/modules/shared';
import { Card, Badge, Button, Table, /* ... */ } from '@/app/admin/components/ui';

const MODULE_KEY = '[moduleName]';

export default function [ModuleName]ConfigPage() {
  const [activeTab, setActiveTab] = useState<'config' | 'data'>('config');

  // Queries
  const moduleData = useQuery(api.admin.modules.getModuleByKey, { key: MODULE_KEY });
  const featuresData = useQuery(api.admin.modules.listModuleFeatures, { moduleKey: MODULE_KEY });
  const fieldsData = useQuery(api.admin.modules.listModuleFields, { moduleKey: MODULE_KEY });
  const settingsData = useQuery(api.admin.modules.listModuleSettings, { moduleKey: MODULE_KEY });
  const itemsData = useQuery(api.[moduleName].listAll);

  // Mutations
  const toggleFeature = useMutation(api.admin.modules.toggleModuleFeature);
  const updateField = useMutation(api.admin.modules.updateModuleField);
  const setSetting = useMutation(api.admin.modules.setModuleSetting);
  const seedModule = useMutation(api.seed.seed[ModuleName]);
  const clearData = useMutation(api.seed.clear[ModuleName]Data);

  // Local state for change tracking
  const [localFeatures, setLocalFeatures] = useState<Record<string, boolean>>({});
  const [localFields, setLocalFields] = useState<FieldConfig[]>([]);
  const [localSettings, setLocalSettings] = useState({ itemsPerPage: 10, defaultStatus: 'Active' });
  const [isSaving, setIsSaving] = useState(false);

  // Sync effects...
  // Change detection...
  // Save handler...

  // Tab: Config
  // Tab: Data (statistics, tables, seed/clear buttons)

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <ModuleHeader
        icon={[Icon]}
        title="Module [Display Name]"
        description="Cấu hình [module display name]"
        onSave={activeTab === 'config' ? handleSave : undefined}
        hasChanges={activeTab === 'config' ? hasChanges : false}
        isSaving={isSaving}
      />

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button onClick={() => setActiveTab('config')}>Cấu hình</button>
        <button onClick={() => setActiveTab('data')}>Dữ liệu</button>
      </div>

      {/* Tab content */}
      {activeTab === 'config' && (
        <>
          <ModuleStatus isCore={moduleData?.isCore} enabled={moduleData?.enabled} />
          {/* Settings, Features, Fields cards */}
        </>
      )}

      {activeTab === 'data' && (
        <>
          {/* Statistics cards */}
          {/* Data tables */}
          {/* Seed/Clear buttons */}
        </>
      )}
    </div>
  );
}
```

### Phase 6: Đăng ký Module

Thêm module vào `convex/seed.ts` trong `seedAll`:

```typescript
{ 
  key: "[moduleName]", 
  name: "[Display Name]", 
  description: "[Description]", 
  icon: "[Icon]", 
  category: "[category]" as const, 
  enabled: true, 
  isCore: false, 
  order: [number] 
},
```

### Phase 7: Thêm vào Sidebar

Cập nhật `app/admin/components/Sidebar.tsx`:

```typescript
{
  name: '[Display Name]',
  href: '/admin/[module-name]',
  icon: [Icon],
  moduleKey: '[moduleName]',
},
```

## Checklist hoàn thành Module

- [ ] **Convex Backend**
  - [ ] Schema trong `convex/schema.ts`
  - [ ] Queries/Mutations trong `convex/[moduleName].ts`
  - [ ] Sub-entity file (nếu có): `convex/[moduleName]Categories.ts`

- [ ] **Seed Data**
  - [ ] `seed[ModuleName]` mutation
  - [ ] `clear[ModuleName]Data` mutation
  - [ ] Module features seed
  - [ ] Module fields seed
  - [ ] Module settings seed

- [ ] **Admin Pages**
  - [ ] List page: `/admin/[module-name]/page.tsx`
  - [ ] Create page: `/admin/[module-name]/create/page.tsx`
  - [ ] Edit page: `/admin/[module-name]/[id]/edit/page.tsx`
  - [ ] Sub-entity pages (nếu có)

- [ ] **System Config Page**
  - [ ] Config page: `/system/modules/[module-name]/page.tsx`
  - [ ] Tab Cấu hình: Features, Fields, Settings
  - [ ] Tab Dữ liệu: Statistics, Tables, Seed/Clear

- [ ] **Integration**
  - [ ] Module registered in `seedAll`
  - [ ] Sidebar entry added
  - [ ] ModuleGuard wrapping admin pages

- [ ] **Testing**
  - [ ] TypeScript passes
  - [ ] ESLint passes
  - [ ] CRUD operations work
  - [ ] System config syncs with admin pages
  - [ ] Seed/Clear data works

## Convention Notes

1. **Naming**: Module key is camelCase (`products`), URL slug is kebab-case (`/admin/products`)
2. **Files**: Convex files are camelCase (`products.ts`), Next.js pages follow Next.js conventions
3. **System Fields**: `name`, `slug`, `order`, `status/active` - luôn required và enabled
4. **Optional Fields**: Có thể toggle on/off trong System Config
5. **Features**: Linked với fields - toggle feature = toggle linked field
6. **DRY**: Dùng shared components từ `@/components/modules/shared`

## Reference Files

Tham khảo module Posts đã hoàn thiện:

- `convex/posts.ts` - Queries/Mutations
- `convex/postCategories.ts` - Sub-entity
- `convex/seed.ts` - Seed functions
- `app/admin/posts/page.tsx` - List page
- `app/admin/posts/create/page.tsx` - Create page
- `app/admin/posts/[id]/edit/page.tsx` - Edit page
- `app/admin/post-categories/*` - Sub-entity pages
- `app/system/modules/posts/page.tsx` - System config
