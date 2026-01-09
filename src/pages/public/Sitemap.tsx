import PublicLayout from "@/layouts/PublicLayout";
import { db } from "@/services/db";
import type { Page, Category, Article } from "@/types";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import Breadcrumb from "@/components/Breadcrumb";

export default function Sitemap() {
  const [pages, setPages] = useState<Page[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    setPages(db.pages.getAll().filter(p => p.status === 'published'));
    setCategories(db.categories.getAll());
    setArticles(db.articles.getAll().filter(a => a.status === 'published'));
  }, []);

  const rootPages = pages.filter(p => !p.parentId);
  const getSubPages = (parentId: string) => pages.filter(p => p.parentId === parentId);

  const getArticlesByCategory = (catId: string) => articles.filter(a => a.categoryId === catId);
  const getUncategorizedArticles = () => articles.filter(a => !a.categoryId);

  const breadcrumbs = [
      { label: "首頁", href: "/" },
      { label: "網站導覽", active: true }
  ];

  return (
    <PublicLayout>
      <div className="ts-container is-narrow pt-4">
          <Breadcrumb items={breadcrumbs} />
      </div>

      <div className="ts-content is-tertiary is-fitted h-48 flex items-center justify-center mb-12 mt-4">
          <div className="ts-header is-huge is-center-aligned">網站導覽</div>
      </div>

      <div className="ts-container is-narrow section-padding pb-12">
        <div className="ts-grid is-2-columns is-relaxed is-stackable">
            
            {/* Pages Column */}
            <div className="column">
                <div className="ts-header is-heavy is-big mb-6">頁面</div>
                <div className="ts-list is-relaxed">
                    <div className="item">
                        <Link href="/" className="ts-text is-link">首頁</Link>
                    </div>
                    <div className="item">
                        <Link href="/articles" className="ts-text is-link">站長日誌</Link>
                    </div>
                    <div className="item">
                        <Link href="/events" className="ts-text is-link">活動日曆</Link>
                    </div>
                    
                    {rootPages.map(page => (
                        <div key={page.id} className="item">
                            <Link href={`/p/${page.slug}`} className="ts-text is-link">{page.title}</Link>
                            {getSubPages(page.id).length > 0 && (
                                <div className="ts-list is-relaxed mt-2 ml-4">
                                    {getSubPages(page.id).map(sub => (
                                        <div key={sub.id} className="item">
                                            <Link href={`/p/${sub.slug}`} className="ts-text is-link">{sub.title}</Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Articles Column */}
            <div className="column">
                <div className="ts-header is-heavy is-big mb-6">文章</div>
                
                {categories.map(cat => {
                    const catArticles = getArticlesByCategory(cat.id);
                    if (catArticles.length === 0) return null;
                    return (
                        <div key={cat.id} className="mb-6">
                            <div className="ts-header is-heavy mb-2">{cat.name}</div>
                            <div className="ts-list is-bulleted">
                                {catArticles.map(a => (
                                    <div key={a.id} className="item">
                                        <Link href={`/articles/${a.id}`} className="ts-text is-link">{a.title}</Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}

                {getUncategorizedArticles().length > 0 && (
                    <div className="mb-6">
                        <div className="ts-header is-heavy mb-2">未分類</div>
                        <div className="ts-list is-bulleted">
                            {getUncategorizedArticles().map(a => (
                                <div key={a.id} className="item">
                                    <Link href={`/articles/${a.id}`} className="ts-text is-link">{a.title}</Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </PublicLayout>
  );
}
