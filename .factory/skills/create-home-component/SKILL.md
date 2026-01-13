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

### Drag & Drop Reorder cho Items

Project đã có sẵn drag & drop trong `MultiImageUploader`. Với các items khác (FAQ, Team, Features...), implement như sau:

#### Option 1: Native HTML5 Drag & Drop (Recommended)

```tsx
interface ItemType {
  id: number;
  title: string;
  description: string;
}

// States cho drag & drop
const [draggedItemId, setDraggedItemId] = useState<number | null>(null);
const [dragOverItemId, setDragOverItemId] = useState<number | null>(null);

// Drag handlers
const handleDragStart = (e: React.DragEvent, itemId: number) => {
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', String(itemId));
  setDraggedItemId(itemId);
};

const handleDragEnd = () => {
  setDraggedItemId(null);
  setDragOverItemId(null);
};

const handleDragOver = (e: React.DragEvent, targetId: number) => {
  e.preventDefault();
  e.stopPropagation();
  if (draggedItemId && draggedItemId !== targetId) {
    setDragOverItemId(targetId);
  }
};

const handleDrop = (e: React.DragEvent, targetId: number) => {
  e.preventDefault();
  e.stopPropagation();
  
  if (!draggedItemId || draggedItemId === targetId) {
    setDraggedItemId(null);
    setDragOverItemId(null);
    return;
  }

  const dragIndex = items.findIndex(item => item.id === draggedItemId);
  const dropIndex = items.findIndex(item => item.id === targetId);

  if (dragIndex === -1 || dropIndex === -1) return;

  // Reorder items
  const newItems = [...items];
  const [draggedItem] = newItems.splice(dragIndex, 1);
  newItems.splice(dropIndex, 0, draggedItem);
  setItems(newItems);

  setDraggedItemId(null);
  setDragOverItemId(null);
};

// JSX
{items.map((item) => (
  <div
    key={item.id}
    draggable
    onDragStart={(e) => handleDragStart(e, item.id)}
    onDragEnd={handleDragEnd}
    onDragOver={(e) => handleDragOver(e, item.id)}
    onDrop={(e) => handleDrop(e, item.id)}
    className={cn(
      "border rounded-lg p-4 transition-all duration-200 cursor-grab active:cursor-grabbing",
      draggedItemId === item.id && "opacity-50 scale-95",
      dragOverItemId === item.id && "ring-2 ring-blue-500 ring-offset-2 scale-[1.02]"
    )}
  >
    {/* Drag handle icon */}
    <div className="flex items-center gap-3">
      <GripVertical size={18} className="text-slate-400 hover:text-slate-600 flex-shrink-0" />
      {/* Rest of item content */}
    </div>
  </div>
))}
```

#### Option 2: Simple Button Reorder (Fallback)

```tsx
// Move item helper
const moveItem = (fromIndex: number, toIndex: number) => {
  if (toIndex < 0 || toIndex >= items.length) return;
  const newItems = [...items];
  const [movedItem] = newItems.splice(fromIndex, 1);
  newItems.splice(toIndex, 0, movedItem);
  setItems(newItems);
};

// JSX with up/down buttons
{items.map((item, idx) => (
  <div key={item.id} className="flex items-center gap-2">
    <div className="flex flex-col gap-0.5">
      <button
        type="button"
        onClick={() => moveItem(idx, idx - 1)}
        disabled={idx === 0}
        className={cn(
          "p-1 rounded hover:bg-slate-100",
          idx === 0 && "opacity-30 cursor-not-allowed"
        )}
      >
        <ChevronUp size={14} />
      </button>
      <button
        type="button"
        onClick={() => moveItem(idx, idx + 1)}
        disabled={idx === items.length - 1}
        className={cn(
          "p-1 rounded hover:bg-slate-100",
          idx === items.length - 1 && "opacity-30 cursor-not-allowed"
        )}
      >
        <ChevronDown size={14} />
      </button>
    </div>
    {/* Item content */}
  </div>
))}
```

#### Option 3: Reusable Hook Pattern

