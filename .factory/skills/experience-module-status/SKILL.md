---
name: experience-module-status
description: Thêm UI hiển thị trạng thái feature/setting từ Module vào Experience Editor theo pattern 1-way dependency (Experience phụ thuộc Module). Dùng khi cần hiển thị trạng thái bật/tắt của feature từ module trong experience editor, kèm link hướng dẫn người dùng vào module để thay đổi.
---

# Experience Module Status

Skill này chuẩn hoá pattern **1-way dependency** giữa Module và Experience Editor.

## Khi nào dùng

- Khi Experience Editor cần hiển thị trạng thái bật/tắt của feature/setting từ Module
- Khi muốn hướng dẫn người dùng chỉnh ở Module thay vì sync ngược từ Experience
- Trigger thường gặp: “status module trong experience”, “hiển thị trạng thái feature”, “1-way dependency”

## Quy trình

1. **Xác định module + feature/setting**
   - Feature: `api.admin.modules.getModuleFeature`
   - Setting: `api.admin.modules.getModuleSetting`

2. **Query trạng thái**
   ```tsx
   const feature = useQuery(api.admin.modules.getModuleFeature, {
     moduleKey: 'posts',
     featureKey: 'enableTags',
   });
   const enabled = feature?.enabled ?? false;
   ```

3. **Component hiển thị status**
   ```tsx
   function ModuleFeatureStatus({ label, enabled, href }: { label: string; enabled: boolean; href: string }) {
     return (
       <div className="mt-2 flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
         <div className="flex items-start gap-2">
           <span className={`mt-1 inline-flex h-2 w-2 rounded-full ${enabled ? 'bg-emerald-500' : 'bg-slate-400'}`} />
           <div>
             <p className="text-sm font-medium text-slate-700">{label}</p>
             <p className="text-xs text-slate-500">
               {enabled ? 'Đang bật' : 'Chưa bật'} · Nếu muốn {enabled ? 'tắt' : 'bật'} hãy vào Module
             </p>
           </div>
         </div>
         <Link href={href} className="text-xs font-medium text-cyan-600 hover:underline">
           Đi đến →
         </Link>
       </div>
     );
   }
   ```

4. **Gắn vào ControlCard phù hợp**
   - Ví dụ: `ControlCard title="Thông tin bài viết"`
   - Đặt dưới các ToggleRow liên quan

5. **Preview (nếu có)**
   - Khi module tắt feature, ẩn block preview tương ứng

## Best practices

- Module là **nguồn sự thật**, Experience chỉ đọc trạng thái
- Không toggle module từ experience nếu mục tiêu là 1-way
- Luôn có link điều hướng đến `/system/modules/<module>`

## Ví dụ nhanh

```tsx
const tagsFeature = useQuery(api.admin.modules.getModuleFeature, {
  moduleKey: 'posts',
  featureKey: 'enableTags',
});

<ModuleFeatureStatus
  label="Tags"
  enabled={tagsFeature?.enabled ?? false}
  href="/system/modules/posts"
/>
```
