import AdminLayout from "@/layouts/AdminLayout";
import { db } from "@/services/db";
import type { Role, Permission } from "@/types";
import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const PERMISSIONS: { key: Permission; label: string }[] = [
  { key: 'view_dashboard', label: '檢視儀表板 (View Dashboard)' },
  { key: 'manage_articles', label: '管理文章 (Articles)' },
  { key: 'manage_categories', label: '管理分類 (Categories)' },
  { key: 'manage_pages', label: '管理頁面 (Pages)' },
  { key: 'manage_users', label: '管理使用者 (Users)' },
  { key: 'manage_roles', label: '管理角色權限 (Roles)' },
  { key: 'manage_settings', label: '管理網站設定 (Settings)' },
];

type RoleFormData = Omit<Role, "id">;

export default function RoleEditor() {
  const [match, params] = useRoute("/admin/roles/edit/:id");
  const [, setLocation] = useLocation();
  const isEdit = !!match;
  
  const { register, handleSubmit, reset, watch, setValue } = useForm<RoleFormData>({
    defaultValues: {
      name: '',
      description: '',
      permissions: []
    }
  });

  const selectedPermissions = watch("permissions");

  useEffect(() => {
    if (isEdit && params?.id) {
      const role = db.roles.getById(params.id);
      if (role) {
        reset(role);
      } else {
        toast.error("找不到角色");
        setLocation("/admin/roles");
      }
    }
  }, [isEdit, params, reset, setLocation]);

  const handlePermissionToggle = (perm: Permission) => {
      const current = selectedPermissions || [];
      if (current.includes(perm)) {
          setValue("permissions", current.filter(p => p !== perm));
      } else {
          setValue("permissions", [...current, perm]);
      }
  };

  const onSubmit = (data: RoleFormData) => {
    try {
      if (isEdit && params?.id) {
        if (params.id === 'role_admin') {
            // Force admin to always have all permissions? Or just warn.
            // For safety, let's ensure admin always has manage_roles.
            if (!data.permissions.includes('manage_roles')) {
                toast.error("系統管理員必須擁有「管理角色權限」");
                return;
            }
        }
        db.roles.update(params.id, data);
        toast.success("角色已更新");
      } else {
        db.roles.create(data);
        toast.success("角色已建立");
      }
      setLocation("/admin/roles");
    } catch (e) {
      toast.error("儲存失敗");
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div className="ts-header is-big">
          {isEdit ? "編輯角色" : "新增角色"}
        </div>
      </div>

      <div className="ts-box">
        <div className="ts-content">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="ts-field">
                <label className="label">角色名稱</label>
                <div className="ts-input">
                    <input 
                        type="text" 
                        {...register("name", { required: true })} 
                        placeholder="例如：內容編輯" 
                        disabled={isEdit && params?.id === 'role_admin'}
                    />
                </div>
            </div>

            <div className="ts-field">
                <label className="label">描述</label>
                <div className="ts-input">
                    <input type="text" {...register("description")} placeholder="角色的職責說明..." />
                </div>
            </div>

            <div className="ts-divider"></div>
            
            <div className="ts-header is-heavy is-big mb-4">權限設定</div>
            <div className="ts-grid is-2-columns is-relaxed">
                {PERMISSIONS.map((perm) => (
                    <div className="column" key={perm.key}>
                        <label className="ts-checkbox">
                            <input 
                                type="checkbox" 
                                checked={selectedPermissions?.includes(perm.key)}
                                onChange={() => handlePermissionToggle(perm.key)}
                                disabled={isEdit && params?.id === 'role_admin'} // Admin permissions locked for safety in this demo
                            />
                            <span className="label">{perm.label}</span>
                        </label>
                    </div>
                ))}
            </div>

            <div className="ts-divider"></div>

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setLocation("/admin/roles")} className="ts-button is-secondary">取消</button>
              <button type="submit" className="ts-button is-primary">儲存</button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
