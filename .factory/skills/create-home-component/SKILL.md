---
name: create-home-component
description: Tạo Home Component mới cho hệ thống VietAdmin với trang /create, /edit và preview responsive. Sử dụng khi user muốn thêm loại component mới cho homepage như Banner, Pricing, Newsletter, Map, v.v. Skill này hướng dẫn tạo đầy đủ form config, 3-5 styles preview và tích hợp vào ComponentRenderer.
---

# Create Home Component

Skill này hướng dẫn tạo một Home Component mới cho hệ thống VietAdmin, bao gồm:
- Trang `/admin/home-components/create/[component-name]/page.tsx`
- Preview component với 3-5 styles trong `previews.tsx`
- Tích hợp vào `ComponentRenderer.tsx` để render trên trang chủ
- Cập nhật trang edit `[id]/edit/page.tsx`

## Cấu trúc hiện tại

```
app/admin/home-components/
├── page.tsx                           # Danh sách components
├── previews.tsx                       # TẤT CẢ preview components
├── create/
│   ├── page.tsx                       # Chọn loại component
│   ├── shared.tsx                     # Shared utilities, hooks, ComponentFormWrapper
│   ├── hero/page.tsx                  # Từng loại component
│   ├── stats/page.tsx
│   ├── about/page.tsx
│   ├── team/page.tsx
│   ├── features/page.tsx
│   └── ...
└── [id]/
    └── edit/page.tsx                  # Edit page cho TẤT CẢ components

components/site/
└── ComponentRenderer.tsx              # Render component trên site chính
```

## Best Practices & Conventions

### 1. Naming Convention
- **Component Type**: PascalCase, singular (e.g., `Newsletter`, `MapLocation`, `Countdown`)
- **Route**: kebab-case (e.g., `/create/newsletter`, `/create/map-location`)
- **Style Types**: camelCase (e.g., `fullWidth`, `splitScreen`, `minimal`)

### 2. State Management Pattern
```tsx
// Trong create page
const [items, setItems] = useState<ItemType[]>([/* default data */]);
const [style, setStyle] = useState<ComponentStyle>('defaultStyle');

// Submit handler
const onSubmit = (e: React.FormEvent) => {
  handleSubmit(e, { 
    items: items.map(i => ({ /* chỉ lấy fields cần lưu */ })), 
    style 
  });
};
```

### 3. Preview Component Pattern
```tsx
export type ComponentStyle = 'style1' | 'style2' | 'style3';

export const ComponentPreview = ({ 
  items, 
  brandColor, 
  selectedStyle, 
  onStyleChange 
}: { 
  items: ItemType[];
  brandColor: string;
  selectedStyle?: ComponentStyle;
  onStyleChange?: (style: ComponentStyle) => void;
}) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const previewStyle = selectedStyle || 'style1';
  const setPreviewStyle = (s: string) => onStyleChange?.(s as ComponentStyle);
  const styles = [
    { id: 'style1', label: 'Style 1' },
    { id: 'style2', label: 'Style 2' },
    { id: 'style3', label: 'Style 3' },
  ];

  return (
    <PreviewWrapper 
      title="Preview Component Name" 
      device={device} 
      setDevice={setDevice} 
      previewStyle={previewStyle} 
      setPreviewStyle={setPreviewStyle} 
      styles={styles}
    >
      <BrowserFrame>
        {previewStyle === 'style1' && renderStyle1()}
        {previewStyle === 'style2' && renderStyle2()}
        {previewStyle === 'style3' && renderStyle3()}
      </BrowserFrame>
    </PreviewWrapper>
  );
};
```

### 4. Config Structure Pattern
```tsx
// Mỗi component có config riêng, lưu vào DB dưới dạng:
{
  type: 'ComponentName',
  title: 'Display Title',
  active: true,
  order: 1,
  config: {
    items: [...],      // Hoặc members, plans, slides, etc.
    style: 'style1',   // Style đã chọn
    // ...other config
  }
}
```

## Checklist tạo Home Component mới

### Step 1: Định nghĩa Component Type

Trong `shared.tsx`, thêm vào `COMPONENT_TYPES`:
```tsx
{ 
  value: 'ComponentName',          // PascalCase, dùng cho DB
  label: 'Tên hiển thị',           // Tiếng Việt
  icon: IconComponent,             // Từ lucide-react
  description: 'Mô tả ngắn',
  route: 'component-name'          // kebab-case cho URL
}
```

### Step 2: Tạo Create Page

File: `create/[component-name]/page.tsx`

