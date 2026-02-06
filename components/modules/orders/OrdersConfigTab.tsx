'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { CreditCard, MapPin, Settings, Truck } from 'lucide-react';
import type { ModuleConfigTabRenderProps } from '@/components/modules/ModuleConfigPage';
import { ModuleStatus, FeaturesCard, FieldsCard, SettingsCard } from '@/components/modules/shared';
import { Input, cn } from '@/app/admin/components/ui';
import { AddressPreview } from './AddressPreview';
import { PaymentMethodsEditor, type PaymentMethodConfig } from './PaymentMethodsEditor';
import { ShippingMethodsEditor, type ShippingMethodConfig } from './ShippingMethodsEditor';

type ConfigTabKey = 'general' | 'shipping' | 'payment' | 'address';

interface BankOption {
  code: string;
  shortName: string;
  name: string;
  logo: string;
}

const DEFAULT_SHIPPING_METHODS: ShippingMethodConfig[] = [
  { id: 'standard', label: 'Giao hàng tiêu chuẩn', description: '2-4 ngày', fee: 30000, estimate: '2-4 ngày' },
  { id: 'express', label: 'Giao hàng nhanh', description: 'Trong 24h', fee: 50000, estimate: 'Trong 24h' },
];

const DEFAULT_PAYMENT_METHODS: PaymentMethodConfig[] = [
  { id: 'cod', label: 'COD', description: 'Thanh toán khi nhận hàng', type: 'COD' },
  { id: 'bank', label: 'Chuyển khoản ngân hàng', description: 'Chuyển khoản trước khi giao', type: 'BankTransfer' },
  { id: 'vietqr', label: 'VietQR', description: 'Quét mã QR để thanh toán', type: 'VietQR' },
];

