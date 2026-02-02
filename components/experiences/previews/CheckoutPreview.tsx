import React from 'react';
import { Check, CreditCard, MapPin, Package, Truck, Wallet } from 'lucide-react';

type CheckoutPreviewProps = {
  flowStyle: 'single-page' | 'multi-step';
  orderSummaryPosition: 'right' | 'bottom';
  showPaymentMethods: boolean;
  showShippingOptions: boolean;
  device?: 'desktop' | 'tablet' | 'mobile';
  brandColor?: string;
};

const mockCartItems = [
  { id: 1, name: 'iPhone 15 Pro Max', price: 34990000, quantity: 1 },
  { id: 2, name: 'AirPods Pro 2', price: 6490000, quantity: 2 },
];

const formatVND = (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
const subtotal = mockCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
const shipping = 30000;
const total = subtotal + shipping;

function OrderSummary({ brandColor = '#22c55e' }: { brandColor?: string }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2 text-slate-900 font-semibold">
        <Package size={16} />
        <span>Đơn hàng ({mockCartItems.length} sản phẩm)</span>
      </div>
      <div className="space-y-2">
        {mockCartItems.map(item => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-slate-600">{item.name} x{item.quantity}</span>
            <span className="font-medium">{formatVND(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-200 pt-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Tạm tính</span>
          <span>{formatVND(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Phí vận chuyển</span>
          <span>{formatVND(shipping)}</span>
        </div>
        <div className="flex justify-between font-semibold text-base pt-2 border-t border-slate-200">
          <span>Tổng cộng</span>
          <span style={{ color: brandColor }}>{formatVND(total)}</span>
        </div>
      </div>
      <button className="w-full py-3 rounded-xl text-white font-semibold text-sm" style={{ backgroundColor: brandColor }}>
        Đặt hàng
      </button>
    </div>
  );
}

function CheckoutForm({ 
  flowStyle, 
  showPaymentMethods, 
  showShippingOptions,
  brandColor = '#22c55e',
}: { flowStyle: 'single-page' | 'multi-step'; showPaymentMethods: boolean; showShippingOptions: boolean; brandColor?: string }) {
  const steps = [
    { label: 'Thông tin', icon: MapPin, done: true },
    { label: 'Vận chuyển', icon: Truck, done: flowStyle === 'single-page' },
    { label: 'Thanh toán', icon: CreditCard, done: false },
  ];

  return (
    <div className="space-y-4">
      {flowStyle === 'multi-step' && (
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, i) => (
            <React.Fragment key={step.label}>
              <div className="flex flex-col items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${step.done ? 'text-white' : 'bg-slate-100 text-slate-400'}`}
                  style={step.done ? { backgroundColor: brandColor } : undefined}
                >
                  {step.done ? <Check size={18} /> : <step.icon size={18} />}
                </div>
                <span className={`text-xs mt-1 ${step.done ? 'font-medium' : 'text-slate-400'}`} style={step.done ? { color: brandColor } : undefined}>
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${step.done ? '' : 'bg-slate-200'}`} style={step.done ? { backgroundColor: brandColor } : undefined} />
              )}
            </React.Fragment>
          ))}
        </div>
      )}
      
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <MapPin size={16} style={{ color: brandColor }} />
          Thông tin giao hàng
        </h3>
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="Họ tên" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm" disabled />
            <input type="text" placeholder="Số điện thoại" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm" disabled />
          </div>
          <input type="email" placeholder="Email" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm" disabled />
          <input type="text" placeholder="Địa chỉ giao hàng" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm" disabled />
        </div>
      </div>

      {showShippingOptions && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Truck size={16} style={{ color: brandColor }} />
            Phương thức vận chuyển
          </h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer" style={{ borderColor: brandColor, backgroundColor: `${brandColor}08` }}>
              <input type="radio" name="shipping" checked readOnly className="w-4 h-4" style={{ accentColor: brandColor }} />
              <div className="flex-1">
                <div className="font-medium text-sm">Giao hàng nhanh</div>
                <div className="text-xs text-slate-500">Nhận hàng trong 1-2 ngày</div>
              </div>
              <span className="font-semibold text-sm">{formatVND(30000)}</span>
            </label>
            <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
              <input type="radio" name="shipping" readOnly className="w-4 h-4" />
              <div className="flex-1">
                <div className="font-medium text-sm">Giao hàng tiết kiệm</div>
                <div className="text-xs text-slate-500">Nhận hàng trong 3-5 ngày</div>
              </div>
              <span className="font-semibold text-sm">{formatVND(15000)}</span>
            </label>
          </div>
        </div>
      )}

      {showPaymentMethods && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <CreditCard size={16} style={{ color: brandColor }} />
            Phương thức thanh toán
          </h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer" style={{ borderColor: brandColor, backgroundColor: `${brandColor}08` }}>
              <input type="radio" name="payment" checked readOnly className="w-4 h-4" style={{ accentColor: brandColor }} />
              <Package size={18} className="text-slate-500" />
              <div className="flex-1">
                <div className="font-medium text-sm">Thanh toán khi nhận hàng (COD)</div>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
              <input type="radio" name="payment" readOnly className="w-4 h-4" />
              <CreditCard size={18} className="text-slate-500" />
              <div className="flex-1">
                <div className="font-medium text-sm">Thẻ ATM / Visa / Mastercard</div>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
              <input type="radio" name="payment" readOnly className="w-4 h-4" />
              <Wallet size={18} className="text-slate-500" />
              <div className="flex-1">
                <div className="font-medium text-sm">Ví điện tử (MoMo, ZaloPay, VNPay)</div>
              </div>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

export function CheckoutPreview({
  flowStyle,
  orderSummaryPosition,
  showPaymentMethods,
  showShippingOptions,
  device = 'desktop',
  brandColor = '#22c55e',
}: CheckoutPreviewProps) {
  const isMobile = device === 'mobile';
  const isRightSidebar = orderSummaryPosition === 'right' && !isMobile;

  return (
    <div className="py-6 px-4 min-h-[300px]">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-6">Thanh toán</h1>
        
        <div className={isRightSidebar ? 'grid grid-cols-3 gap-6' : 'space-y-4'}>
          <div className={isRightSidebar ? 'col-span-2' : ''}>
            <CheckoutForm 
              flowStyle={flowStyle} 
              showPaymentMethods={showPaymentMethods} 
              showShippingOptions={showShippingOptions}
              brandColor={brandColor}
            />
          </div>
          <div>
            <OrderSummary brandColor={brandColor} />
          </div>
        </div>
      </div>
    </div>
  );
}