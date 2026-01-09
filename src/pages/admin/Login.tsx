import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import adminBg from "@/assets/admin_bg.jpg";
import { db } from "@/services/db";
import { toast } from "sonner";

export default function Login() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("password");
  const [canRegister, setCanRegister] = useState(false);

  useEffect(() => {
      const settings = db.settings.get();
      setCanRegister(settings.enableRegistration);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      const user = db.users.getByEmail(email);
      
      if (user && user.password === password) {
          // Mock Session
          localStorage.setItem("tocas_cms_session", JSON.stringify(user));
          toast.success(`歡迎回來，${user.name}`);
          setLocation("/admin/dashboard");
      } else {
          toast.error("帳號或密碼錯誤");
          setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <div className="absolute inset-0 z-0">
        <img src={adminBg} className="w-full h-full object-cover" alt="Background" />
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
      </div>

      <div className="ts-box is-elevated relative z-10 w-full max-w-md mx-4 p-8 bg-white/95 backdrop-blur">
        <div className="ts-content is-center-aligned mb-6">
          <div className="ts-header is-huge">管理員登入</div>
          <div className="ts-text is-secondary">請輸入您的帳號密碼以進入後台</div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="ts-field">
            <label className="label">電子郵件</label>
            <div className="ts-input is-start-icon">
                <span className="ts-icon is-envelope-icon"></span>
                <input 
                    type="email" 
                    placeholder="admin@example.com" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required 
                />
            </div>
          </div>
          
          <div className="ts-field">
            <label className="label">密碼</label>
             <div className="ts-input is-start-icon">
                <span className="ts-icon is-lock-icon"></span>
                <input 
                    type="password" 
                    placeholder="********" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required 
                />
            </div>
          </div>

          <button className={`ts-button is-fluid is-primary ${loading ? 'is-loading' : ''}`}>
            登入
          </button>
        </form>

        {canRegister && (
            <div className="mt-4 text-center">
                <Link href="/admin/register" className="ts-text is-link is-small">註冊新帳號</Link>
            </div>
        )}

        <div className="ts-divider is-text">或是</div>

        <div className="ts-content is-center-aligned">
            <Link href="/" className="ts-text is-link">返回首頁</Link>
        </div>
      </div>
    </div>
  );
}
