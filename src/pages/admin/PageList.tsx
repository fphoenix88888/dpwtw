import AdminLayout from "@/layouts/AdminLayout";
import { db } from "@/services/db";
import type { Page } from "@/types";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { Reorder } from "framer-motion";

export default function AdminPageList() {
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSorting, setIsSorting] = useState(false);

  const loadPages = () => {
    const data = db.pages.getAll();
    data.sort((a, b) => (a.order || 0) - (b.order || 0));
    setPages(data);
  };

  useEffect(() => {
    loadPages();
  }, []);

  const handleDelete = (id: string) => {
    if (confirm("確定要刪除此頁面嗎？")) {
      db.pages.delete(id);
      loadPages();
      if (selectedIds.has(id)) {
          const newSet = new Set(selectedIds);
          newSet.delete(id);
          setSelectedIds(newSet);
      }
      toast.success("頁面已刪除");
    }
  };

  // Selection Logic
  const toggleSelect = (id: string) => {
      const newSet = new Set(selectedIds);
      if (newSet.has(id)) {
          newSet.delete(id);
      } else {
          newSet.add(id);
      }
      setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
      if (selectedIds.size === pages.length && pages.length > 0) {
          setSelectedIds(new Set());
      } else {
          const ids = pages.map(p => p.id);
          setSelectedIds(new Set(ids));
      }
  };

  const handleBatchDelete = () => {
      if (confirm(`確定要刪除選取的 ${selectedIds.size} 個頁面嗎？`)) {
          db.pages.deleteMany(Array.from(selectedIds));
          loadPages();
          setSelectedIds(new Set());
          toast.success("批次刪除完成");
      }
  };

  const handleSaveOrder = () => {
      pages.forEach((page, index) => {
          db.pages.update(page.id, { order: index });
      });
      toast.success("頁面順序已更新");
      setIsSorting(false);
      loadPages();
  };

  const handleQuickStatusUpdate = (id: string, status: 'draft' | 'published') => {
      db.pages.update(id, { status });
      loadPages();
      toast.success("狀態已更新");
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div className="ts-header is-big">
            {isSorting ? "頁面排序" : "頁面管理"}
        </div>
        <div className="flex gap-2">
            {!isSorting && (
                <>
                    <button className="ts-button is-secondary is-start-icon" onClick={() => setIsSorting(true)}>
                        <span className="ts-icon fa-solid fa-sort"></span> 排序頁面
                    </button>
                    <Link href="/admin/pages/new" className="ts-button is-primary is-start-icon">
                        <span className="ts-icon fa-solid fa-plus"></span> 新增頁面
                    </Link>
                </>
            )}
            {isSorting && (
                <>
                    <button className="ts-button is-secondary" onClick={() => { setIsSorting(false); loadPages(); }}>
                        取消
                    </button>
                    <button className="ts-button is-primary" onClick={handleSaveOrder}>
                        儲存順序
                    </button>
                </>
            )}
        </div>
      </div>

      {!isSorting && selectedIds.size > 0 && (
          <div className="ts-box is-horizontal is-fitted mb-4 sticky top-4 z-10 shadow-md">
              <div className="ts-content is-dense">
                  <div className="ts-text is-bold">已選取 {selectedIds.size} 項目</div>
              </div>
              <div className="ts-content is-dense">
                  <button className="ts-button is-negative is-small" onClick={handleBatchDelete}>
                      <span className="ts-icon fa-solid fa-trash mr-1"></span> 批量刪除
                  </button>
              </div>
          </div>
      )}

      {isSorting ? (
          <div className="ts-box">
              <div className="ts-content">
                  <div className="ts-notice is-info mb-4">
                      <div className="content">拖曳下方區塊來調整頁面的顯示順序。</div>
                  </div>
                  <Reorder.Group axis="y" values={pages} onReorder={setPages} className="space-y-2">
                      {pages.map((page) => (
                          <Reorder.Item key={page.id} value={page} className="ts-box is-horizontal is-elevated cursor-move">
                              <div className="ts-content is-dense is-secondary bg-gray-50 flex items-center justify-center w-12 border-r">
                                  <span className="ts-icon fa-solid fa-grip-lines"></span>
                              </div>
                              <div className="ts-content">
                                  <div className="ts-header is-heavy">{page.title}</div>
                                  <div className="ts-text is-small is-secondary">/{page.slug}</div>
                              </div>
                          </Reorder.Item>
                      ))}
                  </Reorder.Group>
              </div>
          </div>
      ) : (
          <div className="ts-box">
            <div className="ts-content is-fitted">
              <table className="ts-table is-striped is-full-width">
                <thead>
                  <tr>
                    <th className="is-collapsed">
                        <label className="ts-checkbox">
                            <input 
                                type="checkbox" 
                                checked={pages.length > 0 && selectedIds.size === pages.length}
                                onChange={toggleSelectAll}
                            />
                        </label>
                    </th>
                    <th>標題</th>
                    <th>路徑 (Slug)</th>
                    <th>狀態</th>
                    <th>更新時間</th>
                    <th className="is-end-aligned">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {pages.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="ts-text is-center-aligned is-secondary p-8">
                        尚無自訂頁面
                      </td>
                    </tr>
                  ) : (
                    pages.map(p => (
                       <tr key={p.id} className={selectedIds.has(p.id) ? 'is-selected' : ''}>
                           <td className="is-collapsed">
                              <label className="ts-checkbox">
                                  <input 
                                    type="checkbox" 
                                    checked={selectedIds.has(p.id)}
                                    onChange={() => toggleSelect(p.id)}
                                  />
                              </label>
                           </td>
                           <td className="is-bold">{p.title}</td>
                           <td className="font-mono text-sm is-secondary">/{p.slug}</td>
                           <td>
                               <div className="ts-select is-small is-dense">
                                   <select 
                                        value={p.status} 
                                        onChange={(e) => handleQuickStatusUpdate(p.id, e.target.value as any)}
                                        className={p.status === 'published' ? 'text-green-600 font-bold' : 'text-gray-500'}
                                   >
                                       <option value="published">已發布</option>
                                       <option value="draft">草稿</option>
                                   </select>
                               </div>
                           </td>
                           <td className="ts-text is-small">
                               {new Date(p.updatedAt).toLocaleDateString()}
                           </td>
                           <td className="is-end-aligned">
                               <div className="ts-buttons is-small is-dense">
                                   <Link href={`/admin/pages/edit/${p.id}`} className="ts-button is-secondary is-icon">
                                       <span className="ts-icon fa-solid fa-pen"></span>
                                   </Link>
                                   <button onClick={() => handleDelete(p.id)} className="ts-button is-negative is-icon">
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
      )}
    </AdminLayout>
  );
}
