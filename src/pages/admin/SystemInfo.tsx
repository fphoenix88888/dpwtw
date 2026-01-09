import AdminLayout from "@/layouts/AdminLayout";
import { useEffect, useState, useRef } from "react";
import { db } from "@/services/db";
import { toast } from "sonner";

export default function SystemInfo() {
  const [info, setInfo] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Collect system info
    const articles = db.articles.getAll();
    const pages = db.pages.getAll();
    const categories = db.categories.getAll();
    const users = db.users.getAll();
    const events = db.events.getAll();
    const settings = db.settings.get();

    const storageUsage = JSON.stringify(localStorage).length;
    const storageLimit = 5 * 1024 * 1024; // Approx 5MB for localStorage

    setInfo({
      appVersion: "1.0.0",
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width} x ${window.screen.height}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      dataStats: {
        articles: articles.length,
        pages: pages.length,
        categories: categories.length,
        users: users.length,
        events: events.length
      },
      storage: {
        used: (storageUsage / 1024).toFixed(2) + " KB",
        percent: ((storageUsage / storageLimit) * 100).toFixed(2) + "%"
      },
      settings: {
        siteName: settings.siteName,
        registration: settings.enableRegistration ? "Enabled" : "Disabled",
        maintenance: settings.maintenance.enabled ? "Active" : "Inactive"
      }
    });
  }, []);

  const performBackup = (prefix = "tocas-cms-backup") => {
      const backup: Record<string, any> = {};
      const keys = [
          "tocas_cms_articles",
          "tocas_cms_pages",
          "tocas_cms_categories",
          "tocas_cms_settings",
          "tocas_cms_users",
          "tocas_cms_roles",
          "tocas_cms_events",
          "tocas_cms_media"
      ];
      
      let count = 0;
      keys.forEach(key => {
          const data = localStorage.getItem(key);
          if (data) {
              backup[key] = JSON.parse(data);
              count++;
          }
      });

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${prefix}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return count;
  };

  const handleBackupClick = () => {
      const count = performBackup();
      toast.success(`已匯出 ${count} 個資料表`);
  };

  const handleRestoreClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Auto Backup before restore
      toast.info("正在建立還原前備份...");
      performBackup("auto-backup-before-restore");

      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const json = JSON.parse(event.target?.result as string);
              if (typeof json !== 'object') throw new Error("Invalid JSON");

              const keys = [
                "tocas_cms_articles",
                "tocas_cms_pages",
                "tocas_cms_categories",
                "tocas_cms_settings",
                "tocas_cms_users",
                "tocas_cms_roles",
                "tocas_cms_events",
                "tocas_cms_media"
              ];

              let count = 0;
              keys.forEach(key => {
                  if (json[key]) {
                      localStorage.setItem(key, JSON.stringify(json[key]));
                      count++;
                  }
              });

              if (count > 0) {
                  toast.success(`成功還原 ${count} 個資料表，頁面將重新整理`);
                  setTimeout(() => {
                      window.location.reload();
                  }, 1500);
              } else {
                  toast.warning("未找到可還原的資料");
              }

          } catch (err) {
              toast.error("還原失敗：檔案格式錯誤");
              console.error(err);
          }
          // Reset input
          if (fileInputRef.current) fileInputRef.current.value = "";
      };
      reader.readAsText(file);
  };

  const handleReset = () => {
      if (confirm("警告：此操作將清除所有網站資料（文章、設定、媒體等）並重置為初始狀態。\n\n確定要繼續嗎？")) {
          // Verify again
          if (confirm("請再次確認：所有資料將會遺失！")) {
              localStorage.clear();
              toast.success("系統已重置，頁面將重新整理");
              setTimeout(() => {
                  window.location.href = "/";
                  window.location.reload();
              }, 1000);
          }
      }
  };

  if (!info) return null;

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div className="ts-header is-big">系統資訊</div>
        <div className="flex gap-2">
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".json" 
                onChange={handleFileChange} 
            />
            <button className="ts-button is-start-icon is-secondary" onClick={handleBackupClick}>
                <span className="ts-icon fa-solid fa-download"></span> 備份資料
            </button>
            <button className="ts-button is-start-icon is-info is-outlined" onClick={handleRestoreClick}>
                <span className="ts-icon fa-solid fa-upload"></span> 還原資料
            </button>
            <button className="ts-button is-start-icon is-negative is-outlined" onClick={handleReset}>
                <span className="ts-icon fa-solid fa-rotate-right"></span> 重置系統
            </button>
        </div>
      </div>

      <div className="ts-grid is-2-columns is-relaxed is-stackable">
        
        {/* Data Statistics */}
        <div className="column">
          <div className="ts-box">
            <div className="ts-content is-dense">
              <div className="ts-header is-heavy">資料統計</div>
            </div>
            <div className="ts-divider"></div>
            <div className="ts-content">
              <div className="ts-list is-relaxed">
                <div className="item">
                  <div className="ts-icon fa-regular fa-newspaper mr-2"></div>
                  <div className="content">文章數量：{info.dataStats.articles}</div>
                </div>
                <div className="item">
                  <div className="ts-icon fa-regular fa-file mr-2"></div>
                  <div className="content">頁面數量：{info.dataStats.pages}</div>
                </div>
                <div className="item">
                  <div className="ts-icon fa-solid fa-tags mr-2"></div>
                  <div className="content">分類數量：{info.dataStats.categories}</div>
                </div>
                <div className="item">
                  <div className="ts-icon fa-solid fa-users mr-2"></div>
                  <div className="content">使用者數量：{info.dataStats.users}</div>
                </div>
                <div className="item">
                  <div className="ts-icon fa-regular fa-calendar mr-2"></div>
                  <div className="content">活動數量：{info.dataStats.events}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Environment */}
        <div className="column">
          <div className="ts-box">
            <div className="ts-content is-dense">
              <div className="ts-header is-heavy">環境資訊</div>
            </div>
            <div className="ts-divider"></div>
            <div className="ts-content">
              <table className="ts-table is-basic is-dense">
                <tbody>
                  <tr>
                    <td className="is-secondary">CMS 版本</td>
                    <td>{info.appVersion}</td>
                  </tr>
                  <tr>
                    <td className="is-secondary">瀏覽器</td>
                    <td className="is-truncated" title={info.userAgent} style={{maxWidth: '200px'}}>
                        {info.userAgent.substring(0, 30)}...
                    </td>
                  </tr>
                  <tr>
                    <td className="is-secondary">解析度</td>
                    <td>{info.screenResolution}</td>
                  </tr>
                  <tr>
                    <td className="is-secondary">語系</td>
                    <td>{info.language}</td>
                  </tr>
                  <tr>
                    <td className="is-secondary">時區</td>
                    <td>{info.timezone}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Storage Usage */}
        <div className="column">
          <div className="ts-box">
            <div className="ts-content is-dense">
              <div className="ts-header is-heavy">儲存空間 (LocalStorage)</div>
            </div>
            <div className="ts-divider"></div>
            <div className="ts-content is-center-aligned">
                <div className="ts-header is-huge mb-2">{info.storage.percent}</div>
                <div className="ts-text is-secondary">已使用 {info.storage.used}</div>
                <div className="ts-progress is-small mt-4">
                    <div className="bar" style={{width: info.storage.percent}}></div>
                </div>
            </div>
          </div>
        </div>

        {/* Configuration Status */}
        <div className="column">
          <div className="ts-box">
            <div className="ts-content is-dense">
              <div className="ts-header is-heavy">設定狀態</div>
            </div>
            <div className="ts-divider"></div>
            <div className="ts-content">
               <div className="ts-list is-relaxed">
                <div className="item">
                  <div className="header">網站名稱</div>
                  <div className="description">{info.settings.siteName}</div>
                </div>
                <div className="item">
                  <div className="header">註冊功能</div>
                  <div className="description">
                      {info.settings.registration === "Enabled" ? 
                        <span className="ts-text is-positive">開啟</span> : 
                        <span className="ts-text is-negative">關閉</span>
                      }
                  </div>
                </div>
                <div className="item">
                  <div className="header">維護模式</div>
                  <div className="description">
                      {info.settings.maintenance === "Active" ? 
                        <span className="ts-text is-warning">維護中</span> : 
                        <span className="ts-text is-positive">正常運作</span>
                      }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
