 import { ShoppingCart, Clock, Users, StickyNote } from 'lucide-react';
 import { defineModule } from '../define-module';
 
 export const cartModule = defineModule({
   key: 'cart',
   name: 'Giỏ hàng',
   description: 'Cấu hình chức năng giỏ hàng cho khách',
   icon: ShoppingCart,
   color: 'emerald',
 
   features: [
     { key: 'enableExpiry', label: 'Hết hạn giỏ hàng', icon: Clock, linkedField: 'expiresAt' },
     { key: 'enableGuestCart', label: 'Giỏ hàng khách', icon: Users, linkedField: 'sessionId' },
     { key: 'enableNote', label: 'Ghi chú', icon: StickyNote, linkedField: 'note' },
   ],
 
   settings: [
     { key: 'cartsPerPage', label: 'Số giỏ hàng / trang', type: 'number', default: 20 },
     { key: 'expiryDays', label: 'Hết hạn sau (ngày)', type: 'number', default: 7 },
     { key: 'maxItemsPerCart', label: 'Tối đa SP / giỏ', type: 'number', default: 50 },
   ],
 
   conventionNote: 'Giỏ hàng phụ thuộc module Sản phẩm. Giá lưu tại thời điểm thêm vào giỏ. Trạng thái: Active, Converted, Abandoned.',
 
   tabs: ['config', 'data'],
 });
