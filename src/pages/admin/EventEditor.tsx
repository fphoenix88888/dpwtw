import AdminLayout from "@/layouts/AdminLayout";
import { db } from "@/services/db";
import type { Event } from "@/types";
import { useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type EventFormData = Omit<Event, "id" | "createdAt">;

export default function EventEditor() {
  const [match, params] = useRoute("/admin/events/edit/:id");
  const [, setLocation] = useLocation();
  const isEdit = !!match;
  
  const { register, handleSubmit, reset } = useForm<EventFormData>({
    defaultValues: {
      title: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0], // Default to today YYYY-MM-DD
      endDate: new Date().toISOString().split('T')[0],
      location: ''
    }
  });

  useEffect(() => {
    if (isEdit && params?.id) {
      const event = db.events.getById(params.id);
      if (event) {
        // Ensure date format for input type="date"
        const formatted = {
            ...event,
            startDate: event.startDate.split('T')[0],
            endDate: event.endDate.split('T')[0]
        };
        reset(formatted);
      } else {
        toast.error("找不到活動");
        setLocation("/admin/events");
      }
    }
  }, [isEdit, params, reset, setLocation]);

  const onSubmit = (data: EventFormData) => {
    try {
      if (isEdit && params?.id) {
        db.events.update(params.id, data);
        toast.success("活動已更新");
      } else {
        db.events.create(data);
        toast.success("活動已建立");
      }
      setLocation("/admin/events");
    } catch (e) {
      toast.error("儲存失敗");
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div className="ts-header is-big">
          {isEdit ? "編輯活動" : "新增活動"}
        </div>
      </div>

      <div className="ts-box">
        <div className="ts-content">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="ts-field">
                <label className="label">活動標題</label>
                <div className="ts-input">
                    <input type="text" {...register("title", { required: true })} placeholder="例如：年度大會" />
                </div>
            </div>

            <div className="ts-grid is-2-columns">
                <div className="column">
                    <div className="ts-field">
                        <label className="label">開始日期</label>
                        <div className="ts-input">
                            <input type="date" {...register("startDate", { required: true })} />
                        </div>
                    </div>
                </div>
                <div className="column">
                    <div className="ts-field">
                        <label className="label">結束日期</label>
                        <div className="ts-input">
                            <input type="date" {...register("endDate", { required: true })} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="ts-field">
                <label className="label">活動地點</label>
                <div className="ts-input">
                    <input type="text" {...register("location")} placeholder="例如：台北辦公室" />
                </div>
            </div>

            <div className="ts-field">
              <label className="label">活動描述</label>
              <div className="ts-input">
                <textarea className="ts-input" rows={4} {...register("description")} placeholder="活動詳細內容..." />
              </div>
            </div>

            <div className="ts-divider"></div>

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setLocation("/admin/events")} className="ts-button is-secondary">取消</button>
              <button type="submit" className="ts-button is-primary">儲存</button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
