 import { FileText, Tag, Star, Clock } from 'lucide-react';
 import { defineModule } from '../define-module';
 
 export const postsModule = defineModule({
   key: 'posts',
  name: 'Bài viết',
   description: 'Cấu hình bài viết blog',
   icon: FileText,
   color: 'cyan',
   categoryModuleKey: 'postCategories',
   
   features: [
     { key: 'enableTags', label: 'Tags', icon: Tag, linkedField: 'tags' },
     { key: 'enableFeatured', label: 'Nổi bật', icon: Star, linkedField: 'featured' },
     { key: 'enableScheduling', label: 'Hẹn giờ', icon: Clock, linkedField: 'publish_date' },
   ],
   
   settings: [
     { key: 'postsPerPage', label: 'Số bài / trang', type: 'number', default: 10 },
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
   
   conventionNote: 'Slug tự động từ tiêu đề. Trường order và active bắt buộc.',
   
  tabs: ['config'],
 });
