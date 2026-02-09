'use client';

import React, { useState } from 'react';
import { Check, Copy, Download, Eye, EyeOff, Key, User, FileText, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

type Credentials = {
  username?: string;
  password?: string;
  licenseKey?: string;
  downloadUrl?: string;
  customContent?: string;
  expiresAt?: number;
  deliveredAt?: number;
};

type Props = {
  type: string;
  credentials: Credentials;
  brandColor?: string;
};

const getTint = (hex: string, opacity: number) => {
  const cleaned = hex.replace('#', '');
  if (cleaned.length !== 6) {
    return hex;
  }
  const r = parseInt(cleaned.slice(0, 2), 16);
  const g = parseInt(cleaned.slice(2, 4), 16);
  const b = parseInt(cleaned.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export function DigitalCredentialsDisplay({ type, credentials, brandColor = '#22c55e' }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [now] = useState(() => Date.now());

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Đã copy!');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const isExpired = Boolean(credentials.expiresAt && now && credentials.expiresAt < now);

  return (
    <div
      className="rounded-xl border p-4 space-y-3"
      style={{ backgroundColor: getTint(brandColor, 0.04), borderColor: getTint(brandColor, 0.2) }}
    >
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-slate-500 uppercase">Thông tin sản phẩm Digital</div>
        {isExpired && (
          <div className="flex items-center gap-1 text-xs text-amber-600">
            <AlertTriangle size={12} /> Đã hết hạn
          </div>
        )}
      </div>

      {type === 'account' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center gap-2">
              <User size={14} className="text-slate-400" />
              <span className="text-sm font-mono">{credentials.username}</span>
            </div>
            <button
              type="button"
              onClick={() => credentials.username && copyToClipboard(credentials.username, 'username')}
              className="text-slate-400 hover:text-slate-600"
            >
              {copiedField === 'username' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            </button>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center gap-2">
              <Key size={14} className="text-slate-400" />
              <span className="text-sm font-mono">
                {showPassword ? credentials.password : '••••••••••••'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <button
                type="button"
                onClick={() => credentials.password && copyToClipboard(credentials.password, 'password')}
                className="text-slate-400 hover:text-slate-600"
              >
                {copiedField === 'password' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {type === 'license' && (
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-2">
            <Key size={14} className="text-slate-400" />
            <span className="text-sm font-mono">{credentials.licenseKey}</span>
          </div>
          <button
            type="button"
            onClick={() => credentials.licenseKey && copyToClipboard(credentials.licenseKey, 'license')}
            className="text-slate-400 hover:text-slate-600"
          >
            {copiedField === 'license' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
          </button>
        </div>
      )}

      {type === 'download' && credentials.downloadUrl && (
        <a
          href={credentials.downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white"
          style={{ backgroundColor: brandColor }}
        >
          <Download size={16} /> Tải xuống
        </a>
      )}

      {type === 'custom' && (
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-start gap-2">
            <FileText size={14} className="mt-0.5 text-slate-400" />
            <p className="text-sm whitespace-pre-wrap">{credentials.customContent}</p>
          </div>
        </div>
      )}

      {credentials.expiresAt && (
        <div className="text-xs text-slate-500">
          Hết hạn: {new Date(credentials.expiresAt).toLocaleDateString('vi-VN')}
        </div>
      )}
    </div>
  );
}
