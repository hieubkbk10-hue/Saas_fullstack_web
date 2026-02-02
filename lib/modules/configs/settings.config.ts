 import { Settings, MapPin, Globe, Share2, Mail } from 'lucide-react';
 import { defineModule } from '../define-module';
 
 export const settingsModule = defineModule({
   key: 'settings',
   name: 'Cài đặt hệ thống',
   description: 'Cấu hình thông tin website, liên hệ, SEO, mạng xã hội',
   icon: Settings,
   color: 'orange',
 
   features: [
     { key: 'enableContact', label: 'Thông tin liên hệ', icon: MapPin },
     { key: 'enableSEO', label: 'SEO cơ bản', icon: Globe },
     { key: 'enableSocial', label: 'Mạng xã hội', icon: Share2 },
     { key: 'enableMail', label: 'Cấu hình Email', icon: Mail },
   ],
 
   settings: [
     { key: 'cacheDuration', label: 'Cache duration (s)', type: 'number', default: 3600 },
   ],
 
   conventionNote: 'Settings lưu dạng key-value với group. Module này là isCore: true - không thể tắt.',
 
   tabs: ['config', 'data'],
 });
