'use client';

import React, { useMemo, useState } from 'react';
import { Input } from '@/app/admin/components/ui';

interface AddressPreviewProps {
  format: string;
}

interface ComboOption {
  code: string;
  name: string;
}

const SAMPLE_PROVINCES: ComboOption[] = [
  { code: '01', name: 'Hà Nội' },
  { code: '79', name: 'Hồ Chí Minh' },
  { code: '48', name: 'Đà Nẵng' },
];

const SAMPLE_DISTRICTS: Record<string, ComboOption[]> = {
  '01': [
    { code: '001', name: 'Ba Đình' },
    { code: '002', name: 'Hoàn Kiếm' },
  ],
  '79': [
    { code: '760', name: 'Quận 1' },
    { code: '769', name: 'Quận 7' },
  ],
  '48': [
    { code: '490', name: 'Hải Châu' },
    { code: '491', name: 'Thanh Khê' },
  ],
};

const SAMPLE_WARDS: Record<string, ComboOption[]> = {
  '001': [
    { code: '00001', name: 'Phúc Xá' },
    { code: '00004', name: 'Trúc Bạch' },
  ],
  '002': [
    { code: '00015', name: 'Hàng Trống' },
    { code: '00018', name: 'Cửa Nam' },
  ],
  '760': [
    { code: '26734', name: 'Bến Nghé' },
    { code: '26737', name: 'Bến Thành' },
  ],
  '769': [
    { code: '27238', name: 'Tân Phú' },
    { code: '27247', name: 'Phú Mỹ' },
  ],
  '490': [
    { code: '20194', name: 'Thạch Thang' },
    { code: '20197', name: 'Hải Châu 1' },
  ],
  '491': [
    { code: '20209', name: 'Tam Thuận' },
    { code: '20212', name: 'Thanh Khê Tây' },
  ],
};

interface ComboboxProps {
  placeholder: string;
  options: ComboOption[];
  value: ComboOption | null;
  onChange: (value: ComboOption) => void;
}

function Combobox({ placeholder, options, value, onChange }: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    return options.filter((option) => option.name.toLowerCase().includes(query.toLowerCase()));
  }, [options, query]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
      >
        <span className="truncate">{value ? value.name : placeholder}</span>
        <span className="text-xs text-slate-400">▼</span>
      </button>
      {open && (
        <div className="absolute z-10 mt-2 w-full rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm kiếm..."
            className="mb-2"
          />
          <div className="max-h-48 overflow-auto">
            {filtered.length === 0 && (
              <div className="px-2 py-2 text-xs text-slate-500">Không có kết quả.</div>
            )}
            {filtered.map((option) => (
              <button
                key={option.code}
                type="button"
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                  setQuery('');
                }}
                className="flex w-full items-center justify-between rounded-md px-2 py-2 text-sm text-slate-700 hover:bg-slate-100"
              >
                <span>{option.name}</span>
                {value?.code === option.code && <span className="text-xs text-slate-400">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function AddressPreview({ format }: AddressPreviewProps) {
  const [province, setProvince] = useState<ComboOption | null>(SAMPLE_PROVINCES[0] ?? null);
  const districts = useMemo(() => (province ? SAMPLE_DISTRICTS[province.code] ?? [] : []), [province]);
  const [district, setDistrict] = useState<ComboOption | null>(districts[0] ?? null);
  const wards = useMemo(() => (district ? SAMPLE_WARDS[district.code] ?? [] : []), [district]);
  const [ward, setWard] = useState<ComboOption | null>(wards[0] ?? null);

  React.useEffect(() => {
    setDistrict(districts[0] ?? null);
  }, [districts]);

  React.useEffect(() => {
    setWard(wards[0] ?? null);
  }, [wards]);

  if (format === 'text') {
    return (
      <div className="space-y-2">
        <div className="text-xs text-slate-500">Khách hàng sẽ nhập một dòng địa chỉ.</div>
        <Input placeholder="Địa chỉ giao hàng" disabled />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-3">
        <Combobox
          placeholder="Chọn Tỉnh/Thành"
          options={SAMPLE_PROVINCES}
          value={province}
          onChange={setProvince}
        />
        {format === '3-level' && (
          <Combobox
            placeholder="Chọn Quận/Huyện"
            options={districts}
            value={district}
            onChange={setDistrict}
          />
        )}
        <Combobox
          placeholder="Chọn Phường/Xã"
          options={format === '3-level' ? wards : districts}
          value={format === '3-level' ? ward : district}
          onChange={format === '3-level' ? setWard : setDistrict}
        />
      </div>
      <Input placeholder="Số nhà, tên đường" />
    </div>
  );
}
