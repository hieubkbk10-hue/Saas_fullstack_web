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

  settingGroups: [
    { key: 'general', label: 'Cài đặt chung' },
    { key: 'address', label: 'Địa chỉ giao hàng' },
    { key: 'shipping', label: 'Vận chuyển' },
    { key: 'payment', label: 'Thanh toán' },
  ],
   
  settings: [
    { key: 'ordersPerPage', label: 'Số đơn / trang', type: 'number', default: 20, group: 'general' },
    { 
      key: 'defaultStatus', 
      label: 'Trạng thái mặc định', 
      type: 'select',
      default: 'Pending',
      group: 'general',
      options: [
        { value: 'Pending', label: 'Chờ xử lý' },
        { value: 'Processing', label: 'Đang xử lý' },
      ],
    },
    {
      key: 'addressFormat',
      label: 'Cấu hình địa chỉ',
      type: 'select',
      default: 'text',
      group: 'address',
      options: [
        { value: 'text', label: 'Nhập tự do' },
        { value: '2-level', label: '2 cấp (Tỉnh/Phường)' },
        { value: '3-level', label: '3 cấp (Tỉnh/Quận/Phường)' },
      ],
    },
    {
      key: 'shippingMethods',
      label: 'Danh sách phương thức vận chuyển (JSON)',
      type: 'json',
      group: 'shipping',
      default: JSON.stringify([
        {
          id: 'standard',
          label: 'Giao hàng tiêu chuẩn',
          description: '2-4 ngày',
          fee: 30000,
          estimate: '2-4 ngày',
        },
        {
          id: 'express',
          label: 'Giao hàng nhanh',
          description: 'Trong 24h',
          fee: 50000,
          estimate: 'Trong 24h',
        },
      ], null, 2),
    },
    {
      key: 'paymentMethods',
      label: 'Danh sách phương thức thanh toán (JSON)',
      type: 'json',
      group: 'payment',
      default: JSON.stringify([
        {
          id: 'cod',
          label: 'COD',
          description: 'Thanh toán khi nhận hàng',
          type: 'COD',
        },
        {
          id: 'bank',
          label: 'Chuyển khoản ngân hàng',
          description: 'Chuyển khoản trước khi giao',
          type: 'BankTransfer',
        },
        {
          id: 'vietqr',
          label: 'VietQR',
          description: 'Quét mã QR để thanh toán',
          type: 'VietQR',
        },
      ], null, 2),
    },
    { key: 'bankName', label: 'Ngân hàng', type: 'text', default: 'Vietcombank', group: 'payment' },
    { key: 'bankCode', label: 'Mã ngân hàng (VietQR)', type: 'text', default: 'VCB', group: 'payment' },
    { key: 'bankAccountName', label: 'Tên chủ tài khoản', type: 'text', default: 'CÔNG TY VIETADMIN', group: 'payment' },
    { key: 'bankAccountNumber', label: 'Số tài khoản', type: 'text', default: '0123456789', group: 'payment' },
    { key: 'bankBranch', label: 'Chi nhánh', type: 'text', default: 'Chi nhánh Hà Nội', group: 'payment' },
    { key: 'vietQrTemplate', label: 'Mẫu VietQR', type: 'text', default: 'compact', group: 'payment' },
  ],
   
   conventionNote: 'orderNumber tự động generate. status: Pending, Processing, Shipped, Delivered, Cancelled. totalAmount tính tự động.',
   
   tabs: ['config', 'data'],
 });
