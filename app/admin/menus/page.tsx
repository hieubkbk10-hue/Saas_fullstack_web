'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Menu } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Card, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui';
import { mockMenus } from '../mockData';

export default function MenusListPage() {
  const [menus, setMenus] = useState(mockMenus);

  const handleDelete = (id: string) => {
    if (confirm('Xóa menu này?')) {
      setMenus(prev => prev.filter(m => m.id !== id));
      toast.success('Đã xóa menu');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Quản lý Menu</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Tạo và chỉnh sửa menu điều hướng website</p>
        </div>
        <Link href="/admin/menus/create"><Button className="gap-2"><Plus size={16}/> Thêm menu</Button></Link>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên menu</TableHead>
              <TableHead>Vị trí</TableHead>
              <TableHead className="text-center">Số mục</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menus.map(menu => (
              <TableRow key={menu.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Menu size={16} className="text-slate-400" />
                    <span className="font-medium">{menu.name}</span>
                  </div>
                </TableCell>
                <TableCell><Badge variant="secondary">{menu.location}</Badge></TableCell>
                <TableCell className="text-center"><Badge variant="info">{menu.itemsCount}</Badge></TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/menus/${menu.id}/edit`}><Button variant="ghost" size="icon"><Edit size={16}/></Button></Link>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(menu.id)}><Trash2 size={16}/></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {menus.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-slate-500">Chưa có menu nào</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
