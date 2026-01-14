---
name: create-home-component
description: Tạo Home Component mới cho hệ thống VietAdmin với trang /create, /edit và preview responsive. Sử dụng khi user muốn thêm loại component mới cho homepage như Banner, Pricing, Newsletter, Map, v.v. Skill này hướng dẫn tạo đầy đủ form config, 6 styles preview và tích hợp vào ComponentRenderer.
---

# Create Home Component

## Tổng quan

Skill này hướng dẫn tạo Home Component mới, bao gồm:
- Trang `/admin/home-components/create/[component-name]/page.tsx`
- Preview component trong `previews.tsx`
- Tích hợp vào `ComponentRenderer.tsx`
- Cập nhật trang edit `[id]/edit/page.tsx`

## Cấu trúc Files

```
app/admin/home-components/
├── previews.tsx                       # TẤT CẢ preview components
├── create/
│   ├── shared.tsx                     # Shared utilities, hooks
│   └── [component-name]/page.tsx      # Create page
└── [id]/edit/page.tsx                 # Edit page

components/site/
└── ComponentRenderer.tsx              # Render trên site
```

## Conventions

| Type | Format | Ví dụ |
|------|--------|-------|
| Component Type | PascalCase | `Newsletter`, `MapLocation` |
| Route | kebab-case | `/create/newsletter` |
| Style Types | camelCase | `fullWidth`, `minimal` |

---

## 6 Styles Requirement (BẮT BUỘC)

**Mỗi component PHẢI có đúng 6 styles khác nhau**. Các styles phải:
- Responsive trên cả 3 devices (desktop/tablet/mobile)
- Đa dạng về layout và visual approach
- Sử dụng Monochromatic color system (1 brandColor + tints/shades)

### Gợi ý 6 styles pattern cho các loại component:

| Component Type | 6 Styles gợi ý |
|----------------|----------------|
| Cards/Grid | grid, list, masonry, carousel, compact, showcase |
| Text Content | accordion, cards, two-column, minimal, timeline, tabbed |
| Media/Gallery | spotlight, explore, stories, grid, marquee, masonry |
| Pricing/Plans | cards, horizontal, minimal, comparison, featured, compact |
| Testimonials | cards, slider, masonry, quote, carousel, minimal |
| CTA/Banner | fullWidth, split, floating, minimal, gradient, parallax |

### Thiết kế 6 styles - Best Practices:

1. **Đa dạng layout**: Grid vs List vs Carousel vs Masonry
2. **Đa dạng density**: Compact vs Spacious vs Featured
3. **Đa dạng interaction**: Static vs Animated vs Interactive
4. **Mobile-first**: Tất cả styles PHẢI hoạt động tốt trên mobile
5. **Consistent brandColor**: Tất cả styles dùng cùng opacity scale

---

## 5 Steps tạo Component

### Step 1: Thêm vào COMPONENT_TYPES (shared.tsx)

```tsx
{ value: 'ComponentName', label: 'Tên hiển thị', icon: Icon, description: 'Mô tả', route: 'component-name' }
```

### Step 2: Tạo Create Page

```tsx
'use client';
import { useState } from 'react';
import { ComponentFormWrapper, useComponentForm, useBrandColor } from '../shared';
import { ComponentPreview, type ComponentStyle } from '../../previews';

export default function ComponentCreatePage() {
  const { title, setTitle, active, setActive, handleSubmit, isSubmitting } = useComponentForm('Default Title', 'ComponentName');
  const brandColor = useBrandColor();
  const [items, setItems] = useState([{ id: 1, field1: '', field2: '' }]);
  const [style, setStyle] = useState<ComponentStyle>('style1');

  return (
    <ComponentFormWrapper {...{ type: 'ComponentName', title, setTitle, active, setActive, isSubmitting }}
      onSubmit={(e) => handleSubmit(e, { items, style })}
    >
      {/* Config Card với items */}
      <ComponentPreview items={items} brandColor={brandColor} selectedStyle={style} onStyleChange={setStyle} />
    </ComponentFormWrapper>
  );
}
```

### Step 3: Tạo Preview (previews.tsx)

```tsx
// BẮT BUỘC: 6 styles
export type ComponentStyle = 'style1' | 'style2' | 'style3' | 'style4' | 'style5' | 'style6';

export const ComponentPreview = ({ items, brandColor, selectedStyle, onStyleChange }: Props) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  
  // BẮT BUỘC: 6 styles với labels mô tả rõ ràng
  const styles = [
    { id: 'style1', label: 'Grid' }, 
    { id: 'style2', label: 'List' }, 
    { id: 'style3', label: 'Cards' },
    { id: 'style4', label: 'Carousel' },
    { id: 'style5', label: 'Minimal' },
    { id: 'style6', label: 'Showcase' }
  ];

  return (
    <PreviewWrapper title="Preview" device={device} setDevice={setDevice} 
      previewStyle={selectedStyle || 'style1'} setPreviewStyle={(s) => onStyleChange?.(s as ComponentStyle)} styles={styles}>
      <BrowserFrame>
        {/* Render theo style - tất cả 6 styles */}
      </BrowserFrame>
    </PreviewWrapper>
  );
};
```

