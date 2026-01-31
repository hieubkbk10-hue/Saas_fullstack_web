'use client';

import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle, Loader2, Lock, Mail, Save, Shield, User } from 'lucide-react';

export default function AdminConfigPage() {
  const superAdmin = useQuery(api.auth.getSuperAdmin);
  const createSuperAdmin = useMutation(api.auth.createSuperAdmin);
  const updateSuperAdmin = useMutation(api.auth.updateSuperAdminCredentials);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasSuperAdmin = superAdmin !== undefined && superAdmin !== null;

  useEffect(() => {
    if (superAdmin) {
      setEmail(superAdmin.email);
      setName(superAdmin.name);
    }
  }, [superAdmin]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    if (password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createSuperAdmin({ email, name: name || undefined, password });
      if (result.success) {
        toast.success(result.message);
        setPassword('');
        setConfirmPassword('');
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password && password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    if (password && password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateSuperAdmin({
        email: email !== superAdmin?.email ? email : undefined,
        name: name !== superAdmin?.name ? name : undefined,
        password: password || undefined,
      });
      if (result.success) {
        toast.success(result.message);
        setPassword('');
        setConfirmPassword('');
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (superAdmin === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-red-500/10 rounded-xl">
          <Shield className="w-6 h-6 text-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Cấu hình SuperAdmin
          </h1>
          <p className="text-sm text-slate-500">
            Tài khoản quản trị cao nhất cho /admin
          </p>
        </div>
      </div>

      {/* Status Card */}
      <div className={`p-4 rounded-xl border ${hasSuperAdmin ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-amber-500/5 border-amber-500/20'}`}>
        <div className="flex items-center gap-3">
          {hasSuperAdmin ? (
            <>
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="font-medium text-emerald-600 dark:text-emerald-400">SuperAdmin đã được cấu hình</p>
                <p className="text-sm text-slate-500">Tài khoản: {superAdmin.email}</p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <div>
                <p className="font-medium text-amber-600 dark:text-amber-400">Chưa có SuperAdmin</p>
                <p className="text-sm text-slate-500">Vui lòng tạo tài khoản SuperAdmin để sử dụng /admin</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={hasSuperAdmin ? handleUpdate : handleCreate} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Tên hiển thị
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) =>{  setName(e.target.value); }}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-800 dark:text-white placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none transition-colors"
            placeholder="Super Admin"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            <Mail className="w-4 h-4 inline mr-2" />
            Email đăng nhập <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) =>{  setEmail(e.target.value); }}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-800 dark:text-white placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none transition-colors"
            placeholder="admin@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            <Lock className="w-4 h-4 inline mr-2" />
            {hasSuperAdmin ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu'} {!hasSuperAdmin && <span className="text-red-500">*</span>}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) =>{  setPassword(e.target.value); }}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-800 dark:text-white placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none transition-colors"
            placeholder={hasSuperAdmin ? '••••••••' : 'Nhập mật khẩu'}
            required={!hasSuperAdmin}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            <Lock className="w-4 h-4 inline mr-2" />
            Xác nhận mật khẩu {!hasSuperAdmin && <span className="text-red-500">*</span>}
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) =>{  setConfirmPassword(e.target.value); }}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-800 dark:text-white placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none transition-colors"
            placeholder="Nhập lại mật khẩu"
            required={!hasSuperAdmin || Boolean(password)}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              {hasSuperAdmin ? 'Cập nhật' : 'Tạo SuperAdmin'}
            </>
          )}
        </button>
      </form>

      {/* Info */}
      <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-sm text-slate-600 dark:text-slate-400">
        <p className="font-medium mb-2">Lưu ý:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>SuperAdmin có toàn quyền trong /admin và không thể bị xóa</li>
          <li>Mỗi hệ thống chỉ có 1 SuperAdmin duy nhất</li>
          <li>SuperAdmin có thể tạo thêm users với quyền hạn khác nhau qua RBAC</li>
        </ul>
      </div>
    </div>
  );
}
