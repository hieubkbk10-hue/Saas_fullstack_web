 import { Bell, Mail, Clock, Users } from 'lucide-react';
 import { defineModule } from '../define-module';
 
 export const notificationsModule = defineModule({
   key: 'notifications',
   name: 'Thông báo',
   description: 'Quản lý thông báo hệ thống',
   icon: Bell,
   color: 'rose',
 
   features: [
     { key: 'enableEmail', label: 'Gửi Email', icon: Mail, linkedField: 'sendEmail' },
     { key: 'enableScheduling', label: 'Hẹn giờ gửi', icon: Clock, linkedField: 'scheduledAt' },
     { key: 'enableTargeting', label: 'Nhắm đối tượng', icon: Users, linkedField: 'targetType' },
   ],
 
   settings: [
     { key: 'itemsPerPage', label: 'Số thông báo / trang', type: 'number', default: 20 },
   ],
 
   conventionNote: 'type: info, success, warning, error. targetType: all, customers, users, specific. status: Draft, Scheduled, Sent, Cancelled.',
 
   tabs: ['config', 'data'],
 });