### Step 4: Thêm vào ComponentRenderer.tsx

```tsx
case 'ComponentName':
  return <ComponentSection config={config} brandColor={brandColor} title={title} />;
```

### Step 5: Cập nhật Edit Page

1. Import: `import { ComponentPreview, ComponentStyle } from '../../previews';`
2. States: `const [items, setItems] = useState([]); const [style, setStyle] = useState('style1');`
3. useEffect case: Load data từ config
4. buildConfig case: Return config object
5. JSX: Form + Preview component

---

## Monochromatic Brand Color System

**CRITICAL**: Triết lý Monochromatic - 1 main color + tints/shades

### Opacity Scale (Tints/Shades)

| Opacity | Hex | Dùng cho | Ví dụ |
|---------|-----|----------|-------|
| 5% | `05` | Hover background nhẹ | `${brandColor}05` |
| 8-10% | `08`/`10` | Card background subtle, shadow nhẹ | `${brandColor}10` |
| 15% | `15` | Border default | `${brandColor}15` |
| 20% | `20` | Shadow medium | `${brandColor}20` |
| 30-40% | `30`/`40` | Border hover, shadow đậm | `${brandColor}40` |
| 50-60% | `50`/`60` | Text secondary muted | `${brandColor}60` |
| 80% | `80`/`cc` | Text secondary, accent labels | `${brandColor}cc` |
| 100% | (none) | Primary: price, icons, buttons, CTA | `${brandColor}` |

### Standard Pattern - Cards với Hover

```tsx
// Card với brandColor monochromatic hover
<div 
  className="border rounded-lg p-3 transition-all"
  style={{ borderColor: `${brandColor}15` }}
  onMouseEnter={(e) => { 
    e.currentTarget.style.borderColor = `${brandColor}40`; 
    e.currentTarget.style.boxShadow = `0 4px 12px ${brandColor}10`; 
  }}
  onMouseLeave={(e) => { 
    e.currentTarget.style.borderColor = `${brandColor}15`; 
    e.currentTarget.style.boxShadow = 'none'; 
  }}
>
  <span style={{ color: brandColor }}>Price</span>
  <ArrowUpRight style={{ color: brandColor }} />
</div>

// Featured item với shadow đậm
<article style={{ boxShadow: `0 8px 30px ${brandColor}20` }}>
  <span style={{ color: `${brandColor}cc` }}>Nổi bật</span>
  <button style={{ backgroundColor: brandColor, boxShadow: `0 4px 12px ${brandColor}40` }}>
    Xem chi tiết
  </button>
</article>

// Accent line / progress bar
<div className="w-8 h-1 rounded-full" style={{ backgroundColor: brandColor }} />

// Badge / Tag
<span className="px-2 py-1 text-xs font-bold rounded" 
  style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
  NEW
</span>
```

---

## Typography & Text Overflow Prevention

**CRITICAL**: Tránh chữ rớt dòng không chủ đích, chen chúc UI

### Anti-Overflow Techniques

```tsx
// 1. Truncate single line
<h3 className="truncate">{title}</h3>

// 2. Line clamp cho multi-line
<p className="line-clamp-2">{description}</p>
<p className="line-clamp-3">{longText}</p>

// 3. Min-width cho button text
<button className="whitespace-nowrap min-w-max">Xem chi tiết</button>

// 4. Flex với min-w-0 để truncate flex children
<div className="flex items-center gap-2 min-w-0">
  <span className="truncate flex-1">{text}</span>
  <Icon className="flex-shrink-0" />
</div>

// 5. Grid với fixed columns
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  {/* Items với width cố định */}
</div>
```

### Responsive Typography Scale

```tsx
// Heading responsive
<h2 className={cn(
  "font-bold tracking-tight",
  device === 'mobile' ? 'text-xl' : 'text-2xl md:text-3xl'
)}>

// Body text responsive  
<p className={cn(
  "text-slate-600",
  device === 'mobile' ? 'text-sm' : 'text-base'
)}>

// Price/numbers
<span className={cn(
  "font-bold tabular-nums",
  device === 'mobile' ? 'text-lg' : 'text-xl'
)}>
```

---

## Edge Cases & UI/UX Techniques

### Quá nhiều items - "+N" Pattern

