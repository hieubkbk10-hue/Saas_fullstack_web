 import { CalendarClock, CheckCircle, DollarSign, Eye, Layers, ShoppingCart, Ticket, Users } from 'lucide-react';
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
    { key: 'enableAdvancedDiscount', label: 'Loại giảm nâng cao', icon: Ticket },
    { key: 'enableCustomerConditions', label: 'Điều kiện khách hàng', icon: Users },
    { key: 'enableBudgetLimit', label: 'Ngân sách khuyến mãi', icon: DollarSign },
    { key: 'enableStacking', label: 'Cộng dồn & ưu tiên', icon: Layers },
    { key: 'enableDisplay', label: 'Hiển thị ngoài site', icon: Eye },
   ],
 
   settings: [
     { key: 'promotionsPerPage', label: 'Số voucher / trang', type: 'number', default: 20 },
   ],
 
  conventionNote: 'promotionType: coupon/campaign/flash_sale/bundle/loyalty. discountType: percent, fixed, buy_x_get_y, buy_a_get_b, tiered, free_shipping, gift. code unique + uppercase.',
 
   tabs: ['config', 'data'],
 });
