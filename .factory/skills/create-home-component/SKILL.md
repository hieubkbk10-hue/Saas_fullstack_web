---
name: create-home-component
description: Tạo Home Component mới cho hệ thống VietAdmin với trang /create, /edit và preview responsive. Sử dụng khi user muốn thêm loại component mới cho homepage như Banner, Pricing, Newsletter, Map, v.v. Skill này hướng dẫn tạo đầy đủ form config, 3-5 styles preview và tích hợp vào ComponentRenderer.
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
export type ComponentStyle = 'style1' | 'style2' | 'style3';

export const ComponentPreview = ({ items, brandColor, selectedStyle, onStyleChange }: Props) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const styles = [{ id: 'style1', label: 'Style 1' }, { id: 'style2', label: 'Style 2' }, { id: 'style3', label: 'Style 3' }];

  return (
    <PreviewWrapper title="Preview" device={device} setDevice={setDevice} 
      previewStyle={selectedStyle || 'style1'} setPreviewStyle={(s) => onStyleChange?.(s as ComponentStyle)} styles={styles}>
      <BrowserFrame>
        {/* Render theo style */}
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

## Brand Color System

**CRITICAL**: Preview và Frontend PHẢI sync 100%!

### Opacity Scale

| Opacity | Hex | Dùng cho |
|---------|-----|----------|
| 5% | `05` | Hover background |
| 10-15% | `10`/`15` | Border default, shadow nhẹ |
| 20-40% | `20`/`40` | Border hover, shadow đậm |
| 80% | `80`/`cc` | Text secondary, accent labels |
| 100% | (none) | Primary: price, icons, buttons |

### Standard Pattern

```tsx
// Card với brandColor hover
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

// Featured item
<article style={{ boxShadow: `0 8px 30px ${brandColor}20` }}>
  <span style={{ color: `${brandColor}cc` }}>Nổi bật</span>
  <button style={{ backgroundColor: brandColor, boxShadow: `0 4px 12px ${brandColor}40` }}>
    Xem chi tiết
  </button>
</article>
```

---

## Drag & Drop (nếu có items)

### Recommended: useDragReorder Hook

```tsx
// Tạo hook hoặc copy pattern này
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
  <GripVertical /> {/* content */}
</div>
```

---

## Edge Cases

| Case | Solution |
|------|----------|
| Empty items | Hiện empty state với icon + text hướng dẫn |
| Missing image | Placeholder với icon + kích thước gợi ý |
| Missing text | Fallback: `item.title \|\| 'Tiêu đề'` |
| 1-2 items | Điều chỉnh grid: `max-w-md mx-auto` cho 1, `max-w-2xl` cho 2 |
| Too many items | `items.slice(0, 6)` + "+ N mục khác" |
| Long text | `line-clamp-2` hoặc `truncate` |

---

## Image Guidelines

| Ratio | Size | Dùng cho |
|-------|------|----------|
| 16:5 | 1920×600 | Banner, slider |
| 16:9 | 1920×1080 | Fullscreen, hero |
| 4:3 | 800×600 | Cards, thumbnails |
| 1:1 | 400×400 | Avatar, logo |

Hiển thị gợi ý dưới preview:
```tsx
<p className="text-xs text-slate-500"><strong>1920×600px</strong> (16:5) • Mô tả</p>
```

---

## Testing Checklist

### Functionality
- [ ] Create page render đúng
- [ ] ≥3 styles preview, responsive (desktop/tablet/mobile)
- [ ] Edit page load/save đúng
- [ ] ComponentRenderer render đúng tất cả styles
- [ ] Drag & drop hoạt động (nếu có)

### Brand Color Sync (CRITICAL)
- [ ] **Preview = Frontend** về visual output
- [ ] Border: `15` default, `40` hover
- [ ] Shadow: `10` default, `20` hover
- [ ] Price/icons dùng brandColor 100%
- [ ] Test với nhiều màu khác nhau

### Edge Cases
- [ ] Empty state, missing image/text
- [ ] 1-2 items, max items
- [ ] Long text truncation
- [ ] Mobile không overflow

---

## Lưu ý

1. **Tất cả previews trong `previews.tsx`** - không tạo file riêng
2. **Export Style type** - dùng ở cả create và edit
3. **useBrandColor()** - không hardcode màu
4. **Commit sau mỗi step**
