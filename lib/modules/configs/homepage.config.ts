 import { Home, ImageIcon, FileText, LayoutGrid, Users, Phone } from 'lucide-react';
 import { defineModule } from '../define-module';
 
 export const homepageModule = defineModule({
   key: 'homepage',
   name: 'Trang chủ',
   description: 'Cấu hình các section trang chủ',
   icon: Home,
   color: 'orange',
   
   features: [
     { key: 'enableHero', label: 'Hero Banner', icon: ImageIcon },
     { key: 'enableAbout', label: 'Giới thiệu', icon: FileText },
     { key: 'enableProducts', label: 'Sản phẩm nổi bật', icon: LayoutGrid },
     { key: 'enablePosts', label: 'Bài viết mới', icon: FileText },
     { key: 'enablePartners', label: 'Đối tác', icon: Users },
     { key: 'enableContact', label: 'Liên hệ', icon: Phone },
   ],
   
   settings: [
     { key: 'maxSections', label: 'Số section tối đa', type: 'number', default: 10 },
     { 
       key: 'defaultSectionType', 
       label: 'Loại section mặc định', 
       type: 'select',
       default: 'hero',
       options: [
         { value: 'hero', label: 'Hero Banner' },
         { value: 'about', label: 'Giới thiệu' },
         { value: 'products', label: 'Sản phẩm nổi bật' },
         { value: 'posts', label: 'Bài viết mới' },
         { value: 'partners', label: 'Đối tác' },
         { value: 'contact', label: 'Liên hệ' },
       ],
     },
   ],
   
   conventionNote: 'type: hero, about, products, posts, partners, contact. config lưu JSON tùy chỉnh cho từng section.',
   
   tabs: ['config', 'data'],
 });