```tsx
// hooks/useDragReorder.ts
import { useState, useCallback } from 'react';

export function useDragReorder<T extends { id: number | string }>(
  items: T[],
  setItems: (items: T[]) => void
) {
  const [draggedId, setDraggedId] = useState<number | string | null>(null);
  const [dragOverId, setDragOverId] = useState<number | string | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, id: number | string) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggedId(id);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
    setDragOverId(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, targetId: number | string) => {
    e.preventDefault();
    if (draggedId && draggedId !== targetId) {
      setDragOverId(targetId);
    }
  }, [draggedId]);

  const handleDrop = useCallback((e: React.DragEvent, targetId: number | string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const dragIndex = items.findIndex(item => item.id === draggedId);
    const dropIndex = items.findIndex(item => item.id === targetId);

    if (dragIndex !== -1 && dropIndex !== -1) {
      const newItems = [...items];
      const [draggedItem] = newItems.splice(dragIndex, 1);
      newItems.splice(dropIndex, 0, draggedItem);
      setItems(newItems);
    }

    setDraggedId(null);
    setDragOverId(null);
  }, [draggedId, items, setItems]);

  const getDragProps = useCallback((id: number | string) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => handleDragStart(e, id),
    onDragEnd: handleDragEnd,
    onDragOver: (e: React.DragEvent) => handleDragOver(e, id),
    onDrop: (e: React.DragEvent) => handleDrop(e, id),
  }), [handleDragStart, handleDragEnd, handleDragOver, handleDrop]);

  const getItemClasses = useCallback((id: number | string) => cn(
    draggedId === id && "opacity-50 scale-95",
    dragOverId === id && "ring-2 ring-blue-500 ring-offset-2 scale-[1.02]"
  ), [draggedId, dragOverId]);

  return { getDragProps, getItemClasses, isDragging: draggedId !== null };
}

// Usage trong component
const { getDragProps, getItemClasses, isDragging } = useDragReorder(items, setItems);

{items.map((item) => (
  <div
    key={item.id}
    {...getDragProps(item.id)}
    className={cn(
      "border rounded-lg p-4 cursor-grab active:cursor-grabbing",
      getItemClasses(item.id)
    )}
  >
    <GripVertical className="text-slate-400" />
    {/* content */}
  </div>
))}
```

#### Visual Feedback Classes

```tsx
// Drag & Drop visual states
const itemClasses = cn(
  // Base
  "border rounded-lg p-4 transition-all duration-200",
  
  // Draggable cursor
  "cursor-grab active:cursor-grabbing",
  
  // Being dragged
  draggedItemId === item.id && "opacity-50 scale-95 shadow-lg z-50",
  
  // Drop target highlight
  dragOverItemId === item.id && draggedItemId !== item.id && [
    "ring-2 ring-blue-500 ring-offset-2",
    "scale-[1.02]",
    "bg-blue-50 dark:bg-blue-900/20"
  ]
);
```

#### Drag Handle Component

```tsx
// Reusable drag handle
const DragHandle = ({ className }: { className?: string }) => (
  <div className={cn(
    "flex-shrink-0 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700",
    "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300",
    "cursor-grab active:cursor-grabbing",
    className
  )}>
    <GripVertical size={18} />
  </div>
);

// Usage
<div className="flex items-center gap-3">
  <DragHandle />
  <Input value={item.title} />
  <Button variant="ghost"><Trash2 /></Button>
</div>
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
- [ ] **Drag & drop reorder hoạt động** (nếu component có items)
- [ ] **Order được lưu đúng vào DB** sau khi reorder

## Files cần tạo/cập nhật

1. `create/[component-name]/page.tsx` - **TẠO MỚI**
2. `previews.tsx` - **THÊM Preview component**
3. `shared.tsx` - **THÊM vào COMPONENT_TYPES**
4. `[id]/edit/page.tsx` - **CẬP NHẬT imports, states, cases**
5. `components/site/ComponentRenderer.tsx` - **THÊM case và Section**

## Form UI/UX Optimization

### 1. Compact Form Layout

Thay vì form dọc chiếm nhiều không gian, sử dụng layout ngang gọn gàng:

```tsx
// ❌ BAD - Form dọc chiếm nhiều không gian
<div className="space-y-4">
  <Input placeholder="Tên" value={name} />
  <Input placeholder="Chức vụ" value={role} />
  <Input placeholder="Bio" value={bio} />
</div>

// ✅ GOOD - Compact row layout (như Team component)
<div className="flex items-center gap-3 p-3">
  <AvatarUpload value={avatar} onChange={setAvatar} />
  <div className="flex-1 min-w-0 space-y-1.5">
    <div className="flex gap-2">
      <Input placeholder="Họ và tên" className="h-8 text-sm" />
      <Input placeholder="Chức vụ" className="h-8 text-sm w-32" />
    </div>
    <div className="flex items-center gap-1">
      {/* Icon buttons cho optional fields */}
    </div>
  </div>
  <Button variant="ghost" size="icon"><Trash2 /></Button>
