import AdminLayout from "@/layouts/AdminLayout";
import { db } from "@/services/db";
import type { Event } from "@/types";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function EventList() {
  const [events, setEvents] = useState<Event[]>([]);

  const loadEvents = () => {
    setEvents(db.events.getAll());
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleDelete = (id: string) => {
    if (confirm("確定要刪除此活動嗎？")) {
      db.events.delete(id);
      loadEvents();
      toast.success("活動已刪除");
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div className="ts-header is-big">活動日曆管理</div>
        <Link href="/admin/events/new" className="ts-button is-primary is-start-icon">
          <span className="ts-icon fa-solid fa-plus"></span> 新增活動
        </Link>
      </div>

      <div className="ts-box">
        <div className="ts-content is-fitted">
          <table className="ts-table is-striped is-full-width">
            <thead>
              <tr>
                <th>活動名稱</th>
                <th>開始日期</th>
                <th>結束日期</th>
                <th>地點</th>
                <th className="is-end-aligned">操作</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td colSpan={5} className="ts-text is-center-aligned is-secondary p-8">
                    尚無活動
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr key={event.id}>
                    <td className="is-bold">{event.title}</td>
                    <td className="ts-text is-small">
                      {new Date(event.startDate).toLocaleDateString()}
                    </td>
                    <td className="ts-text is-small">
                        {new Date(event.endDate).toLocaleDateString()}
                    </td>
                    <td className="ts-text is-small">{event.location || '-'}</td>
                    <td className="is-end-aligned">
                      <div className="ts-buttons is-small is-dense">
                        <Link href={`/admin/events/edit/${event.id}`} className="ts-button is-secondary is-icon">
                          <span className="ts-icon fa-solid fa-pen"></span>
                        </Link>
                        <button onClick={() => handleDelete(event.id)} className="ts-button is-negative is-icon is-outlined">
                          <span className="ts-icon fa-solid fa-trash"></span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
