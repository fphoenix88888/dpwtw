import { db } from "@/services/db";
import { useEffect, useState } from "react";

export default function Maintenance() {
  const [reason, setReason] = useState("網站進行例行性維護，請稍後再試。");

  useEffect(() => {
    const settings = db.settings.get();
    if (settings.maintenance?.reason) {
      setReason(settings.maintenance.reason);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="ts-box is-elevated p-12 max-w-lg mx-auto">
        <div className="ts-content is-center-aligned">
            <div className="ts-icon fa-solid fa-triangle-exclamation is-huge is-warning mb-6"></div>
            <h1 className="ts-header is-huge is-center-aligned mb-4">網站維護中</h1>
            <p className="ts-text is-large is-secondary is-center-aligned mb-8 leading-relaxed">
            {reason}
            </p>
        </div>
        <div className="ts-divider is-section"></div>
        <div className="ts-content is-center-aligned">
            <p className="ts-text is-small is-secondary">
            我們正在努力升級系統，感謝您的耐心等待。
            </p>
        </div>
      </div>
    </div>
  );
}
