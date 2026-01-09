import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "@/types";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
      const session = localStorage.getItem("tocas_cms_session");
      if (!session) {
          setLocation("/admin/login");
      } else {
          setUser(JSON.parse(session));
      }
  }, [setLocation]);

  const handleLogout = () => {
      localStorage.removeItem("tocas_cms_session");
      setLocation("/admin/login");
  };

  if (!user) return null; // or loading spinner

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10 hidden md:flex">
        <div className="p-6 border-b border-gray-100">
          <div className="ts-header is-heavy">管理後台</div>
          <div className="ts-text is-small is-secondary mt-1">Hi, {user.name}</div>
        </div>
        <nav className="flex-grow p-4 space-y-2">
          <Link href="/admin/dashboard" className={`ts-button is-fluid is-start-aligned ${location === '/admin/dashboard' ? 'is-primary' : 'is-ghost'}`}>
            <span className="ts-icon fa-solid fa-chart-pie"></span> 儀表板
          </Link>
          <Link href="/admin/articles" className={`ts-button is-fluid is-start-aligned ${location.startsWith('/admin/articles') ? 'is-primary' : 'is-ghost'}`}>
            <span className="ts-icon fa-regular fa-newspaper"></span> 文章管理
          </Link>
          <Link href="/admin/categories" className={`ts-button is-fluid is-start-aligned ${location.startsWith('/admin/categories') ? 'is-primary' : 'is-ghost'}`}>
            <span className="ts-icon fa-solid fa-tags"></span> 分類管理
          </Link>
          <Link href="/admin/pages" className={`ts-button is-fluid is-start-aligned ${location.startsWith('/admin/pages') ? 'is-primary' : 'is-ghost'}`}>
            <span className="ts-icon fa-regular fa-file"></span> 頁面管理
          </Link>
          <Link href="/admin/events" className={`ts-button is-fluid is-start-aligned ${location.startsWith('/admin/events') ? 'is-primary' : 'is-ghost'}`}>
            <span className="ts-icon fa-regular fa-calendar"></span> 活動日曆
          </Link>
          {/* Access Control: Only admin/editor role for now */}
          {(user.roleId === 'role_admin' || user.roleId === 'role_editor') && (
            <Link href="/admin/media" className={`ts-button is-fluid is-start-aligned ${location.startsWith('/admin/media') ? 'is-primary' : 'is-ghost'}`}>
                <span className="ts-icon fa-regular fa-images"></span> 媒體庫
            </Link>
          )}
          
          {/* Access Control: Only admin role for now */}
          {(user.roleId === 'role_admin') && (
            <>
                <Link href="/admin/users" className={`ts-button is-fluid is-start-aligned ${location.startsWith('/admin/users') ? 'is-primary' : 'is-ghost'}`}>
                    <span className="ts-icon fa-solid fa-users"></span> 使用者管理
                </Link>
                <Link href="/admin/roles" className={`ts-button is-fluid is-start-aligned ${location.startsWith('/admin/roles') ? 'is-primary' : 'is-ghost'}`}>
                    <span className="ts-icon fa-solid fa-user-shield"></span> 角色權限
                </Link>
            </>
          )}

          <Link href="/admin/settings" className={`ts-button is-fluid is-start-aligned ${location.startsWith('/admin/settings') ? 'is-primary' : 'is-ghost'}`}>
            <span className="ts-icon fa-solid fa-gear"></span> 網站設定
          </Link>
          <Link href="/admin/system" className={`ts-button is-fluid is-start-aligned ${location.startsWith('/admin/system') ? 'is-primary' : 'is-ghost'}`}>
            <span className="ts-icon fa-solid fa-server"></span> 系統資訊
          </Link>
          
          <div className="ts-divider"></div>
          
          <Link href="/" className="ts-button is-fluid is-start-aligned is-ghost">
            <span className="ts-icon fa-solid fa-arrow-left"></span> 返回前台
          </Link>
          <button onClick={handleLogout} className="ts-button is-fluid is-start-aligned is-ghost is-negative">
            <span className="ts-icon fa-solid fa-right-from-bracket"></span> 登出
          </button>
        </nav>
        <div className="p-4 border-t border-gray-100">
           <div className="ts-text is-secondary is-small">Role ID: {user.roleId}</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
