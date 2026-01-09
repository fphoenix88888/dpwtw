import AdminLayout from "@/layouts/AdminLayout";
import { db } from "@/services/db";
import type { Article, Category } from "@/types";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { Reorder } from "framer-motion";

export default function AdminArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSorting, setIsSorting] = useState(false);
  const [stickyArticles, setStickyArticles] = useState<Article[]>([]);
  const [, setLocation] = useLocation();

  const loadData = () => {
    const allArticles = db.articles.getAll();
    setArticles(allArticles);
    setCategories(db.categories.getAll());
    
    // Prep sortable list
    const stickies = allArticles.filter(a => a.isSticky);
    stickies.sort((a, b) => (a.stickyOrder || 0) - (b.stickyOrder || 0));
    setStickyArticles(stickies);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = (id: string) => {
    if (confirm("確定要刪除這篇文章嗎？")) {
      db.articles.delete(id);
      loadData();
      if (selectedIds.has(id)) {
          const newSet = new Set(selectedIds);
          newSet.delete(id);
          setSelectedIds(newSet);
      }
      toast.success("文章已刪除");
    }
  };

  const getCategoryName = (id?: string) => {
    if (!id) return "未分類";
    const cat = categories.find(c => c.id === id);
    return cat ? cat.name : "未知分類";
  };

  const filteredArticles = filterCategory === "all" 
    ? articles 
    : articles.filter(a => a.categoryId === filterCategory);

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
      if (selectedIds.size === filteredArticles.length && filteredArticles.length > 0) {
          setSelectedIds(new Set());
      } else {
          const ids = filteredArticles.map(a => a.id);
          setSelectedIds(new Set(ids));
      }
  };

  const handleBatchDelete = () => {
      if (confirm(`確定要刪除選取的 ${selectedIds.size} 篇文章嗎？`)) {
          db.articles.deleteMany(Array.from(selectedIds));
          loadData();
          setSelectedIds(new Set());
          toast.success("批次刪除完成");
      }
  };

  const handleSaveOrder = () => {
      // Update order in DB
      stickyArticles.forEach((article, index) => {
          db.articles.update(article.id, { stickyOrder: index });
      });
      toast.success("置頂順序已更新");
      setIsSorting(false);
      loadData();
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="ts-header is-big">
            {isSorting ? "置頂文章排序" : "文章管理"}
        </div>
        <div className="flex gap-2 w-full md:w-auto">
             {!isSorting && (
                 <>
                    <div className="ts-select">
                        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                            <option value="all">所有分類</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <button className="ts-button is-secondary is-start-icon" onClick={() => setIsSorting(true)}>
                        <span className="ts-icon fa-solid fa-sort"></span> 排序置頂
                    </button>
                    <Link href="/admin/articles/new" className="ts-button is-primary is-start-icon">
                        <span className="ts-icon is-plus-icon"></span> 新增文章
                    </Link>
                 </>
             )}
             {isSorting && (
                 <>
                    <button className="ts-button is-secondary" onClick={() => setIsSorting(false)}>
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
                      <div className="content">拖曳下方區塊來調整置頂文章的顯示順序。</div>
                  </div>
                  <Reorder.Group axis="y" values={stickyArticles} onReorder={setStickyArticles} className="space-y-2">
                      {stickyArticles.map((article) => (
                          <Reorder.Item key={article.id} value={article} className="ts-box is-horizontal is-elevated cursor-move">
                              <div className="ts-content is-dense is-secondary bg-gray-50 flex items-center justify-center w-12 border-r">
                                  <span className="ts-icon fa-solid fa-grip-lines"></span>
                              </div>
                              <div className="ts-content">
                                  <div className="ts-header is-heavy">{article.title}</div>
                                  <div className="ts-text is-small is-secondary">{new Date(article.createdAt).toLocaleDateString()}</div>
                              </div>
                          </Reorder.Item>
                      ))}
                  </Reorder.Group>
                  {stickyArticles.length === 0 && (
                      <div className="ts-text is-center-aligned is-secondary p-8">
                          目前沒有置頂文章。請先編輯文章並勾選「置頂」。
                      </div>
                  )}
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
                                checked={filteredArticles.length > 0 && selectedIds.size === filteredArticles.length}
                                onChange={toggleSelectAll}
                            />
                        </label>
                    </th>
                    <th>標題</th>
                    <th>分類</th>
                    <th>狀態</th>
                    <th>發布日期</th>
                    <th className="is-end-aligned">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredArticles.map((article) => (
                    <tr key={article.id} className={selectedIds.has(article.id) ? 'is-selected' : ''}>
                      <td className="is-collapsed">
                          <label className="ts-checkbox">
                              <input 
                                type="checkbox" 
                                checked={selectedIds.has(article.id)}
                                onChange={() => toggleSelect(article.id)}
                              />
                          </label>
                      </td>
                      <td>
                        <div className="ts-text is-bold">
                            {article.title}
                            {article.isSticky && <span className="ts-icon fa-solid fa-thumbtack ml-2 text-red-500" title="置頂"></span>}
                        </div>
                        <div className="ts-text is-small is-secondary truncate max-w-md">{article.summary}</div>
                      </td>
                      <td>
                          <span className="ts-badge is-secondary is-small is-outlined">
                            {getCategoryName(article.categoryId)}
                          </span>
                      </td>
                      <td>
                        {article.status === 'published' ? (
                          <span className="ts-badge is-positive is-small">已發布</span>
                        ) : (
                          <span className="ts-badge is-secondary is-small">草稿</span>
                        )}
                      </td>
                      <td className="ts-text is-small">
                        {new Date(article.createdAt).toLocaleDateString()}
                      </td>
                      <td className="is-end-aligned">
                        <div className="ts-buttons is-small is-dense">
                          <Link href={`/admin/articles/edit/${article.id}`} className="ts-button is-secondary is-icon">
                             <span className="ts-icon is-pen-icon"></span>
                          </Link>
                          <button onClick={() => handleDelete(article.id)} className="ts-button is-negative is-icon">
                             <span className="ts-icon is-trash-icon"></span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredArticles.length === 0 && (
                    <tr>
                      <td colSpan={6} className="ts-text is-center-aligned is-secondary p-8">
                        {articles.length === 0 ? "尚無文章" : "沒有符合條件的文章"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
      )}
    </AdminLayout>
  );
}
