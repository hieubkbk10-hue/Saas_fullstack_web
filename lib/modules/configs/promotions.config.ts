 import { Ticket, Users, ShoppingCart, DollarSign, CalendarClock, CheckCircle } from 'lucide-react';
 import { defineModule } from '../define-module';
 
 export const promotionsModule = defineModule({
   key: 'promotions',
   name: 'Khuyến mãi',
   description: 'Quản lý voucher và mã giảm giá',
   icon: Ticket,
   color: 'rose',
 
   features: [
     { key: 'enableUsageLimit', label: 'Giới hạn lượt dùng', icon: Users, linkedField: 'usageLimit' },
     { key: 'enableMinOrder', label: 'Đơn tối thiểu', icon: ShoppingCart, linkedField: 'minOrderAmount' },
     { key: 'enableMaxDiscount', label: 'Giảm tối đa', icon: DollarSign, linkedField: 'maxDiscountAmount' },
     { key: 'enableSchedule', label: 'Hẹn giờ', icon: CalendarClock },
     { key: 'enableApplicable', label: 'Áp dụng có chọn lọc', icon: CheckCircle },
   ],
 
   settings: [
     { key: 'promotionsPerPage', label: 'Số voucher / trang', type: 'number', default: 20 },
   ],
 
   conventionNote: 'discountType: percent, fixed. code unique và uppercase. Validate trước khi áp dụng.',
 
   tabs: ['config', 'data'],
 });