</div>
```

### 2. Collapsible Optional Fields

Ẩn các fields không bắt buộc, chỉ hiện khi cần:

```tsx
// Expandable section cho optional content
const [expandedId, setExpandedId] = useState<number | null>(null);

<button
  onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
  className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
>
  Mở rộng {expandedId === item.id ? <ChevronUp /> : <ChevronDown />}
</button>

{expandedId === item.id && (
  <div className="px-3 pb-3 bg-slate-50 border-t">
    <textarea placeholder="Nội dung tùy chọn..." />
  </div>
)}
```

### 3. Icon Buttons cho Social/Optional Links

Tiết kiệm không gian với icon buttons có popover input:

```tsx
const SocialIconBtn = ({ type, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-7 h-7 rounded-md flex items-center justify-center",
          value ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400"
        )}
      >
        <SocialIcon type={type} />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 z-10 bg-white border rounded-lg shadow-lg p-2 w-56">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`${type} URL...`}
            className="text-xs h-8"
            autoFocus
            onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          />
        </div>
      )}
    </div>
  );
};
```

### 4. Inline Image Upload

Compact avatar/thumbnail upload trong row:

```tsx
// Compact avatar upload (64x64)
<div className={cn(
  "w-16 h-16 rounded-xl overflow-hidden cursor-pointer border-2 border-dashed",
  isDragOver ? "border-blue-400 bg-blue-50" : "border-slate-200"
)}>
  {isUploading ? (
    <Loader2 className="animate-spin" />
  ) : value ? (
    <img src={value} className="w-full h-full object-cover" />
  ) : (
    <Upload size={16} className="text-slate-400" />
  )}
</div>
{value && (
  <button className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full">×</button>
)}
```

### 5. Header với Counter

Hiển thị số lượng items trong header:

```tsx
<CardHeader className="flex flex-row items-center justify-between py-3">
  <CardTitle className="text-sm font-medium">
    Thành viên ({items.length})
  </CardTitle>
  <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
    <Plus size={12} /> Thêm
  </Button>
</CardHeader>
```

### 6. Min/Max Items Constraint

Validate số lượng items:

```tsx
// Trong add button
<Button 
  disabled={items.length >= MAX_ITEMS}
  onClick={() => setItems([...items, newItem])}
>
  Thêm {items.length >= MAX_ITEMS && `(tối đa ${MAX_ITEMS})`}
</Button>

// Trong delete button
<Button 
  disabled={items.length <= MIN_ITEMS}
  onClick={() => setItems(items.filter(i => i.id !== item.id))}
>
  <Trash2 />
</Button>
```

## Preview UI/UX & Edge Cases

### 1. Empty State - Không có items

```tsx
// Luôn có empty state khi không có data
if (items.length === 0) {
  return (
    <section className="py-12 px-4">
      <div className="flex flex-col items-center justify-center h-48 text-slate-400">
        <ImageIcon size={48} className="opacity-20 mb-4" />
        <p className="text-sm">Chưa có dữ liệu nào.</p>
        <p className="text-xs text-slate-300">Thêm ít nhất 1 mục để xem preview.</p>
      </div>
    </section>
  );
}
```

### 2. Missing Image Placeholder

```tsx
// Placeholder khi chưa có ảnh
{item.image ? (
  <img src={item.image} alt="" className="w-full h-full object-cover" />
) : (
  <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center">
    <ImageIcon size={24} className="text-slate-300 mb-1" />
    <span className="text-xs text-slate-400">Chưa có ảnh</span>
  </div>
)}

// Với gradient background cho Hero/Banner
{!slide.image && (
  <div 
    className="w-full h-full flex flex-col items-center justify-center"
    style={{ backgroundColor: `${brandColor}15` }}
  >
    <ImageIcon size={32} style={{ color: brandColor }} />
    <span className="text-sm text-slate-400 mt-2">Banner #{idx + 1}</span>
    <span className="text-xs text-slate-300">Khuyến nghị: 1920x600px</span>
  </div>
)}
```

### 3. Missing Text Fields - Fallback Values

```tsx
// Luôn có fallback cho empty text
<h3 className="font-medium">{item.title || `Tiêu đề ${idx + 1}`}</h3>
<p className="text-sm text-slate-500">{item.description || 'Mô tả...'}</p>

// Initials cho avatar
<div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" 
     style={{ backgroundColor: brandColor }}>
  {(item.name || 'U').charAt(0).toUpperCase()}
