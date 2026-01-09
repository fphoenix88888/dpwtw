import AdminLayout from "@/layouts/AdminLayout";
import { db } from "@/services/db";
import type { Role, User } from "@/types";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function RoleList() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const loadRoles = () => {
    setRoles(db.roles.getAll());
  };

  useEffect(() => {
    loadRoles();
    const session = localStorage.getItem("tocas_cms_session");
    if (session) {
        setCurrentUser(JSON.parse(session));
    }
  }, []);

  const handleDelete = (id: string) => {
    if (id === 'role_admin') {
        toast.error("無法刪除系統管理員角色");
        return;
    }
    if (confirm("確定要刪除此角色嗎？")) {
      db.roles.delete(id);
      loadRoles();
      toast.success("角色已刪除");
    }
  };

  // Simple permission check (can be extracted to hook)
  const canManageRoles = currentUser?.roleId === 'role_admin'; // Or check permissions array

  if (!canManageRoles) {
      return (
          <AdminLayout>
              <div className="ts-notice is-negative">
                  <div className="title">權限不足</div>
                  <div className="content">只有系統管理員可以管理角色。</div>
              </div>
          </AdminLayout>
      )
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div className="ts-header is-big">角色與權限管理</div>
        <Link href="/admin/roles/new" className="ts-button is-primary is-start-icon">
          <span className="ts-icon fa-solid fa-plus"></span> 新增角色
        </Link>
      </div>

      <div className="ts-box">
        <div className="ts-content is-fitted">
          <table className="ts-table is-striped is-full-width">
            <thead>
              <tr>
                <th>角色名稱</th>
                <th>描述</th>
                <th>權限數量</th>
                <th className="is-end-aligned">操作</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id}>
                  <td className="is-bold">
                      {role.name}
                      {role.id === 'role_admin' && <span className="ts-badge is-small is-negative ml-2">系統</span>}
                  </td>
                  <td className="ts-text is-secondary">{role.description || '-'}</td>
                  <td>
                      <span className="ts-badge is-small is-outlined">
                          {role.permissions.length} 個權限
                      </span>
                  </td>
                  <td className="is-end-aligned">
                    <div className="ts-buttons is-small is-dense">
                        <Link href={`/admin/roles/edit/${role.id}`} className="ts-button is-secondary is-icon">
                            <span className="ts-icon fa-solid fa-pen"></span>
                        </Link>
                        <button 
                            onClick={() => handleDelete(role.id)} 
                            className="ts-button is-negative is-icon is-outlined"
                            disabled={role.id === 'role_admin'}
                        >
                            <span className="ts-icon fa-solid fa-trash"></span>
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
