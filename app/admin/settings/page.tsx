'use client';

import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { cn, Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '../components/ui';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Đã lưu cài đặt');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Cài đặt hệ thống</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Quản lý cấu hình website và ứng dụng</p>
      </div>

      <div className="flex gap-6">
        <div className="w-48 shrink-0">
          <nav className="space-y-1">
            {[
              { key: 'general', label: 'Thông tin chung' },
              { key: 'seo', label: 'SEO' },
              { key: 'social', label: 'Mạng xã hội' },
              { key: 'email', label: 'Email' },
              { key: 'payment', label: 'Thanh toán' },
            ].map(item => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={cn(
                  "w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  activeTab === item.key 
                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1">
          <form onSubmit={handleSubmit}>
            {activeTab === 'general' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Thông tin chung</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tên website</Label>
                    <Input defaultValue="VietAdmin" placeholder="Tên hiển thị của website" />
                  </div>
                  <div className="space-y-2">
                    <Label>Mô tả ngắn</Label>
                    <textarea 
                      className="w-full min-h-[80px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      defaultValue="Hệ thống quản trị website chuyên nghiệp"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Email liên hệ</Label>
                      <Input type="email" defaultValue="contact@vietadmin.com" />
                    </div>
                    <div className="space-y-2">
                      <Label>Số điện thoại</Label>
                      <Input defaultValue="1900 1234" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Địa chỉ</Label>
                    <Input defaultValue="123 Nguyễn Huệ, Quận 1, TP.HCM" />
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'seo' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Cài đặt SEO</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Meta Title mặc định</Label>
                    <Input defaultValue="VietAdmin - Hệ thống quản trị chuyên nghiệp" />
                  </div>
                  <div className="space-y-2">
                    <Label>Meta Description mặc định</Label>
                    <textarea 
                      className="w-full min-h-[80px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      defaultValue="VietAdmin cung cấp giải pháp quản trị website toàn diện cho doanh nghiệp Việt Nam"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Google Analytics ID</Label>
                    <Input placeholder="UA-XXXXXXXXX-X hoặc G-XXXXXXXXXX" />
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'social' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Liên kết mạng xã hội</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Facebook</Label>
                    <Input placeholder="https://facebook.com/..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Youtube</Label>
                    <Input placeholder="https://youtube.com/..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Zalo</Label>
                    <Input placeholder="https://zalo.me/..." />
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'email' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Cấu hình Email (SMTP)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>SMTP Host</Label>
                      <Input placeholder="smtp.gmail.com" />
                    </div>
                    <div className="space-y-2">
                      <Label>SMTP Port</Label>
                      <Input placeholder="587" />
                    </div>
                    <div className="space-y-2">
                      <Label>SMTP Username</Label>
                      <Input placeholder="your-email@gmail.com" />
                    </div>
                    <div className="space-y-2">
                      <Label>SMTP Password</Label>
                      <Input type="password" placeholder="********" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'payment' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Cổng thanh toán</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>VNPay - Terminal ID</Label>
                    <Input placeholder="Nhập Terminal ID" />
                  </div>
                  <div className="space-y-2">
                    <Label>VNPay - Secret Key</Label>
                    <Input type="password" placeholder="********" />
                  </div>
                  <div className="space-y-2">
                    <Label>Momo - Partner Code</Label>
                    <Input placeholder="Nhập Partner Code" />
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="mt-6 flex justify-end">
              <Button type="submit" variant="accent" className="gap-2">
                <Save size={16} />
                Lưu cài đặt
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
