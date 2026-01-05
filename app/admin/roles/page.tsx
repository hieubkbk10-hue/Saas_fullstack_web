'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Card, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui';
import { mockRoles } from '../mockData';

export default function RolesListPage() {
  const [roles, setRoles] = useState(mockRoles);

  const handleDelete = (id: string) => {
    const role = roles.find(r => r.id === id);
    if (role?.isSystem) {
      toast.error('Không thể xóa vai trò hệ thống');
      return;
    }
    if (confirm('Xóa vai trò này?')) {
      setRoles(prev => prev.filter(r => r.id !== id));
      toast.success('Đã xóa vai trò');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Phân quyền</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Quản lý vai trò và quyền hạn trong hệ thống</p>
        </div>
        <Link href="/admin/roles/create"><Button className="gap-2"><Plus size={16}/> Thêm vai trò</Button></Link>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vai trò</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead className="text-center">Số người dùng</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map(role => (
              <TableRow key={role.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Shield size={16} className="text-blue-500" />
                    <span className="font-medium">{role.name}</span>
                    {role.isSystem && <Badge variant="secondary">Hệ thống</Badge>}
                  </div>
                </TableCell>
                <TableCell className="text-slate-500 max-w-[300px]">{role.description}</TableCell>
                <TableCell className="text-center"><Badge variant="secondary">{role.usersCount}</Badge></TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/roles/${role.id}/edit`}><Button variant="ghost" size="icon"><Edit size={16}/></Button></Link>
                    {!role.isSystem && (
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(role.id)}><Trash2 size={16}/></Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
