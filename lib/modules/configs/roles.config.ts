 import { Shield, FileText, Palette, GitBranch } from 'lucide-react';
 import { defineModule } from '../define-module';
 
 export const rolesModule = defineModule({
   key: 'roles',
   name: 'Vai trò',
   description: 'Quản lý vai trò và phân quyền',
   icon: Shield,
   color: 'amber',
   
   features: [
     { key: 'enableDescription', label: 'Mô tả vai trò', icon: FileText, linkedField: 'description' },
     { key: 'enableColor', label: 'Màu sắc', icon: Palette, linkedField: 'color' },
     { key: 'enableHierarchy', label: 'Phân cấp', icon: GitBranch },
   ],
   
   settings: [
     { key: 'maxRolesPerUser', label: 'Max roles / user', type: 'number', default: 1 },
     { key: 'rolesPerPage', label: 'Số roles / trang', type: 'number', default: 10 },
   ],
   
   conventionNote: 'Role key là unique và lowercase. permissions là array string. isSystem = true không thể xóa.',
   
   tabs: ['config', 'data'],
 });
