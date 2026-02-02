import { DollarSign, Clock, Star, Briefcase } from 'lucide-react';
import { defineModule } from '../define-module';
 
export const servicesModule = defineModule({
   key: 'services',
  name: 'Dịch vụ',
   description: 'Cấu hình dịch vụ và danh mục',
   icon: Briefcase,
  color: 'emerald',
  categoryModuleKey: 'serviceCategories',

   features: [
     { key: 'enablePrice', label: 'Hiển thị giá', icon: DollarSign, linkedField: 'price' },
     { key: 'enableDuration', label: 'Thời gian', icon: Clock, linkedField: 'duration' },
     { key: 'enableFeatured', label: 'Nổi bật', icon: Star, linkedField: 'featured' },
   ],

   settings: [
    { key: 'servicesPerPage', label: 'Số dịch vụ / trang', type: 'number', default: 10 },
    {
      key: 'defaultStatus',
      label: 'Trạng thái mặc định',
      type: 'select',
      default: 'draft',
      options: [
        { value: 'draft', label: 'Bản nháp' },
        { value: 'published', label: 'Xuất bản' },
      ],
    },
   ],

   conventionNote: 'Slug tự động từ tiêu đề. Trường order và active bắt buộc theo Rails convention.',

   tabs: ['config', 'data', 'appearance'],
});
