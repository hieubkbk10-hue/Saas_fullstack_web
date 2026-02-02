 import { UserCog, ImageIcon, Phone, Clock } from 'lucide-react';
 import { defineModule } from '../define-module';
 
 export const usersModule = defineModule({
   key: 'users',
   name: 'Người dùng',
   description: 'Quản lý người dùng hệ thống',
   icon: UserCog,
   color: 'indigo',
   
   features: [
     { key: 'enableAvatar', label: 'Ảnh đại diện', icon: ImageIcon, linkedField: 'avatar' },
     { key: 'enablePhone', label: 'Số điện thoại', icon: Phone, linkedField: 'phone' },
     { key: 'enableLastLogin', label: 'Đăng nhập cuối', icon: Clock, linkedField: 'lastLogin' },
   ],
   
   settings: [
     { key: 'usersPerPage', label: 'Số user / trang', type: 'number', default: 20 },
     { key: 'sessionTimeout', label: 'Timeout (phút)', type: 'number', default: 30 },
     { key: 'maxLoginAttempts', label: 'Max login attempts', type: 'number', default: 5 },
   ],
   
   conventionNote: 'Email unique. Mỗi user gán 1 role. Password hash bcrypt. lastLogin tự động update.',
   
   tabs: ['config', 'data'],
 });
