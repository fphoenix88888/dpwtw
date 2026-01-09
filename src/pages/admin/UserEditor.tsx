import AdminLayout from "@/layouts/AdminLayout";
import { db } from "@/services/db";
import type { User, Role } from "@/types";
import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type UserFormData = Omit<User, "id" | "createdAt"> & {
    password?: string; // Optional for edit
};

export default function UserEditor() {
  const [match, params] = useRoute("/admin/users/edit/:id");
  const [, setLocation] = useLocation();
  const isEdit = !!match;
  
  const [roles, setRoles] = useState<Role[]>([]);
  const { register, handleSubmit, reset, setValue } = useForm<UserFormData>({
      defaultValues: {
          roleId: 'role_user'
      }
  });

  useEffect(() => {
    // Load roles
    setRoles(db.roles.getAll());

    if (isEdit && params?.id) {
      const user = db.users.getAll().find(u => u.id === params.id);
      if (user) {
        // Don't populate password
        const { password, ...rest } = user;
        reset(rest as any);
      } else {
        toast.error("找不到使用者");
        setLocation("/admin/users");
      }
    }
  }, [isEdit, params, reset, setLocation]);

  const onSubmit = (data: UserFormData) => {
    try {
      // Check if email exists (skip if editing self and email unchanged)
      // For simplicity, just check duplicates on create
      if (!isEdit) {
          if (db.users.getByEmail(data.email)) {
              toast.error("此 Email 已被註冊");
              return;
          }
      }

      if (isEdit && params?.id) {
        // Only update password if provided
        const updates: Partial<User> = { ...data };
        if (!data.password) {
            delete updates.password;
        }
        db.users.update(params.id, updates);
        toast.success("使用者已更新");
      } else {
        if (!data.password) {
            toast.error("請設定密碼");
            return;
        }
        db.users.create(data as User); // Type cast as we know password exists
        toast.success("使用者已建立");
      }
      setLocation("/admin/users");
    } catch (e) {
      toast.error("儲存失敗");
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div className="ts-header is-big">
          {isEdit ? "編輯使用者" : "新增使用者"}
        </div>
      </div>

      <div className="ts-box">
        <div className="ts-content">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="ts-grid is-2-columns">
                <div className="column">
                    <div className="ts-field">
                        <label className="label">使用者名稱</label>
                        <div className="ts-input">
                            <input type="text" {...register("name", { required: true })} placeholder="姓名" />
                        </div>
                    </div>
                </div>
                <div className="column">
                    <div className="ts-field">
                        <label className="label">電子郵件</label>
                        <div className="ts-input">
                            <input type="email" {...register("email", { required: true })} placeholder="user@example.com" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="ts-grid is-2-columns">
                <div className="column">
                    <div className="ts-field">
                        <label className="label">角色權限</label>
                        <div className="ts-select is-fluid">
                            <select {...register("roleId", { required: true })}>
                                {roles.map(role => (
                                    <option key={role.id} value={role.id}>
                                        {role.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="column">
                    <div className="ts-field">
                        <label className="label">密碼 {isEdit && <span className="ts-text is-tiny is-secondary">(若不修改請留空)</span>}</label>
                        <div className="ts-input">
                            <input 
                                type="password" 
                                {...register("password")} 
                                placeholder={isEdit ? "********" : "設定密碼"} 
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="ts-divider"></div>

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setLocation("/admin/users")} className="ts-button is-secondary">取消</button>
              <button type="submit" className="ts-button is-primary">儲存</button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
