import AdminLayout from "@/layouts/AdminLayout";
import { db } from "@/services/db";
import type { Category } from "@/types";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type CategoryFormData = {
  name: string;
  slug: string;
  color: string;
};

const COLORS = [
  { label: "主要 (Primary)", value: "is-primary" },
  { label: "資訊 (Info)", value: "is-info" },
  { label: "警告 (Warning)", value: "is-warning" },
  { label: "成功 (Positive)", value: "is-positive" },
  { label: "錯誤 (Negative)", value: "is-negative" },
  { label: "次要 (Secondary)", value: "is-secondary" },
];

export default function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const { register, handleSubmit, reset } = useForm<CategoryFormData>({
      defaultValues: {
          color: 'is-secondary'
      }
  });

  const loadCategories = () => {
    setCategories(db.categories.getAll());
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const onSubmit = (data: CategoryFormData) => {
    try {
      db.categories.create(data);
      toast.success("分類已新增");
      reset({ color: 'is-secondary' }); // Reset with default
      loadCategories();
    } catch (e) {
      toast.error("新增失敗");
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("確定要刪除此分類嗎？")) {
      db.categories.delete(id);
      toast.success("分類已刪除");
      loadCategories();
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div className="ts-header is-big">分類管理</div>
      </div>

      <div className="ts-grid is-2-columns is-relaxed is-stackable">
        {/* Create Form */}
        <div className="column is-4-wide">
          <div className="ts-box">
            <div className="ts-content is-dense">
              <div className="ts-header is-heavy">新增分類</div>
            </div>
            <div className="ts-divider"></div>
            <div className="ts-content">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="ts-field">
                  <label className="label">分類名稱</label>
                  <div className="ts-input">
                    <input type="text" {...register("name", { required: true })} placeholder="例如：技術教學" />
                  </div>
                </div>
                <div className="ts-field">
                  <label className="label">代號 (Slug)</label>
                  <div className="ts-input">
                    <input type="text" {...register("slug", { required: true })} placeholder="例如：tech" />
                  </div>
                </div>
                <div className="ts-field">
                    <label className="label">標籤顏色</label>
                    <div className="ts-select is-fluid">
                        <select {...register("color")}>
                            {COLORS.map(c => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <button className="ts-button is-primary is-fluid">新增</button>
              </form>
            </div>
          </div>
        </div>

        {/* Category List */}
        <div className="column is-12-wide">
          <div className="ts-box">
            <div className="ts-content is-fitted">
              <table className="ts-table is-striped is-full-width">
                <thead>
                  <tr>
                    <th>名稱</th>
                    <th>代號</th>
                    <th>顏色預覽</th>
                    <th>建立日期</th>
                    <th className="is-end-aligned">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="ts-text is-center-aligned is-secondary p-8">
                        尚無分類
                      </td>
                    </tr>
                  ) : (
                    categories.map((cat) => (
                      <tr key={cat.id}>
                        <td className="is-bold">{cat.name}</td>
                        <td className="is-secondary font-mono text-sm">{cat.slug}</td>
                        <td>
                            <span className={`ts-badge is-small ${cat.color || 'is-secondary'}`}>
                                {cat.name}
                            </span>
                        </td>
                        <td className="ts-text is-small">
                          {new Date(cat.createdAt).toLocaleDateString()}
                        </td>
                        <td className="is-end-aligned">
                          <button onClick={() => handleDelete(cat.id)} className="ts-button is-negative is-icon is-small is-outlined">
                            <span className="ts-icon fa-solid fa-trash"></span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
