import AdminLayout from "@/layouts/AdminLayout";
import { db } from "@/services/db";
import type { Page } from "@/types";
import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import MDEditor from '@uiw/react-md-editor';
import MediaSelector from "@/components/MediaSelector";

type PageFormData = Omit<Page, "id" | "updatedAt">;

export default function PageEditor() {
  const [match, params] = useRoute("/admin/pages/edit/:id");
  const [, setLocation] = useLocation();
  const isEdit = !!match;
  const [pages, setPages] = useState<Page[]>([]);
  
  const { register, handleSubmit, reset, control, setValue, getValues, watch } = useForm<PageFormData>({
    defaultValues: {
      status: 'draft',
      content: '',
      slug: '',
      parentId: '',
      coverImage: ''
    }
  });

  const coverImage = watch("coverImage");

  useEffect(() => {
    // Load pages for parent selection
    setPages(db.pages.getAll());

    if (isEdit && params?.id) {
      const page = db.pages.getById(params.id);
      if (page) {
        reset(page);
      } else {
        toast.error("找不到頁面");
        setLocation("/admin/pages");
      }
    }
  }, [isEdit, params, reset, setLocation]);

  const onSubmit = (data: PageFormData) => {
    try {
      if (!data.slug.match(/^[a-z0-9-]+$/)) {
        toast.error("Slug 只能包含小寫字母、數字與連字號");
        return;
      }

      // Check circular dependency if setting parent
      if (isEdit && params?.id && data.parentId === params.id) {
          toast.error("不能將頁面設為自己的子頁面");
          return;
      }

      if (isEdit && params?.id) {
        db.pages.update(params.id, data);
        toast.success("頁面已更新");
      } else {
        if (db.pages.getBySlug(data.slug)) {
            toast.error("此路徑 (Slug) 已被使用");
            return;
        }
        db.pages.create(data);
        toast.success("頁面已建立");
      }
      setLocation("/admin/pages");
    } catch (e) {
      toast.error("儲存失敗");
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div className="ts-header is-big">
          {isEdit ? "編輯頁面" : "新增頁面"}
        </div>
      </div>

      <div className="ts-box">
        <div className="ts-content">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="ts-grid is-2-columns">
                <div className="column">
                    <div className="ts-field">
                        <label className="label">標題</label>
                        <div className="ts-input">
                            <input type="text" {...register("title", { required: true })} placeholder="例如：關於我們" />
                        </div>
                    </div>
                </div>
                <div className="column">
                    <div className="ts-grid is-3-columns">
                        <div className="column">
                             <div className="ts-field">
                                <label className="label">路徑代號 (Slug)</label>
                                <div className="ts-input is-labeled">
                                    <span className="label">/p/</span>
                                    <input type="text" {...register("slug", { required: true })} placeholder="about" />
                                </div>
                            </div>
                        </div>
                        <div className="column">
                            <div className="ts-field">
                                <label className="label">母頁面</label>
                                <div className="ts-select is-fluid">
                                    <select {...register("parentId")}>
                                        <option value="">(無)</option>
                                        {pages
                                            .filter(p => !isEdit || p.id !== params?.id) // Exclude self
                                            .map(p => (
                                            <option key={p.id} value={p.id}>{p.title}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="column">
                            <div className="ts-field">
                                <label className="label">狀態</label>
                                <div className="ts-select is-fluid">
                                    <select {...register("status")}>
                                        <option value="draft">草稿</option>
                                        <option value="published">發布</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="ts-field">
                <label className="label">頁面背景圖 (Cover Image)</label>
                <div className="flex items-center gap-4">
                    {coverImage && (
                        <div className="ts-image is-rounded is-small w-24 h-16 border bg-gray-50 flex items-center justify-center overflow-hidden">
                            <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                        </div>
                    )}
                    
                    <MediaSelector 
                        trigger={<button type="button" className="ts-button is-secondary is-outlined">從媒體庫選擇</button>}
                        onSelect={(media) => {
                            setValue("coverImage", media.data);
                        }}
                    />
                    
                    {coverImage && (
                        <button type="button" className="ts-button is-small is-negative is-outlined" onClick={() => setValue("coverImage", "")}>
                            移除
                        </button>
                    )}
                </div>
            </div>

            <div className="ts-field">
              <div className="flex justify-between items-end mb-2">
                  <label className="label mb-0">內容 (HTML/Markdown)</label>
                  <MediaSelector 
                    trigger={<button type="button" className="ts-button is-small is-secondary is-outlined is-start-icon"><span className="ts-icon fa-regular fa-image"></span> 插入圖片</button>}
                    onSelect={(media) => {
                        const markdown = `![${media.name}](${media.data})`;
                        const current = getValues("content") || "";
                        setValue("content", current + "\n" + markdown);
                        toast.success("圖片代碼已插入至文末");
                    }}
                  />
              </div>
              <div data-color-mode="light" style={{ lineHeight: 'normal' }}>
                <Controller
                  name="content"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <MDEditor
                      value={field.value || ""}
                      onChange={field.onChange}
                      height={600}
                      preview="live"
                      className="w-full"
                    />
                  )}
                />
              </div>
              <div className="ts-text is-small is-secondary mt-1">支援 HTML 與 Markdown 語法。</div>
            </div>

            <div className="ts-divider"></div>

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setLocation("/admin/pages")} className="ts-button is-secondary">取消</button>
              <button type="submit" className="ts-button is-primary">儲存</button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