```tsx
'use client';

import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '../../../components/ui';
import { ComponentFormWrapper, useComponentForm, useBrandColor } from '../shared';
import { ComponentPreview, type ComponentStyle } from '../../previews';

interface ItemType {
  id: number;
  field1: string;
  field2: string;
}

export default function ComponentCreatePage() {
  const { title, setTitle, active, setActive, handleSubmit, isSubmitting } = useComponentForm('Default Title', 'ComponentName');
  const brandColor = useBrandColor();
  
  // State cho config
  const [items, setItems] = useState<ItemType[]>([
    { id: 1, field1: 'Default', field2: 'Value' }
  ]);
  const [style, setStyle] = useState<ComponentStyle>('style1');

  const onSubmit = (e: React.FormEvent) => {
    handleSubmit(e, { 
      items: items.map(i => ({ field1: i.field1, field2: i.field2 })), 
      style 
    });
  };

  return (
    <ComponentFormWrapper
      type="ComponentName"
      title={title}
      setTitle={setTitle}
      active={active}
      setActive={setActive}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    >
      {/* Config Card */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Cấu hình</CardTitle>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={() => setItems([...items, { id: Date.now(), field1: '', field2: '' }])}
          >
            <Plus size={14} /> Thêm
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item, idx) => (
            <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <Label>Mục {idx + 1}</Label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="text-red-500 h-8 w-8"
                  onClick={() => items.length > 1 && setItems(items.filter(i => i.id !== item.id))}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
              <Input 
                placeholder="Field 1" 
                value={item.field1} 
                onChange={(e) => setItems(items.map(i => i.id === item.id ? {...i, field1: e.target.value} : i))} 
              />
              <Input 
                placeholder="Field 2" 
                value={item.field2} 
                onChange={(e) => setItems(items.map(i => i.id === item.id ? {...i, field2: e.target.value} : i))} 
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Preview */}
      <ComponentPreview 
        items={items} 
        brandColor={brandColor} 
        selectedStyle={style} 
        onStyleChange={setStyle} 
      />
    </ComponentFormWrapper>
  );
}
```

### Step 3: Tạo Preview Component

File: `previews.tsx` (thêm vào cuối file)

```tsx
// ============ COMPONENT NAME PREVIEW ============
type ItemType = { id: number; field1: string; field2: string };
export type ComponentStyle = 'style1' | 'style2' | 'style3';

export const ComponentPreview = ({ 
  items, 
  brandColor, 
  selectedStyle, 
  onStyleChange 
}: { 
  items: ItemType[]; 
  brandColor: string; 
  selectedStyle?: ComponentStyle; 
  onStyleChange?: (style: ComponentStyle) => void;
}) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const previewStyle = selectedStyle || 'style1';
  const setPreviewStyle = (s: string) => onStyleChange?.(s as ComponentStyle);
  const styles = [
    { id: 'style1', label: 'Style 1' },
    { id: 'style2', label: 'Style 2' },
    { id: 'style3', label: 'Style 3' },
  ];

  // Style 1 renderer
  const renderStyle1 = () => (
    <section className={cn("py-12 px-4", device === 'mobile' ? 'py-8' : '')}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Component Title</h2>
        <div className={cn(
          "grid gap-6",
          device === 'mobile' ? 'grid-cols-1' : device === 'tablet' ? 'grid-cols-2' : 'grid-cols-3'
        )}>
          {items.map((item) => (
            <div key={item.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border">
              <h3 className="font-medium">{item.field1 || 'Title'}</h3>
              <p className="text-sm text-slate-500">{item.field2 || 'Description'}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  // Style 2 renderer - Luôn có ít nhất 3 styles
  const renderStyle2 = () => (/* ... */);
  
  // Style 3 renderer
  const renderStyle3 = () => (/* ... */);

  return (
    <PreviewWrapper 
      title="Preview Component" 
      device={device} 
      setDevice={setDevice} 
      previewStyle={previewStyle} 
      setPreviewStyle={setPreviewStyle} 
      styles={styles}
      info={`${items.length} items`}
    >
      <BrowserFrame>
        {previewStyle === 'style1' && renderStyle1()}
        {previewStyle === 'style2' && renderStyle2()}
        {previewStyle === 'style3' && renderStyle3()}
      </BrowserFrame>
    </PreviewWrapper>
  );
};
```

### Step 4: Cập nhật ComponentRenderer

File: `components/site/ComponentRenderer.tsx`

```tsx
// Thêm vào switch statement
case 'ComponentName':
  return <ComponentSection config={config} brandColor={brandColor} title={title} />;
```

Tạo Section component:
```tsx
function ComponentSection({ config, brandColor, title }: { 
  config: Record<string, unknown>; 
  brandColor: string; 
  title: string;
}) {
  const items = (config.items as Array<{ field1: string; field2: string }>) || [];
  const style = (config.style as ComponentStyle) || 'style1';

  if (style === 'style1') {
    return (/* JSX cho style 1 */);
  }
  // ... other styles
}
```

### Step 5: Cập nhật Edit Page

File: `[id]/edit/page.tsx`

1. **Import Preview và Style type:**
```tsx
import { ComponentPreview, ComponentStyle } from '../../previews';
```

2. **Thêm states:**
```tsx
// Trong component
const [componentItems, setComponentItems] = useState<ItemType[]>([]);
const [componentStyle, setComponentStyle] = useState<ComponentStyle>('style1');
```

