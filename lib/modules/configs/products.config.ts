import { DollarSign, Image, Tag, Box, Package, Layers, Download } from 'lucide-react';
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
    {
      key: 'variantEnabled',
      label: 'Bật tính năng phiên bản',
      type: 'toggle',
      default: false,
      group: 'variants',
    },
    {
      key: 'variantPricing',
      label: 'Giá theo',
      type: 'select',
      default: 'variant',
      options: [
        { value: 'product', label: 'Sản phẩm (giá chung)' },
        { value: 'variant', label: 'Phiên bản (giá riêng)' },
      ],
      group: 'variants',
      dependsOn: 'variantEnabled',
    },
    {
      key: 'variantStock',
      label: 'Tồn kho theo',
      type: 'select',
      default: 'variant',
      options: [
        { value: 'product', label: 'Sản phẩm (tồn chung)' },
        { value: 'variant', label: 'Phiên bản (tồn riêng)' },
      ],
      group: 'variants',
      dependsOn: 'variantEnabled',
    },
    {
      key: 'variantImages',
      label: 'Ảnh phiên bản',
      type: 'select',
      default: 'inherit',
      options: [
        { value: 'inherit', label: 'Kế thừa từ sản phẩm' },
        { value: 'override', label: 'Ảnh riêng mỗi phiên bản' },
        { value: 'both', label: 'Cả hai (có thể override)' },
      ],
      group: 'variants',
      dependsOn: 'variantEnabled',
    },
    {
      key: 'outOfStockDisplay',
      label: 'Hiển thị hết hàng',
      type: 'select',
      default: 'blur',
      options: [
        { value: 'hide', label: 'Ẩn hoàn toàn' },
        { value: 'disable', label: 'Vô hiệu hóa + gạch ngang' },
        { value: 'blur', label: 'Mờ đi + Badge "Hết hàng"' },
      ],
      group: 'variants',
      dependsOn: 'variantEnabled',
    },
    {
      key: 'imageChangeAnimation',
      label: 'Hiệu ứng đổi ảnh',
      type: 'select',
      default: 'fade',
      options: [
        { value: 'none', label: 'Không có' },
        { value: 'fade', label: 'Fade (mờ dần)' },
        { value: 'slide', label: 'Slide (trượt)' },
      ],
      group: 'variants',
      dependsOn: 'variantEnabled',
    },
    {
      key: 'enableDigitalProducts',
      label: 'Bật sản phẩm Digital',
      type: 'toggle',
      default: false,
      group: 'digital',
    },
    {
      key: 'defaultDigitalDeliveryType',
      label: 'Loại giao hàng mặc định',
      type: 'select',
      default: 'account',
      options: [
        { value: 'account', label: 'Tài khoản (username/password)' },
        { value: 'license', label: 'License Key' },
        { value: 'download', label: 'File Download' },
        { value: 'custom', label: 'Tùy chỉnh' },
      ],
      group: 'digital',
      dependsOn: 'enableDigitalProducts',
    },
   ],

   settingGroups: [
     { key: 'general', label: 'Cài đặt chung' },
     { key: 'variants', label: 'Phiên bản sản phẩm', icon: Layers },
     { key: 'digital', label: 'Sản phẩm Digital', icon: Download },
   ],

   conventionNote: 'Slug tự động từ tên. SKU phải unique. Trường price và status bắt buộc.',

  tabs: ['config'],
});