</div>
```

### 4. Too Few Items - Grid Adaptation

```tsx
// Tự động điều chỉnh grid khi ít items
const getGridCols = (count: number, device: PreviewDevice) => {
  if (device === 'mobile') return 'grid-cols-1';
  if (device === 'tablet') return count < 2 ? 'grid-cols-1' : 'grid-cols-2';
  // Desktop: tối đa số cột dựa vào số items
  if (count === 1) return 'grid-cols-1 max-w-md mx-auto';
  if (count === 2) return 'grid-cols-2 max-w-2xl mx-auto';
  if (count === 3) return 'grid-cols-3';
  return 'grid-cols-4';
};

<div className={cn("grid gap-6", getGridCols(items.length, device))}>
```

### 5. Too Many Items - Truncation & Pagination

```tsx
// Giới hạn hiển thị trong preview
const displayItems = items.slice(0, device === 'mobile' ? 3 : device === 'tablet' ? 4 : 6);
const hasMore = items.length > displayItems.length;

<div className="grid gap-4">
  {displayItems.map((item) => (/* render item */))}
</div>

{hasMore && (
  <div className="text-center mt-4 text-sm text-slate-500">
    + {items.length - displayItems.length} mục khác
  </div>
)}
```

### 6. Long Text Truncation

```tsx
// Truncate cho text dài
<p className="text-sm text-slate-500 line-clamp-2">
  {item.description}
</p>

<h3 className="font-medium truncate" title={item.title}>
  {item.title}
</h3>

// Hoặc với custom truncate
const truncate = (text: string, max: number) => 
  text.length > max ? `${text.slice(0, max)}...` : text;
```

### 7. Rating/Stars với Default

```tsx
// Stars với default rating
const renderStars = (rating: number = 5) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(star => (
      <Star 
        key={star} 
        size={12} 
        className={star <= rating ? "text-yellow-400 fill-yellow-400" : "text-slate-300"} 
      />
    ))}
  </div>
);
```

### 8. Skeleton Loading States

```tsx
// Skeleton cho preview đang load
const SkeletonCard = () => (
  <div className="bg-white rounded-xl p-4 border animate-pulse">
    <div className="w-12 h-12 rounded-full bg-slate-200 mb-3" />
    <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
    <div className="h-3 bg-slate-100 rounded w-1/2" />
  </div>
);

// Sử dụng khi data đang load
{isLoading ? (
  <div className="grid grid-cols-3 gap-4">
    {[1,2,3].map(i => <SkeletonCard key={i} />)}
  </div>
) : (
  /* actual content */
)}
```

### 9. Preview Info Bar

```tsx
// Thông tin preview ở footer
<div className="mt-3 text-xs text-slate-500">
  Style: <strong>{styles.find(s => s.id === previewStyle)?.label}</strong>
  {' • '}
  {device === 'desktop' && 'Desktop (1280px)'}
  {device === 'tablet' && 'Tablet (768px)'}
  {device === 'mobile' && 'Mobile (375px)'}
  {' • '}
  {items.filter(i => i.title || i.name).length}/{items.length} mục có dữ liệu
</div>
```

### 10. Visual Indicators cho Incomplete Items

```tsx
// Badge cảnh báo cho items thiếu data
<div className="relative">
  {(!item.image || !item.title) && (
    <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
      <AlertCircle size={10} className="text-white" />
    </div>
  )}
  {/* card content */}
</div>

// Hoặc border highlight
<div className={cn(
  "border rounded-lg p-4",
  (!item.title && !item.image) ? "border-amber-300 bg-amber-50/50" : "border-slate-200"
)}>
```

## Testing Checklist - Edge Cases

- [ ] Empty state hiển thị đẹp
- [ ] Missing image có placeholder phù hợp
- [ ] Missing text có fallback value
- [ ] 1 item - layout vẫn đẹp
- [ ] 2 items - layout balanced
- [ ] Max items - truncation hoạt động
- [ ] Long text - truncate/line-clamp
- [ ] Mobile view - không bị overflow
- [ ] Form compact - không chiếm quá nhiều space
- [ ] Optional fields - collapsible hoạt động

## Lưu ý quan trọng

1. **Không tạo file mới cho Preview** - Tất cả previews nằm trong `previews.tsx`
2. **Export type cho Style** - Để dùng được ở cả create và edit page
3. **Device responsive** - Luôn test cả 3 kích thước
4. **Brand color** - Sử dụng `useBrandColor()` hook, không hardcode
5. **Commit thường xuyên** - Sau mỗi bước hoàn thành
6. **Edge cases** - Luôn xử lý empty, missing, overflow states
7. **Compact forms** - Ưu tiên layout ngang, collapsible sections
