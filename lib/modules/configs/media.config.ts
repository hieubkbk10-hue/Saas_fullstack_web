 import { Image, FolderTree, Type, Ruler } from 'lucide-react';
 import { defineModule } from '../define-module';
 
 export const mediaModule = defineModule({
   key: 'media',
   name: 'Thư viện Media',
   description: 'Quản lý hình ảnh, video, tài liệu',
   icon: Image,
   color: 'cyan',
 
   features: [
     { key: 'enableFolders', label: 'Thư mục', icon: FolderTree, linkedField: 'folder' },
     { key: 'enableAltText', label: 'Alt Text', icon: Type, linkedField: 'alt' },
     { key: 'enableDimensions', label: 'Kích thước ảnh', icon: Ruler, linkedField: 'dimensions' },
   ],
 
   settings: [
     { key: 'itemsPerPage', label: 'Số file / trang', type: 'number', default: 24 },
     { key: 'maxFileSize', label: 'Max file size (MB)', type: 'number', default: 5 },
   ],
 
   conventionNote: 'File lưu trên Convex Storage. Size tính bằng bytes. Hỗ trợ image, video, pdf.',
 
   tabs: ['config', 'data'],
 });
