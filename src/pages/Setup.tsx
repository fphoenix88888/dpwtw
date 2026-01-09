import { useState } from "react";
import { useLocation } from "wouter";
import { db } from "@/services/db";
import { toast } from "sonner";

export default function Setup() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [siteName, setSiteName] = useState("My New Tocas Site");
  const [adminName, setAdminName] = useState("Admin");
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("");

  const handleFinish = () => {
      // 1. Create Admin User
      // Clear existing users first? Or just add. Seed has one, let's overwrite or clear.
      // For a real setup, we might want to start fresh.
      // But db.users.create adds to list.
      // Let's check if email exists, if so update, else create.
      
      const existing = db.users.getByEmail(email);
      if (existing) {
          db.users.update(existing.id, { name: adminName, password, roleId: 'role_admin' });
      } else {
          db.users.create({
              name: adminName,
              email,
              password,
              roleId: 'role_admin'
          });
      }

      // 2. Update Settings
      db.settings.update({
          siteName,
          isSetup: true,
          maintenance: {
              enabled: true, // Keep closed as requested
              reason: "網站建置中，敬請期待。"
          }
      });

      // 3. Login User (Mock Session)
      // Find the user again to get ID
      const user = db.users.getByEmail(email);
      if (user) {
          localStorage.setItem("tocas_cms_session", JSON.stringify(user));
      }

      toast.success("安裝完成！網站目前處於維護模式。");
      window.dispatchEvent(new Event('tocas-settings-updated'));
      setLocation("/admin/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="ts-box is-elevated w-full max-w-lg p-8">
        <div className="ts-content is-center-aligned mb-8">
            <h1 className="ts-header is-huge mb-2">Tocas CMS 安裝導引</h1>
            <div className="ts-text is-secondary">歡迎使用，只需幾步即可完成設定。</div>
        </div>

        {step === 1 && (
            <div className="space-y-6">
                <div className="ts-header is-big">步驟 1/2：網站資訊</div>
                <div className="ts-field">
                    <label className="label">網站名稱</label>
                    <div className="ts-input">
                        <input type="text" value={siteName} onChange={e => setSiteName(e.target.value)} />
                    </div>
                </div>
                <button className="ts-button is-primary is-fluid" onClick={() => setStep(2)}>下一步</button>
            </div>
        )}

        {step === 2 && (
            <div className="space-y-6">
                <div className="ts-header is-big">步驟 2/2：管理員帳號</div>
                <div className="ts-field">
                    <label className="label">管理員名稱</label>
                    <div className="ts-input">
                        <input type="text" value={adminName} onChange={e => setAdminName(e.target.value)} />
                    </div>
                </div>
                <div className="ts-field">
                    <label className="label">電子郵件</label>
                    <div className="ts-input">
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                </div>
                <div className="ts-field">
                    <label className="label">密碼</label>
                    <div className="ts-input">
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="ts-button is-secondary" onClick={() => setStep(1)}>上一步</button>
                    <button className="ts-button is-primary is-fluid" onClick={handleFinish} disabled={!password}>
                        完成安裝
                    </button>
                </div>
            </div>
        )}
        
        <div className="ts-divider is-section"></div>
        <div className="ts-text is-center-aligned is-small is-secondary">
            Powered by Tocas CMS
        </div>
      </div>
    </div>
  );
}