```tsx
const MAX_VISIBLE = device === 'mobile' ? 4 : 6;
const visibleItems = items.slice(0, MAX_VISIBLE);
const remainingCount = items.length - MAX_VISIBLE;

<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
  {visibleItems.map(item => (
    <ItemCard key={item.id} {...item} />
  ))}
  
  {/* Item cuối có dấu + nếu còn nhiều */}
  {remainingCount > 0 && (
    <div className="flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-xl aspect-square">
      <div className="text-center">
        <Plus size={32} className="mx-auto mb-2 text-slate-400" />
        <span className="text-lg font-bold text-slate-600">+{remainingCount}</span>
        <p className="text-xs text-slate-400">mục khác</p>
      </div>
    </div>
  )}
</div>
```

### Ít items - Centered Layout

```tsx
// 1 item: centered max-w-md
{items.length === 1 && (
  <div className="max-w-md mx-auto">
    <ItemCard {...items[0]} />
  </div>
)}

// 2 items: centered max-w-2xl
{items.length === 2 && (
  <div className="max-w-2xl mx-auto grid grid-cols-2 gap-4">
    {items.map(item => <ItemCard key={item.id} {...item} />)}
  </div>
)}

// 3+ items: normal grid
{items.length >= 3 && (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
    {items.map(item => <ItemCard key={item.id} {...item} />)}
  </div>
)}
```

### Empty State

```tsx
{items.length === 0 && (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" 
      style={{ backgroundColor: `${brandColor}10` }}>
      <Package size={32} style={{ color: brandColor }} />
    </div>
    <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">
      Chưa có mục nào
    </h3>
    <p className="text-sm text-slate-500">
      Thêm mục đầu tiên để bắt đầu
    </p>
  </div>
)}
```

### Missing Data Fallbacks

```tsx
// Text fallback
<h3>{item.title || 'Tiêu đề mặc định'}</h3>
<p>{item.description || 'Mô tả sẽ hiển thị ở đây'}</p>

// Image placeholder
{item.image ? (
  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
) : (
  <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
    <ImageIcon size={32} className="text-slate-300" />
  </div>
)}

// Price fallback
<span style={{ color: brandColor }}>{item.price || 'Liên hệ'}</span>
```

---

## Image Guidelines (Component có ảnh)

### Image Upload Form UX

Component có ảnh PHẢI dùng `MultiImageUploader` hoặc form tương đương với các tính năng:

```tsx
import { MultiImageUploader } from '../../../components/MultiImageUploader';

<MultiImageUploader<ItemType>
  items={items}
  onChange={handleItemsChange}
  folder="component-name"           // Folder lưu trữ
  imageKey="url"                     // Key chứa URL ảnh
  extraFields={[                     // Fields bổ sung
    { key: 'link', placeholder: 'URL liên kết', type: 'url' },
    { key: 'title', placeholder: 'Tiêu đề', type: 'text' }
  ]}
  minItems={1}
  maxItems={10}
  aspectRatio="banner"              // Gợi ý tỉ lệ
  columns={1}                        // Layout form
  showReorder={true}                 // Cho phép kéo thả sắp xếp
  addButtonText="Thêm ảnh"
  emptyText="Chưa có ảnh nào"
/>
```

### Image Processing Requirements

Tất cả ảnh upload PHẢI được xử lý:
- **Format**: WebP với quality 85%
- **Sharp processing**: Resize + optimize
- **Cleanup Observer**: Tự động xóa ảnh không dùng

```tsx
// Convex mutation example
const processedUrl = await sharp(imageBuffer)
  .webp({ quality: 85 })
  .resize(maxWidth, maxHeight, { fit: 'inside' })
  .toBuffer();
```

### Tỉ lệ ảnh theo Style (Tham khảo Hero Banner)

**Mỗi style có ảnh PHẢI có hướng dẫn tỉ lệ cụ thể** dưới preview:

```tsx
{/* Hướng dẫn kích thước ảnh tối ưu - BẮT BUỘC cho component có ảnh */}
<div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
  <div className="flex items-start gap-2">
    <ImageIcon size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
    <div className="text-xs text-slate-600 dark:text-slate-400">
      {selectedStyle === 'style1' && (
        <p><strong>1920×600px</strong> (16:5) • Banner ngang, nhiều ảnh auto slide</p>
      )}
      {selectedStyle === 'style2' && (
        <p><strong>1920×1080px</strong> (16:9) • Fullscreen, subject đặt bên phải</p>
      )}
      {selectedStyle === 'style3' && (
        <p><strong>Slot 1:</strong> 800×500 • <strong>Slot 2:</strong> 800×250 • Grid bento</p>
      )}
      {selectedStyle === 'style4' && (
        <p><strong>800×800px</strong> (1:1) • Cards vuông, carousel horizontal</p>
      )}
      {selectedStyle === 'style5' && (
        <p><strong>600×400px</strong> (3:2) • Compact cards, nhiều items</p>
      )}
      {selectedStyle === 'style6' && (
        <p><strong>1200×800px</strong> (3:2) • Showcase lớn, featured item</p>
      )}
    </div>
  </div>
</div>
```

