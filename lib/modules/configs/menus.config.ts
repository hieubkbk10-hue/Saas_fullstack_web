 import { Menu, FolderTree, ExternalLink } from 'lucide-react';
 import { defineModule } from '../define-module';
 
 export const menusModule = defineModule({
   key: 'menus',
   name: 'Menu',
   description: 'Quản lý menu điều hướng',
   icon: Menu,
   color: 'cyan',
   
   features: [
     { key: 'enableNested', label: 'Menu lồng nhau', icon: FolderTree, linkedField: 'parentId', description: 'Cho phép tạo menu con nhiều cấp' },
     { key: 'enableNewTab', label: 'Mở tab mới', icon: ExternalLink, linkedField: 'openInNewTab', description: 'Cho phép mở link trong tab mới' },
     { key: 'enableIcon', label: 'Icon menu', icon: Menu, linkedField: 'icon', description: 'Cho phép gán icon cho menu item' },
   ],
   
   settings: [
     { key: 'maxDepth', label: 'Độ sâu tối đa', type: 'number', default: 3 },
     { 
       key: 'defaultLocation', 
       label: 'Vị trí mặc định', 
       type: 'select',
       default: 'header',
       options: [
         { value: 'header', label: 'Header' },
         { value: 'footer', label: 'Footer' },
         { value: 'sidebar', label: 'Sidebar' },
       ],
     },
     { key: 'menusPerPage', label: 'Số menu / trang', type: 'number', default: 10 },
   ],
   
   conventionNote: 'location: header, footer, sidebar. order tự động increment. parentId null = root item.',
   
  tabs: ['config'],
 });
