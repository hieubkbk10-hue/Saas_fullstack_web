'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { cn, Button, Card, CardHeader, CardTitle, CardContent, Input, Label, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui';
import { mockCustomers, mockOrders } from '../../../mockData';

export default function CustomerEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const customer = mockCustomers.find(c => c.id === id);
  const customerOrders = mockOrders.filter(o => o.customerId === id);
  const [activeTab, setActiveTab] = useState('profile');

  if (!customer) {
    return <div className="text-center py-8 text-slate-500">Không tìm thấy khách hàng</div>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Đã lưu thông tin khách hàng");
    router.push('/admin/customers');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Thông tin khách hàng</h1>
          <Link href="/admin/customers" className="text-sm text-blue-600 hover:underline">Quay lại danh sách</Link>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Profile Card */}
        <div className="w-full md:w-1/3 space-y-6">
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 mb-4 overflow-hidden">
                {customer.avatar ? <img src={customer.avatar} className="w-full h-full object-cover" alt="" /> : <UserIcon className="w-full h-full p-6 text-slate-300"/>}
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{customer.name}</h3>
              <p className="text-slate-500 text-sm mb-4">{customer.email}</p>
              
              <div className="grid grid-cols-2 gap-4 w-full border-t border-slate-100 dark:border-slate-800 pt-4">
                <div>
                  <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{customer.ordersCount}</div>
                  <div className="text-xs text-slate-500">Đơn hàng</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{new Intl.NumberFormat('vi-VN', {notation: "compact"}).format(customer.totalSpent)}</div>
                  <div className="text-xs text-slate-500">Chi tiêu</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Ghi chú</CardTitle></CardHeader>
            <CardContent>
              <textarea className="w-full h-32 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" defaultValue={customer.notes}></textarea>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6">
            <button onClick={() => setActiveTab('profile')} className={cn("px-6 py-3 text-sm font-medium border-b-2 transition-colors", activeTab === 'profile' ? "border-blue-500 text-blue-600" : "border-transparent text-slate-500")}>Hồ sơ & Địa chỉ</button>
            <button onClick={() => setActiveTab('orders')} className={cn("px-6 py-3 text-sm font-medium border-b-2 transition-colors", activeTab === 'orders' ? "border-blue-500 text-blue-600" : "border-transparent text-slate-500")}>Lịch sử mua hàng</button>
          </div>

          {activeTab === 'profile' && (
            <Card>
              <form onSubmit={handleSubmit}>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Họ và tên</Label>
                      <Input defaultValue={customer.name} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Số điện thoại</Label>
                      <Input defaultValue={customer.phone} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" defaultValue={customer.email} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Địa chỉ</Label>
                    <Input defaultValue={customer.address} placeholder="Số nhà, tên đường..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Thành phố / Tỉnh</Label>
                      <select className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" defaultValue={customer.city}>
                        <option>Hà Nội</option>
                        <option>Hồ Chí Minh</option>
                        <option>Đà Nẵng</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Trạng thái</Label>
                      <select className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" defaultValue={customer.status}>
                        <option value="Active">Hoạt động</option>
                        <option value="Inactive">Bị khóa</option>
                      </select>
                    </div>
                  </div>
                  <div className="pt-4 flex justify-end">
                    <Button type="submit" variant="accent">Lưu thay đổi</Button>
                  </div>
                </CardContent>
              </form>
            </Card>
          )}

          {activeTab === 'orders' && (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã đơn</TableHead>
                    <TableHead>Ngày đặt</TableHead>
                    <TableHead>Tổng tiền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerOrders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium text-blue-600 cursor-pointer hover:underline">{order.id}</TableCell>
                      <TableCell className="text-slate-500 text-xs">{new Date(order.date).toLocaleDateString('vi-VN')}</TableCell>
                      <TableCell>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total)}</TableCell>
                      <TableCell>
                        <Badge variant={order.status === 'Completed' ? 'success' : order.status === 'Cancelled' ? 'destructive' : 'warning'}>
                          {order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {customerOrders.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center py-6 text-slate-500">Chưa có đơn hàng nào.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
