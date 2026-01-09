import AdminLayout from "@/layouts/AdminLayout";
import { db } from "@/services/db";
import type { User, Role } from "@/types";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const loadData = () => {
    setUsers(db.users.getAll());
    setRoles(db.roles.getAll());
  };

  useEffect(() => {
    loadData();
    const session = localStorage.getItem("tocas_cms_session");
    if (session) {
        setCurrentUser(JSON.parse(session));
    }
  }, []);

  const handleDelete = (id: string) => {
    if (confirm("確定要刪除此使用者嗎？")) {
      db.users.delete(id);
      loadData();
      toast.success("使用者已刪除");
    }
  };

  const handleRoleChange = (id: string, newRoleId: string) => {
      db.users.update(id, { roleId: newRoleId });
      loadData();
      toast.success("權限已更新");
  };

  if (currentUser?.roleId !== 'role_admin') {
      return (
          <AdminLayout>
              <div className="ts-notice is-negative">
                  <div className="title">權限不足</div>
                  <div className="content">只有系統管理員可以存取此頁面。</div>
              </div>
          </AdminLayout>
      )
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div className="ts-header is-big">使用者管理</div>
        <Link href="/admin/users/new" className="ts-button is-primary is-start-icon">
          <span className="ts-icon is-plus-icon"></span> 新增使用者
        </Link>
      </div>

      <div className="ts-box">
        <div className="ts-content is-fitted">
          <table className="ts-table is-striped is-full-width">
            <thead>
              <tr>
                <th>名稱</th>
                <th>Email</th>
                <th>角色 (權限)</th>
                <th>加入時間</th>
                <th className="is-end-aligned">操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="is-bold">
                      {user.name}
                      {currentUser?.id === user.id && <span className="ts-badge is-small is-info ml-2">You</span>}
                  </td>
                  <td className="font-mono text-sm">{user.email}</td>
                  <td>
                      <div className="ts-select is-small">
                          <select 
                            value={user.roleId} 
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            disabled={user.id === currentUser?.id} 
                          >
                              {roles.map(role => (
                                  <option key={role.id} value={role.id}>
                                      {role.name}
                                  </option>
                              ))}
                          </select>
                      </div>
                  </td>
                  <td className="ts-text is-small">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="is-end-aligned">
                    <div className="ts-buttons is-small is-dense">
                        <Link href={`/admin/users/edit/${user.id}`} className="ts-button is-secondary is-icon">
                            <span className="ts-icon is-pen-icon"></span>
                        </Link>
                        <button 
                            onClick={() => handleDelete(user.id)} 
                            className="ts-button is-negative is-icon is-outlined"
                            disabled={user.id === currentUser?.id}
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
