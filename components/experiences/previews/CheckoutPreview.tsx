import React from 'react';
import { CreditCard, Package, Truck } from 'lucide-react';

type CheckoutPreviewProps = {
  flowStyle: 'single-page' | 'multi-step';
  orderSummaryPosition: 'right' | 'bottom';
  showPaymentMethods: boolean;
  showShippingOptions: boolean;
};

export function CheckoutPreview({
  flowStyle,
  orderSummaryPosition,
  showPaymentMethods,
  showShippingOptions,
}: CheckoutPreviewProps) {
  const OrderSummary = () => (
    <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-2 space-y-1">
      <div className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
        <Package size={10} />
        <span>Tóm tắt đơn</span>
      </div>
      <div className="space-y-0.5 text-slate-600 dark:text-slate-400">
        <div className="flex justify-between">
          <span>Tạm tính</span>
          <span>500k</span>
        </div>
        <div className="flex justify-between">
          <span>Ship</span>
          <span>30k</span>
        </div>
        <div className="flex justify-between font-medium text-green-600 dark:text-green-400 border-t border-slate-300 dark:border-slate-600 pt-0.5">
          <span>Tổng</span>
          <span>530k</span>
        </div>
      </div>
    </div>
  );

  const CheckoutForm = () => (
    <div className="space-y-2">
      {flowStyle === 'multi-step' && (
        <div className="flex gap-1 mb-2">
          {['Info', 'Ship', 'Pay'].map((step, i) => (
            <div 
              key={step} 
              className={`flex-1 text-center py-0.5 rounded text-xs ${
                i === 0 
                  ? 'bg-green-500 text-white' 
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
              }`}
            >
              {step}
            </div>
          ))}
        </div>
      )}
      
      <div className="space-y-1">
        <div className="bg-slate-200 dark:bg-slate-700 rounded h-6" />
        <div className="bg-slate-200 dark:bg-slate-700 rounded h-6" />
      </div>

      {showShippingOptions && (
        <div className="border border-green-200 dark:border-green-800 rounded p-1 space-y-1">
          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
            <Truck size={10} />
            <span className="font-medium">Vận chuyển</span>
          </div>
          <div className="flex items-center gap-1">
            <input type="radio" checked readOnly className="w-2 h-2" />
            <span className="text-slate-600 dark:text-slate-400">Giao nhanh - 30k</span>
          </div>
          <div className="flex items-center gap-1">
            <input type="radio" readOnly className="w-2 h-2" />
            <span className="text-slate-600 dark:text-slate-400">Giao tiết kiệm - 15k</span>
          </div>
        </div>
      )}

      {showPaymentMethods && (
        <div className="border border-green-200 dark:border-green-800 rounded p-1 space-y-1">
          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
            <CreditCard size={10} />
            <span className="font-medium">Thanh toán</span>
          </div>
          <div className="flex items-center gap-1">
            <input type="radio" checked readOnly className="w-2 h-2" />
            <span className="text-slate-600 dark:text-slate-400">COD</span>
          </div>
          <div className="flex items-center gap-1">
            <input type="radio" readOnly className="w-2 h-2" />
            <span className="text-slate-600 dark:text-slate-400">ATM/Visa</span>
          </div>
          <div className="flex items-center gap-1">
            <input type="radio" readOnly className="w-2 h-2" />
            <span className="text-slate-600 dark:text-slate-400">E-wallet</span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-3 text-xs">
      <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded p-2 space-y-1">
        <div className="font-medium text-green-700 dark:text-green-400">
          Flow: {flowStyle === 'single-page' ? 'Single Page' : 'Multi-Step'}
        </div>
        <div className="text-green-600 dark:text-green-500">
          Summary: {orderSummaryPosition === 'right' ? 'Right Sidebar' : 'Bottom'}
        </div>
      </div>

      {orderSummaryPosition === 'right' && (
        <div className="grid grid-cols-2 gap-2">
          <CheckoutForm />
          <OrderSummary />
        </div>
      )}

      {orderSummaryPosition === 'bottom' && (
        <div className="space-y-2">
          <CheckoutForm />
          <OrderSummary />
        </div>
      )}
    </div>
  );
}