3. **Thêm case trong useEffect để load data:**
```tsx
case 'ComponentName':
  setComponentItems(config.items?.map((item: {...}, i: number) => ({ id: i, ...item })) || []);
  setComponentStyle((config.style as ComponentStyle) || 'style1');
  break;
```

4. **Thêm case trong buildConfig:**
```tsx
case 'ComponentName':
  return { 
    items: componentItems.map(i => ({ field1: i.field1, field2: i.field2 })), 
    style: componentStyle 
  };
```

5. **Thêm JSX cho form và preview trong render:**
```tsx
{component.type === 'ComponentName' && (
  <>
    <Card className="mb-6">
      {/* Config form */}
    </Card>
    <ComponentPreview 
      items={componentItems} 
      brandColor={brandColor} 
      selectedStyle={componentStyle} 
      onStyleChange={setComponentStyle} 
    />
  </>
)}
```

## Design Guidelines cho Styles

### 3-5 Style Variations

1. **Style 1 - Grid/Cards**: Layout phổ biến nhất, dạng grid responsive
2. **Style 2 - List/Horizontal**: Dạng danh sách hoặc layout ngang
3. **Style 3 - Minimal/Clean**: Tối giản, ít trang trí
4. **Style 4 - Bento/Modern**: Layout bất đối xứng, hiện đại (optional)
5. **Style 5 - Featured/Highlight**: Có item nổi bật (optional)

### Responsive Breakpoints

```tsx
// Device widths trong previews
const deviceWidths = {
  desktop: 'w-full max-w-7xl',
  tablet: 'w-[768px] max-w-full',
  mobile: 'w-[375px] max-w-full'
};

// Grid responsive pattern
<div className={cn(
  "grid gap-6",
  device === 'mobile' ? 'grid-cols-1' : 
  device === 'tablet' ? 'grid-cols-2' : 
  'grid-cols-3 lg:grid-cols-4'
)}>
```

### Brand Color Integration

```tsx
// Primary background
<div style={{ backgroundColor: brandColor }}>

// Light tint background
<div style={{ backgroundColor: `${brandColor}10` }}>

// Border with brand color
<div style={{ borderColor: brandColor }}>

// Text with brand color
<span style={{ color: brandColor }}>
```

## Common Patterns

### Image Upload với WebP Compression
```tsx
import { ImageFieldWithUpload } from '../../../components/ImageFieldWithUpload';

<ImageFieldWithUpload
  label="Hình ảnh"
  value={imageUrl}
  onChange={(url) => setImageUrl(url)}
  folder="component-name"
  aspectRatio="video" // 'square' | 'video' | 'banner'
  quality={0.85}
  placeholder="https://example.com/image.jpg"
/>
```

### Multiple Images với Reorder
```tsx
import { MultiImageUploader, ImageItem } from '../../../components/MultiImageUploader';

<MultiImageUploader<SlideType>
  items={slides}
  onChange={setSlides}
  folder="slides"
  imageKey="url"
  extraFields={[
    { key: 'link', placeholder: 'URL liên kết', type: 'url' }
  ]}
  minItems={1}
  maxItems={10}
  aspectRatio="banner"
  columns={1}
  showReorder={true}
  addButtonText="Thêm slide"
/>
```

### Drag & Drop Reorder
```tsx
// Sử dụng thư viện có sẵn trong MultiImageUploader
// Hoặc implement đơn giản với buttons
<Button onClick={() => moveItem(idx, idx - 1)}><ChevronUp /></Button>
<Button onClick={() => moveItem(idx, idx + 1)}><ChevronDown /></Button>
```

## Testing Checklist

- [ ] Create page render đúng form
- [ ] Có ít nhất 3 styles preview
- [ ] Preview responsive (desktop/tablet/mobile)
- [ ] Style selector lưu được vào config
- [ ] Edit page load được data từ DB
- [ ] Edit page cập nhật được tất cả fields
- [ ] ComponentRenderer render đúng trên site chính
- [ ] Tất cả styles render đúng trên site chính
- [ ] Brand color được áp dụng chính xác
- [ ] Image upload hoạt động (nếu có)
- [ ] Form validation hoạt động

## Files cần tạo/cập nhật

1. `create/[component-name]/page.tsx` - **TẠO MỚI**
2. `previews.tsx` - **THÊM Preview component**
3. `shared.tsx` - **THÊM vào COMPONENT_TYPES**
4. `[id]/edit/page.tsx` - **CẬP NHẬT imports, states, cases**
5. `components/site/ComponentRenderer.tsx` - **THÊM case và Section**

## Lưu ý quan trọng

1. **Không tạo file mới cho Preview** - Tất cả previews nằm trong `previews.tsx`
2. **Export type cho Style** - Để dùng được ở cả create và edit page
3. **Device responsive** - Luôn test cả 3 kích thước
4. **Brand color** - Sử dụng `useBrandColor()` hook, không hardcode
5. **Commit thường xuyên** - Sau mỗi bước hoàn thành
