 import { ShoppingBag, CreditCard, Truck, MapPin } from 'lucide-react';
 import { defineModule } from '../define-module';
 
 export const ordersModule = defineModule({
   key: 'orders',
   name: 'Đơn hàng',
   description: 'Quản lý đơn hàng khách hàng',
   icon: ShoppingBag,
   color: 'emerald',
   
   features: [
     { key: 'enablePayment', label: 'Thanh toán', icon: CreditCard, linkedField: 'paymentMethod', description: 'Phương thức & trạng thái thanh toán' },
     { key: 'enableShipping', label: 'Vận chuyển', icon: Truck, linkedField: 'shippingAddress', description: 'Phí ship, địa chỉ giao hàng' },
     { key: 'enableTracking', label: 'Theo dõi vận đơn', icon: MapPin, linkedField: 'trackingNumber', description: 'Mã vận đơn, tracking' },
   ],
   
   settings: [
     { key: 'ordersPerPage', label: 'Số đơn / trang', type: 'number', default: 20 },
     { 
       key: 'defaultStatus', 
       label: 'Trạng thái mặc định', 
       type: 'select',
       default: 'Pending',
       options: [
         { value: 'Pending', label: 'Chờ xử lý' },
         { value: 'Processing', label: 'Đang xử lý' },
       ],
     },
   ],
   
   conventionNote: 'orderNumber tự động generate. status: Pending, Processing, Shipped, Delivered, Cancelled. totalAmount tính tự động.',
   
   tabs: ['config', 'data'],
 });