### Common Image Ratios

| Ratio | Size | Dùng cho |
|-------|------|----------|
| 16:5 | 1920×600 | Banner slider, wide hero |
| 16:9 | 1920×1080 | Fullscreen, video cover |
| 3:2 | 1200×800 | Product showcase, cards |
| 4:3 | 800×600 | Thumbnails, gallery |
| 1:1 | 800×800 | Square cards, avatar, logo |
| 2:3 | 600×900 | Portrait cards, stories |

---

## Drag & Drop (nếu có items)

### Recommended: useDragReorder Hook

```tsx
const [draggedId, setDraggedId] = useState<number | null>(null);
const [dragOverId, setDragOverId] = useState<number | null>(null);

const dragProps = (id: number) => ({
  draggable: true,
  onDragStart: () => setDraggedId(id),
  onDragEnd: () => { setDraggedId(null); setDragOverId(null); },
  onDragOver: (e: React.DragEvent) => { e.preventDefault(); if (draggedId !== id) setDragOverId(id); },
  onDrop: (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedId || draggedId === id) return;
    const newItems = [...items];
    const [moved] = newItems.splice(items.findIndex(i => i.id === draggedId), 1);
    newItems.splice(items.findIndex(i => i.id === id), 0, moved);
    setItems(newItems);
    setDraggedId(null); setDragOverId(null);
  }
});

// Usage
<div {...dragProps(item.id)} className={cn(
  "cursor-grab",
  draggedId === item.id && "opacity-50",
  dragOverId === item.id && "ring-2 ring-blue-500"
)}>
  <GripVertical className="flex-shrink-0" /> {/* content */}
</div>
```

---

## Existing Components Status

### Đã đủ 6 styles ✅
- Hero Banner: slider, fade, bento, fullscreen, split, parallax
- Stats: horizontal, cards, icons, gradient, minimal, counter
- ProductList/ServiceList: commerce, minimal, bento, carousel, compact, showcase

### Cần bổ sung thêm styles ❌
- FAQ: 3 styles → cần thêm 3 (minimal, timeline, tabbed)
- Testimonials: 3 styles → cần thêm 3 (quote, carousel, minimal)
- Pricing: 3 styles → cần thêm 3 (comparison, featured, compact)
- Gallery: 3 styles → cần thêm 3 (grid, marquee, masonry)
- Partners: 4 styles → cần thêm 2 (carousel, featured)
- Services/Benefits: 3 styles → cần thêm 3 (cards, carousel, timeline)

---

## Testing Checklist

### Functionality
- [ ] Create page render đúng
- [ ] **6 styles preview**, responsive (desktop/tablet/mobile)
- [ ] Edit page load/save đúng
- [ ] ComponentRenderer render đúng **tất cả 6 styles**
- [ ] Drag & drop hoạt động (nếu có)

### Brand Color Sync (CRITICAL)
- [ ] **Preview = Frontend** về visual output
- [ ] Monochromatic: chỉ dùng 1 brandColor + opacity
- [ ] Border: `15` default, `40` hover
- [ ] Shadow: `10` default, `20` hover
- [ ] Price/icons/CTA dùng brandColor 100%
- [ ] Test với nhiều màu khác nhau

### Typography & Overflow
- [ ] Không có text rớt dòng không chủ đích
- [ ] Long text được truncate/line-clamp
- [ ] Button text có whitespace-nowrap
- [ ] Mobile không bị overflow horizontal

### Edge Cases
- [ ] Empty state hiển thị đẹp
- [ ] Missing image có placeholder
- [ ] Missing text có fallback
- [ ] 1-2 items: centered layout
- [ ] Quá nhiều items: "+N mục khác"

### Image (nếu có)
- [ ] Form upload hỗ trợ: paste link, upload file, drag & drop
- [ ] Mỗi style có hướng dẫn tỉ lệ ảnh cụ thể
- [ ] Image được process: WebP 85%, sharp resize
- [ ] Cleanup observer xóa ảnh không dùng

---

## Lưu ý quan trọng

1. **Tất cả previews trong `previews.tsx`** - không tạo file riêng
2. **Export Style type** - dùng ở cả create và edit
3. **useBrandColor()** - không hardcode màu
4. **BẮT BUỘC 6 styles** - không ít hơn
5. **Monochromatic only** - 1 brandColor + tints/shades
6. **Responsive first** - test cả 3 devices
7. **Commit sau mỗi step**
