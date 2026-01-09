import AdminLayout from "@/layouts/AdminLayout";
import { db } from "@/services/db";
import type { Article, Category } from "@/types";
import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import placeholderImg from "@/assets/placeholder.jpg";
import MDEditor from '@uiw/react-md-editor';
import MediaSelector from "@/components/MediaSelector";

type ArticleFormData = Omit<Article, "id" | "createdAt" | "updatedAt" | "tags"> & {
    tagsStr: string;
};

export default function ArticleEditor() {
  const [match, params] = useRoute("/admin/articles/edit/:id");
  const [, setLocation] = useLocation();
  const isEdit = !!match;
  const [categories, setCategories] = useState<Category[]>([]);
  
  const { register, handleSubmit, reset, control, watch, setValue, getValues } = useForm<ArticleFormData>({
    defaultValues: {
      status: 'draft',
      coverImage: placeholderImg,
      content: '',
      categoryId: '',
      tagsStr: '',
      isSticky: false,
      stickyOrder: 0
    }
  });

  const isSticky = watch("isSticky");

  useEffect(() => {
    // Load categories
    setCategories(db.categories.getAll());

    if (isEdit && params?.id) {
      const article = db.articles.getById(params.id);
      if (article) {
        // Convert array to comma-separated string for editing
        reset({
            ...article,
            tagsStr: article.tags ? article.tags.join(', ') : ''
        });
      } else {
        toast.error("找不到文章");
        setLocation("/admin/articles");
      }
    }
  }, [isEdit, params, reset, setLocation]);

  const onSubmit = (data: ArticleFormData) => {
    try {
      // Convert comma-separated string back to array
      const tags = data.tagsStr.split(',').map(t => t.trim()).filter(t => t);
      
      const payload = {
          ...data,
          tags
      };
      // Remove temporary tagsStr field
      delete (payload as any).tagsStr;

      if (isEdit && params?.id) {
        db.articles.update(params.id, payload as any);
        toast.success("文章已更新");
      } else {
        db.articles.create(payload as any);
        toast.success("文章已建立");
      }
      setLocation("/admin/articles");
    } catch (e) {
      console.error(e);
      toast.error("儲存失敗");
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div className="ts-header is-big">
          {isEdit ? "編輯文章" : "新增文章"}
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
                            <input type="text" {...register("title", { required: true })} placeholder="輸入文章標題..." />
                        </div>
                    </div>
                </div>
                <div className="column">
                    <div className="ts-grid is-2-columns">
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
                        <div className="column">
                            <div className="ts-field">
                                <label className="label">分類</label>
                                <div className="ts-select is-fluid">
                                    <select {...register("categoryId")}>
                                        <option value="">未分類</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="ts-grid is-2-columns">
                <div className="column">
                    <div className="ts-field">
                        <label className="label">標籤 (Tags)</label>
                        <div className="ts-input">
                            <input type="text" {...register("tagsStr")} placeholder="例如：React, 教學, 更新日誌 (使用逗號分隔)" />
                        </div>
                    </div>
                </div>
                <div className="column">
                    <div className="ts-grid is-2-columns">
                        <div className="column">
                            <div className="ts-field">
                                <label className="label">置頂設定</label>
                                <label className="ts-checkbox">
                                    <input type="checkbox" {...register("isSticky")} />
                                    <span className="label">置頂文章</span>
                                </label>
                            </div>
                        </div>
                        <div className="column">
                            <div className="ts-field">
                                <label className="label">置頂順序</label>
                                <div className={`ts-input ${!isSticky ? 'is-disabled' : ''}`}>
                                    <input 
                                        type="number" 
                                        {...register("stickyOrder", { valueAsNumber: true })} 
                                        placeholder="0" 
                                        disabled={!isSticky}
                                    />
                                </div>
                                <div className="ts-text is-small is-secondary mt-1">數字越小越靠前</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="ts-field">
              <label className="label">摘要</label>
              <div className="ts-input">
                <textarea className="ts-input" rows={2} {...register("summary")} placeholder="簡短摘要..." />
              </div>
            </div>

            <div className="ts-field">
              <div className="flex justify-between items-end mb-2">
                  <label className="label mb-0">內容 (Markdown)</label>
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
                      height={500}
                      preview="live"
                      className="w-full"
                    />
                  )}
                />
              </div>
              <div className="ts-text is-small is-secondary mt-1">支援 Markdown 語法與即時預覽</div>
            </div>

            <div className="ts-divider"></div>

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setLocation("/admin/articles")} className="ts-button is-secondary">取消</button>
              <button type="submit" className="ts-button is-primary">儲存</button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