const parseJsonSetting = <T,>(value: string | number | boolean | undefined, fallback: T): T => {
  if (typeof value !== 'string' || !value) {
    return fallback;
  }
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

export function OrdersConfigTab({
  config,
  moduleData,
  localFeatures,
  localFields,
  localSettings,
  localCategoryFields,
  colorClasses,
  onToggleFeature,
  onToggleField,
  onToggleCategoryField,
  onSettingChange,
}: ModuleConfigTabRenderProps) {
  const [activeTab, setActiveTab] = useState<ConfigTabKey>('general');
  const [banks, setBanks] = useState<BankOption[]>([]);
  const [bankQuery, setBankQuery] = useState('');
  const [bankDropdownOpen, setBankDropdownOpen] = useState(false);
  const [useCustomBank, setUseCustomBank] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch('/data/vietnam-banks.json')
      .then((res) => res.json())
      .then((data: BankOption[]) => {
        if (mounted) {
          setBanks(Array.isArray(data) ? data : []);
        }
      })
      .catch(() => {
        if (mounted) {
          setBanks([]);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const shippingMethods = useMemo(
    () => parseJsonSetting(localSettings.shippingMethods, DEFAULT_SHIPPING_METHODS),
    [localSettings.shippingMethods]
  );
  const paymentMethods = useMemo(
    () => parseJsonSetting(localSettings.paymentMethods, DEFAULT_PAYMENT_METHODS),
    [localSettings.paymentMethods]
  );

  const bankCode = String(localSettings.bankCode ?? '');
  const bankName = String(localSettings.bankName ?? '');
  const bankAccountNumber = String(localSettings.bankAccountNumber ?? '');
  const bankAccountName = String(localSettings.bankAccountName ?? '');
  const vietQrTemplate = String(localSettings.vietQrTemplate ?? 'compact');
  const addressFormat = String(localSettings.addressFormat ?? 'text');

  const selectedBank = useMemo(() => banks.find((bank) => bank.code === bankCode), [banks, bankCode]);
  const derivedCustomBank = useMemo(
    () => !selectedBank && Boolean(bankCode || bankName),
    [selectedBank, bankCode, bankName]
  );
  const isCustomBank = useCustomBank || derivedCustomBank;
  const filteredBanks = useMemo(() => {
    const keyword = bankQuery.trim().toLowerCase();
    if (!keyword) return banks;
    return banks.filter((bank) =>
      bank.code.toLowerCase().includes(keyword) ||
      bank.shortName.toLowerCase().includes(keyword) ||
      bank.name.toLowerCase().includes(keyword)
    );
  }, [banks, bankQuery]);

  const handleShippingChange = (next: ShippingMethodConfig[]) => {
    onSettingChange('shippingMethods', JSON.stringify(next, null, 2));
  };

  const handlePaymentChange = (next: PaymentMethodConfig[]) => {
    onSettingChange('paymentMethods', JSON.stringify(next, null, 2));
  };

  const handleBankSelect = (bank: BankOption) => {
    setUseCustomBank(false);
    onSettingChange('bankCode', bank.code);
    onSettingChange('bankName', bank.shortName || bank.name);
    setBankDropdownOpen(false);
  };

  const handleCustomBank = () => {
    setUseCustomBank(true);
    setBankDropdownOpen(false);
  };

  const tabs: { key: ConfigTabKey; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { key: 'general', label: 'Cài đặt chung', icon: Settings },
    { key: 'shipping', label: 'Vận chuyển', icon: Truck },
    { key: 'payment', label: 'Thanh toán', icon: CreditCard },
    { key: 'address', label: 'Địa chỉ', icon: MapPin },
  ];

  return (
    <>
      <ModuleStatus
        isCore={moduleData?.isCore ?? false}
        enabled={moduleData?.enabled ?? true}
        toggleColor={colorClasses.toggle}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors',
                  activeTab === key
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500 hover:bg-slate-100'
                )}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          {activeTab === 'general' && (
            <SettingsCard title="Cài đặt chung">
              <div className="space-y-3">
                {config.settings
                  ?.filter((setting) => (setting.group ?? 'general') === 'general')
                  .map((setting) => (
                    <div key={setting.key} className="space-y-2">
                      <label className="text-xs text-slate-500">{setting.label}</label>
                      {setting.type === 'select' ? (
                        <select
                          className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                          value={String(localSettings[setting.key] ?? '')}
                          onChange={(event) => onSettingChange(setting.key, event.target.value)}
                        >
                          {(setting.options ?? []).map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      ) : (
                        <Input
                          type={setting.type === 'number' ? 'number' : 'text'}
                          value={String(localSettings[setting.key] ?? '')}
                          onChange={(event) => onSettingChange(setting.key, setting.type === 'number' ? Number(event.target.value || 0) : event.target.value)}
                        />
                      )}
                    </div>
                  ))}
              </div>
            </SettingsCard>
          )}

          {activeTab === 'shipping' && (
            <SettingsCard title="Vận chuyển">
              <ShippingMethodsEditor methods={shippingMethods} onChange={handleShippingChange} />
            </SettingsCard>
          )}

          {activeTab === 'payment' && (
            <SettingsCard title="Thanh toán">
              <div className="space-y-4">
                <PaymentMethodsEditor methods={paymentMethods} onChange={handlePaymentChange} />

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-slate-700">Thông tin ngân hàng</p>
                  <div className="space-y-2">
                    <label className="text-xs text-slate-500">Ngân hàng</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setBankDropdownOpen((prev) => !prev)}
                        className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                      >
                        <span className="flex items-center gap-2 truncate">
                          {selectedBank?.logo && !isCustomBank && (
                            <Image src={selectedBank.logo} alt={selectedBank.shortName} width={20} height={20} unoptimized />
                          )}
                          {isCustomBank
                            ? (bankName || 'Nhập ngân hàng khác')
                            : (selectedBank ? `${selectedBank.shortName} - ${selectedBank.name}` : 'Chọn ngân hàng')}
                        </span>
                        <span className="text-xs text-slate-400">▼</span>
                      </button>
                      {bankDropdownOpen && (
                        <div className="absolute z-10 mt-2 w-full rounded-md border border-slate-200 bg-white p-2 shadow-lg">
                          <Input
                            placeholder="Tìm ngân hàng..."
                            value={bankQuery}
                            onChange={(event) => setBankQuery(event.target.value)}
                          />
                          <div className="mt-2 max-h-60 overflow-auto space-y-1">
                            {filteredBanks.map((bank) => (
                              <button
                                key={bank.code}
                                type="button"
                                onClick={() => handleBankSelect(bank)}
                                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs hover:bg-slate-50"
                              >
                                <Image src={bank.logo} alt={bank.shortName} width={20} height={20} unoptimized />
                                <span className="font-medium">{bank.code}</span>
                                <span className="text-slate-600">{bank.shortName}</span>
                              </button>
                            ))}
                          </div>
                          <button
                            type="button"
                            className="mt-2 w-full rounded-md border border-dashed border-slate-200 px-2 py-2 text-xs text-slate-500"
                            onClick={handleCustomBank}
                          >
                            Nhập ngân hàng khác
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {isCustomBank && (
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      <Input
                        placeholder="Tên ngân hàng"
                        value={bankName}
                        onChange={(event) => onSettingChange('bankName', event.target.value)}
                      />
                      <Input
                        placeholder="Mã ngân hàng (VietQR)"
                        value={bankCode}
                        onChange={(event) => onSettingChange('bankCode', event.target.value)}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <Input
                      placeholder="Số tài khoản"
                      value={bankAccountNumber}
                      onChange={(event) => onSettingChange('bankAccountNumber', event.target.value)}
                    />
                    <Input
                      placeholder="Tên chủ tài khoản"
                      value={bankAccountName}
                      onChange={(event) => onSettingChange('bankAccountName', event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-slate-500">Mẫu VietQR</label>
                    <select
                      className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                      value={vietQrTemplate}
                      onChange={(event) => onSettingChange('vietQrTemplate', event.target.value)}
                    >
                      <option value="compact">Compact (có logo)</option>
                      <option value="compact2">Compact 2 (đơn giản)</option>
                      <option value="qr_only">Chỉ QR</option>
                      <option value="print">In ấn</option>
                    </select>
                  </div>
                </div>
              </div>
            </SettingsCard>
          )}

          {activeTab === 'address' && (
            <SettingsCard title="Địa chỉ giao hàng">
              <div className="space-y-3">
                <label className="text-xs text-slate-500">Định dạng</label>
                <select
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                  value={addressFormat}
                  onChange={(event) => onSettingChange('addressFormat', event.target.value)}
                >
                  <option value="text">Nhập tự do</option>
                  <option value="2-level">2 cấp (Tỉnh/Phường)</option>
                  <option value="3-level">3 cấp (Tỉnh/Quận/Phường)</option>
                </select>
              </div>
              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="mb-2 text-xs font-semibold text-slate-600">Preview</p>
                <AddressPreview format={addressFormat} />
              </div>
            </SettingsCard>
          )}

          {config.features && config.features.length > 0 && (
            <FeaturesCard
              features={config.features.map((f) => ({
                config: {
                  key: f.key,
                  label: f.label,
                  icon: f.icon ?? Settings,
                  linkedField: f.linkedField,
                  description: f.description,
                },
                enabled: localFeatures[f.key] ?? false,
              }))}
              onToggle={onToggleFeature}
              toggleColor={colorClasses.toggle}
            />
          )}
        </div>

        <FieldsCard
          title={`Trường ${config.name}`}
          icon={config.icon}
          iconColorClass={colorClasses.iconText}
          fields={localFields}
          onToggle={onToggleField}
          fieldColorClass={colorClasses.fieldColor}
          toggleColor={colorClasses.toggle}
        />

        {config.categoryModuleKey && localCategoryFields.length > 0 && (
          <FieldsCard
            title="Trường danh mục"
            icon={Settings}
            iconColorClass="text-slate-500"
            fields={localCategoryFields}
            onToggle={onToggleCategoryField}
            fieldColorClass={colorClasses.fieldColor}
            toggleColor={colorClasses.toggle}
          />
        )}
      </div>
    </>
  );
}
