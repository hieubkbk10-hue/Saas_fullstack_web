import { DollarSign, Image, Tag, Box, Package } from 'lucide-react';
import { defineModule } from '../define-module';
 
export const productsModule = defineModule({
   key: 'products',
  name: 'Sản phẩm',
   description: 'Cấu hình sản phẩm và danh mục',
   icon: Package,
   color: 'orange',
  categoryModuleKey: 'productCategories',

   features: [
     { key: 'enableSalePrice', label: 'Giá khuyến mãi', icon: DollarSign, linkedField: 'salePrice' },
     { key: 'enableGallery', label: 'Thư viện ảnh', icon: Image, linkedField: 'images' },
     { key: 'enableSKU', label: 'Mã SKU', icon: Tag, linkedField: 'sku' },
     { key: 'enableStock', label: 'Quản lý kho', icon: Box, linkedField: 'stock' },
   ],

   settings: [
    { key: 'productsPerPage', label: 'Số SP / trang', type: 'number', default: 12 },
    {
      key: 'defaultStatus',
      label: 'Trạng thái mặc định',
      type: 'select',
      default: 'Draft',
      options: [
        { value: 'Draft', label: 'Bản nháp' },
        { value: 'Active', label: 'Đang bán' },
      ],
    },
    { key: 'lowStockThreshold', label: 'Ngưỡng tồn kho thấp', type: 'number', default: 10 },
   ],

   conventionNote: 'Slug tự động từ tên. SKU phải unique. Trường price và status bắt buộc.',

   tabs: ['config', 'data'],
});
