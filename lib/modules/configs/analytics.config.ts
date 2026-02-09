 import { BarChart3, TrendingUp, Users, Package, FileDown } from 'lucide-react';
 import { defineModule } from '../define-module';
 
 export const analyticsModule = defineModule({
   key: 'analytics',
   name: 'Báo cáo & Thống kê',
   description: 'Dashboard phân tích dữ liệu kinh doanh',
   icon: BarChart3,
   color: 'rose',
 
   features: [
     { key: 'enableSales', label: 'Báo cáo doanh thu', icon: TrendingUp, linkedField: 'revenue' },
     { key: 'enableCustomers', label: 'Báo cáo khách hàng', icon: Users, linkedField: 'newCustomers' },
     { key: 'enableProducts', label: 'Báo cáo sản phẩm', icon: Package, linkedField: 'topProducts' },
     { key: 'enableTraffic', label: 'Báo cáo lượt truy cập', icon: BarChart3, linkedField: 'pageviews' },
     { key: 'enableExport', label: 'Xuất báo cáo', icon: FileDown, linkedField: 'exportFormat' },
   ],
 
   settings: [
     {
       key: 'defaultPeriod',
       label: 'Khoảng thời gian mặc định',
       type: 'select',
       default: '30d',
       options: [
         { value: '7d', label: '7 ngày' },
         { value: '30d', label: '30 ngày' },
         { value: '90d', label: '90 ngày' },
         { value: '1y', label: '1 năm' },
       ],
     },
     { key: 'refreshInterval', label: 'Refresh interval (giây)', type: 'number', default: 300 },
   ],
 
   conventionNote: 'Dữ liệu thống kê được cache và refresh định kỳ theo refreshInterval. Hỗ trợ export CSV/Excel/PDF.',
 
  tabs: ['config'],
 });
