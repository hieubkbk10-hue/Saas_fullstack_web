'use client';

import React, { useState, useMemo, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Card, CardContent, Input, Label } from '../../../components/ui';
import { ImageUploader } from '../../../components/ImageUploader';

const MODULE_KEY = 'users';

export default function UserEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const userData = useQuery(api.users.getById, { id: id as Id<"users"> });
  const rolesData = useQuery(api.roles.listAll);
  const fieldsData = useQuery(api.admin.modules.listEnabledModuleFields, { moduleKey: MODULE_KEY });
  const updateUser = useMutation(api.users.update);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState<string | undefined>();
  const [roleId, setRoleId] = useState<Id<"roles"> | ''>('');
  const [status, setStatus] = useState<'Active' | 'Inactive' | 'Banned'>('Active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoading = userData === undefined || rolesData === undefined || fieldsData === undefined;

  const enabledFields = useMemo(() => {
    const fields = new Set<string>();
    fieldsData?.forEach(f => fields.add(f.fieldKey));
    return fields;
  }, [fieldsData]);

  useEffect(() => {
    if (userData) {
      setName(userData.name);
      setEmail(userData.email);
      setPhone(userData.phone || '');
      setAvatar(userData.avatar);
      setRoleId(userData.roleId);
      setStatus(userData.status);
    }
  }, [userData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleId) {
      toast.error('Vui lòng chọn vai trò');
      return;
    }
    setIsSubmitting(true);
    try {
      await updateUser({
        id: id as Id<"users">,
        name,
        email,
        phone: enabledFields.has('phone') && phone ? phone : undefined,
        avatar: enabledFields.has('avatar') ? avatar : undefined,
        roleId: roleId as Id<"roles">,
        status,
      });
      toast.success('Đã cập nhật người dùng');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-slate-400" />
      </div>
    );
  }

  if (!userData) {
    return <div className="text-center py-8 text-slate-500">Không tìm thấy người dùng</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Chỉnh sửa User</h1>
        <Link href="/admin/users" className="text-sm text-blue-600 hover:underline">Quay lại danh sách</Link>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Họ tên <span className="text-red-500">*</span></Label>
                <Input 
                  required 
                  placeholder="Nhập họ tên..." 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Email <span className="text-red-500">*</span></Label>
                <Input 
                  type="email" 
                  required 
                  placeholder="Nhập email..." 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {enabledFields.has('phone') && (
              <div className="space-y-2">
                <Label>Số điện thoại</Label>
                <Input 
                  placeholder="Nhập số điện thoại..." 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            )}

            {enabledFields.has('avatar') && (
              <div className="space-y-2">
                <Label>Ảnh đại diện</Label>
                <ImageUploader
                  value={avatar}
                  onChange={(url) => setAvatar(url)}
                  folder="users"
                  aspectRatio="square"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Vai trò <span className="text-red-500">*</span></Label>
                <select 
                  className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value as Id<"roles">)}
                  required
                >
                  <option value="">Chọn vai trò...</option>
                  {rolesData?.map(role => (
                    <option key={role._id} value={role._id}>{role.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <select 
                  className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive' | 'Banned')}
                >
                  <option value="Active">Hoạt động</option>
                  <option value="Inactive">Không hoạt động</option>
                  <option value="Banned">Bị cấm</option>
                </select>
              </div>
            </div>

            {enabledFields.has('lastLogin') && userData.lastLogin && (
              <div className="text-sm text-slate-500">
                Đăng nhập lần cuối: {new Date(userData.lastLogin).toLocaleString('vi-VN')}
              </div>
            )}
          </CardContent>
          
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 rounded-b-lg flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => router.push('/admin/users')}>Hủy bỏ</Button>
            <Button type="submit" variant="accent" disabled={isSubmitting}>
              {isSubmitting && <Loader2 size={16} className="animate-spin mr-2" />}
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
