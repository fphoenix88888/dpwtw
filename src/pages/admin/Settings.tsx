import AdminLayout from "@/layouts/AdminLayout";
import { db } from "@/services/db";
import type { SiteSettings } from "@/types";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function Settings() {
  const { register, handleSubmit, reset, setValue, watch } = useForm<SiteSettings>();
  const logoUrl = watch("logoUrl");
  const faviconUrl = watch("faviconUrl");
  const maintenanceEnabled = watch("maintenance.enabled");

  useEffect(() => {
    const settings = db.settings.get();
    reset(settings);
  }, [reset]);

  const onSubmit = (data: SiteSettings) => {
    try {
      db.settings.update(data);
      window.dispatchEvent(new Event('tocas-settings-updated'));
      toast.success("網站設定已更新");
    } catch (e) {
      toast.error("儲存失敗");
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        if (file.size > 500 * 1024) {
            toast.error("圖片過大，請使用 500KB 以下的圖片");
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setValue("logoUrl", reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        if (file.size > 100 * 1024) {
            toast.error("Favicon 過大，請使用 100KB 以下的圖片 (.ico, .png)");
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setValue("faviconUrl", reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div className="ts-header is-big">網站設定</div>
      </div>

      <div className="ts-box">
        <div className="ts-content">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* General Settings */}
            <div className="ts-header is-heavy is-big">基本設定</div>
            <div className="ts-grid is-2-columns is-relaxed">
                <div className="column">
                    <div className="ts-field">
                        <label className="label">網站名稱</label>
                        <div className="ts-input">
                            <input type="text" {...register("siteName", { required: true })} placeholder="我的網站" />
                        </div>
                        <div className="ts-text is-small is-secondary mt-1">顯示於導覽列與網頁標題</div>
                    </div>
                </div>
                <div className="column">
                    <div className="ts-field">
                        <label className="label">網站主題</label>
                        <div className="ts-select is-fluid">
                            <select {...register("themeMode")}>
                                <option value="auto">跟隨系統 (Auto)</option>
                                <option value="light">明亮 (Light)</option>
                                <option value="dark">深色 (Dark)</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="column">
                    <div className="ts-field">
                        <label className="label">每頁文章數量</label>
                        <div className="ts-input">
                            <input type="number" {...register("postsPerPage", { valueAsNumber: true })} placeholder="10" />
                        </div>
                    </div>
                </div>
                <div className="column">
                    <div className="ts-field">
                        <label className="label">開放使用者註冊</label>
                        <label className="ts-switch">
                            <input type="checkbox" {...register("enableRegistration")} />
                            <span className="label">啟用註冊功能</span>
                        </label>
                    </div>
                </div>
            </div>

            <div className="ts-grid is-2-columns is-relaxed">
                <div className="column">
                    <div className="ts-field">
                        <label className="label">網站 Logo</label>
                        <div className="flex items-center gap-4">
                            {logoUrl && (
                                <div className="ts-image is-rounded is-small w-16 h-16 border bg-gray-50 flex items-center justify-center">
                                    <img src={logoUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                                </div>
                            )}
                            <div className="ts-file">
                                <input type="file" accept="image/*" onChange={handleLogoChange} />
                            </div>
                            {logoUrl && (
                                <button type="button" className="ts-button is-small is-negative is-outlined" onClick={() => setValue("logoUrl", "")}>
                                    移除
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                <div className="column">
                    <div className="ts-field">
                        <label className="label">網站 Favicon</label>
                        <div className="flex items-center gap-4">
                            {faviconUrl && (
                                <div className="ts-image is-rounded is-small w-10 h-10 border bg-gray-50 flex items-center justify-center">
                                    <img src={faviconUrl} alt="Favicon Preview" className="max-w-full max-h-full object-contain" />
                                </div>
                            )}
                            <div className="ts-file">
                                <input type="file" accept=".ico,.png,image/*" onChange={handleFaviconChange} />
                            </div>
                            {faviconUrl && (
                                <button type="button" className="ts-button is-small is-negative is-outlined" onClick={() => setValue("faviconUrl", "")}>
                                    移除
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="ts-divider is-section"></div>

            {/* Maintenance Mode */}
            <div className="ts-header is-heavy is-big">維護模式</div>
            <div className="ts-segment is-secondary">
                <div className="ts-field mb-4">
                    <label className="ts-switch">
                        <input type="checkbox" {...register("maintenance.enabled")} />
                        <span className="label">開啟維護模式 (前台將無法訪問)</span>
                    </label>
                </div>
                
                <div className={`space-y-4 ${!maintenanceEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="ts-field">
                        <label className="label">維護原因</label>
                        <div className="ts-input">
                            <input type="text" {...register("maintenance.reason")} placeholder="網站進行例行性維護，請稍後再試。" />
                        </div>
                    </div>
                    <div className="ts-grid is-2-columns">
                        <div className="column">
                            <div className="ts-field">
                                <label className="label">開始時間 (選填)</label>
                                <div className="ts-input">
                                    <input type="datetime-local" {...register("maintenance.startTime")} />
                                </div>
                            </div>
                        </div>
                        <div className="column">
                            <div className="ts-field">
                                <label className="label">結束時間 (選填)</label>
                                <div className="ts-input">
                                    <input type="datetime-local" {...register("maintenance.endTime")} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="ts-divider is-section"></div>

            {/* Hero Section Settings */}
            <div className="ts-header is-heavy is-big">首頁 Hero 區塊</div>
            <div className="ts-grid is-2-columns is-relaxed">
                <div className="column">
                    <div className="ts-field">
                        <label className="label">主標題</label>
                        <div className="ts-input">
                            <input type="text" {...register("heroTitle")} placeholder="歡迎來到..." />
                        </div>
                    </div>
                </div>
                <div className="column">
                    <div className="ts-field">
                        <label className="label">副標題 (描述)</label>
                        <div className="ts-input">
                            <input type="text" {...register("heroDescription")} placeholder="探索最新的..." />
                        </div>
                    </div>
                </div>
            </div>

            <div className="ts-divider is-section"></div>

            {/* Footer Settings */}
            <div className="ts-header is-heavy is-big">頁尾設定</div>
            <div className="ts-grid is-2-columns is-relaxed">
                <div className="column">
                    <div className="ts-field">
                        <label className="label">頁尾背景顏色</label>
                        <div className="ts-input">
                            <input type="color" className="h-10 w-full p-1 cursor-pointer" {...register("footerBackgroundColor")} />
                        </div>
                        <div className="ts-text is-small is-secondary mt-1">預設為淺灰色 (#f7f7f7)</div>
                    </div>
                </div>
                <div className="column">
                    <div className="ts-field">
                        <label className="label">頁尾文字顏色</label>
                        <div className="ts-input">
                            <input type="color" className="h-10 w-full p-1 cursor-pointer" {...register("footerTextColor")} />
                        </div>
                        <div className="ts-text is-small is-secondary mt-1">建議使用深灰色以保持對比度</div>
                    </div>
                </div>
            </div>

            <div className="ts-field mt-4">
              <label className="label">頁尾版權文字</label>
              <div className="ts-input">
                <input type="text" {...register("footerText", { required: true })} placeholder="© 2026 Copyright..." />
              </div>
            </div>

            <div className="ts-field">
              <label className="label">頁尾關於我們 (簡介)</label>
              <div className="ts-input">
                <textarea rows={3} {...register("footerDescription")} placeholder="簡短的公司或網站介紹..." />
              </div>
              <div className="ts-text is-small is-secondary mt-1">顯示於頁尾左側的簡介區塊</div>
            </div>

            <div className="ts-divider is-section"></div>
            
            {/* Contact Info */}
            <div className="ts-header is-heavy is-big mb-4">聯絡資訊</div>
            <div className="ts-grid is-3-columns is-relaxed">
                <div className="column">
                    <div className="ts-field">
                        <label className="label">公司地址</label>
                        <div className="ts-input is-start-icon">
                            <span className="ts-icon fa-solid fa-location-dot"></span>
                            <input type="text" {...register("contactInfo.address")} placeholder="台北市..." />
                        </div>
                    </div>
                </div>
                <div className="column">
                    <div className="ts-field">
                        <label className="label">聯絡電話</label>
                        <div className="ts-input is-start-icon">
                            <span className="ts-icon fa-solid fa-phone"></span>
                            <input type="text" {...register("contactInfo.phone")} placeholder="+886..." />
                        </div>
                    </div>
                </div>
                <div className="column">
                    <div className="ts-field">
                        <label className="label">電子郵件</label>
                        <div className="ts-input is-start-icon">
                            <span className="ts-icon fa-solid fa-envelope"></span>
                            <input type="email" {...register("contactInfo.email")} placeholder="contact@..." />
                        </div>
                    </div>
                </div>
            </div>

            <div className="ts-divider is-section"></div>
            
            {/* Social Links */}
            <div className="ts-header is-heavy is-big mb-4">社群媒體連結</div>
            <div className="ts-grid is-2-columns is-relaxed">
                <div className="column">
                    <div className="ts-field">
                        <label className="label">Facebook URL</label>
                        <div className="ts-input is-start-icon">
                            <span className="ts-icon fa-brands fa-facebook"></span>
                            <input type="url" {...register("socialLinks.facebook")} placeholder="https://facebook.com/..." />
                        </div>
                    </div>
                </div>
                <div className="column">
                    <div className="ts-field">
                        <label className="label">Twitter / X URL</label>
                        <div className="ts-input is-start-icon">
                            <span className="ts-icon fa-brands fa-twitter"></span>
                            <input type="url" {...register("socialLinks.twitter")} placeholder="https://twitter.com/..." />
                        </div>
                    </div>
                </div>
                <div className="column">
                    <div className="ts-field">
                        <label className="label">Instagram URL</label>
                        <div className="ts-input is-start-icon">
                            <span className="ts-icon fa-brands fa-instagram"></span>
                            <input type="url" {...register("socialLinks.instagram")} placeholder="https://instagram.com/..." />
                        </div>
                    </div>
                </div>
                <div className="column">
                    <div className="ts-field">
                        <label className="label">GitHub URL</label>
                        <div className="ts-input is-start-icon">
                            <span className="ts-icon fa-brands fa-github"></span>
                            <input type="url" {...register("socialLinks.github")} placeholder="https://github.com/..." />
                        </div>
                    </div>
                </div>
            </div>

            <div className="ts-divider"></div>

            <div className="flex justify-end gap-2">
              <button type="submit" className="ts-button is-primary">儲存設定</button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
