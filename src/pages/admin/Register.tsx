import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import adminBg from "@/assets/admin_bg.jpg";
import { db } from "@/services/db";
import { toast } from "sonner";

export default function Register() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
      const settings = db.settings.get();
      if (!settings.enableRegistration) {
          toast.error("目前不開放註冊");
          setLocation("/admin/login");
      }
  }, [setLocation]);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      const existing = db.users.getByEmail(email);
      if (existing) {
          toast.error("此 Email 已被註冊");
          setLoading(false);
          return;
      }

      db.users.create({
          name,
          email,
          password,
          roleId: 'role_user' // Default role
      });
      
      toast.success("註冊成功，請登入");
      setLocation("/admin/login");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <div className="absolute inset-0 z-0">
        <img src={adminBg} className="w-full h-full object-cover" alt="Background" />
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
      </div>

      <div className="ts-box is-elevated relative z-10 w-full max-w-md mx-4 p-8 bg-white/95 backdrop-blur">
        <div className="ts-content is-center-aligned mb-6">
          <div className="ts-header is-huge">註冊帳號</div>
          <div className="ts-text is-secondary">建立您的 Tocas CMS 帳戶</div>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="ts-field">
            <label className="label">名稱</label>
            <div className="ts-input is-start-icon">
                <span className="ts-icon is-user-icon"></span>
                <input 
                    type="text" 
                    placeholder="您的名稱" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required 
                />
            </div>
          </div>

          <div className="ts-field">
            <label className="label">電子郵件</label>
            <div className="ts-input is-start-icon">
                <span className="ts-icon is-envelope-icon"></span>
                <input 
                    type="email" 
                    placeholder="example@email.com" 
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
            註冊
          </button>
        </form>

        <div className="ts-divider is-text">或是</div>

        <div className="ts-content is-center-aligned">
            <Link href="/admin/login" className="ts-text is-link">已有帳號？登入</Link>
        </div>
      </div>
    </div>
  );
}
