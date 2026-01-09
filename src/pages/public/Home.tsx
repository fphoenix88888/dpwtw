import PublicLayout from "@/layouts/PublicLayout";
import heroImg from "@/assets/hero.jpg";
import placeholderImg from "@/assets/placeholder.jpg";
import { Link } from "wouter";
import { useEffect, useState } from "react";
import { db } from "@/services/db";
import type { Article, Category, SiteSettings } from "@/types";

export default function Home() {
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    const allArticles = db.articles.getAll();
    const published = allArticles.filter(a => a.status === 'published');
    published.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setRecentArticles(published.slice(0, 3));
    
    setCategories(db.categories.getAll());
    setSettings(db.settings.get());
  }, []);

  const getCategory = (id?: string) => {
    if (!id) return null;
    return categories.find(c => c.id === id);
  };

  return (
    <PublicLayout>
      {/* Hero Section */}
      <div className="relative w-full h-[60vh] min-h-[400px] max-h-[700px] overflow-hidden">
        <img 
            src={heroImg} 
            alt="Hero Banner" 
            className="w-full h-full object-cover absolute inset-0" 
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 px-4">
          <div className="ts-container is-narrow w-full">
            <div className="text-center text-white">
                <h1 className="ts-header is-huge is-inverted mb-6 font-bold md:text-5xl text-3xl">
                    {settings?.heroTitle || "歡迎來到 Tocas CMS"}
                </h1>
                <p className="ts-text is-large is-inverted mb-8 opacity-90 text-lg md:text-xl">
                    {settings?.heroDescription || "探索最新的技術文章與資訊，打造極致的閱讀體驗。"}
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                    <Link href="/articles" className="ts-button is-primary is-large is-rounded">
                        開始閱讀
                    </Link>
                    {/* <Link href="/admin/login" ...> Admin Login Hidden </Link> */}
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="ts-section is-secondary">
          <div className="ts-container section-padding py-16">
              <div className="ts-header is-huge is-center-aligned mb-12">核心特色</div>
              <div className="ts-grid is-3-columns is-relaxed is-stackable">
                  <div className="column">
                      <div className="ts-box h-full is-top-indicated is-primary">
                          <div className="ts-content is-center-aligned">
                              <div className="ts-icon fa-solid fa-bolt is-huge is-primary mb-4"></div>
                              <div className="ts-header is-heavy is-big mb-2">極速效能</div>
                              <p className="ts-text is-secondary">
                                  採用 React 19 與 Vite 構建，帶來秒開的極致體驗，讓您的內容瞬間呈現。
                              </p>
                          </div>
                      </div>
                  </div>
                  <div className="column">
                      <div className="ts-box h-full is-top-indicated is-info">
                          <div className="ts-content is-center-aligned">
                              <div className="ts-icon fa-solid fa-pen-to-square is-huge is-info mb-4"></div>
                              <div className="ts-header is-heavy is-big mb-2">直覺寫作</div>
                              <p className="ts-text is-secondary">
                                  內建強大的 Markdown 編輯器，支援即時預覽，讓專注於內容創作變得前所未有的簡單。
                              </p>
                          </div>
                      </div>
                  </div>
                  <div className="column">
                      <div className="ts-box h-full is-top-indicated is-warning">
                          <div className="ts-content is-center-aligned">
                              <div className="ts-icon fa-solid fa-palette is-huge is-warning mb-4"></div>
                              <div className="ts-header is-heavy is-big mb-2">現代設計</div>
                              <p className="ts-text is-secondary">
                                  基於 Tocas UI 5.0 的簡約美學，提供 RWD 響應式設計，完美適配所有裝置。
                              </p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* Recent Articles */}
      <div className="ts-container section-padding py-16">
        <div className="flex justify-between items-end mb-12 px-4">
            <div>
                <div className="ts-header is-huge">最新日誌</div>
                <div className="ts-text is-secondary mt-2">探索我們最新的想法與教學</div>
            </div>
            <Link href="/articles" className="ts-button is-secondary is-outlined is-end-icon hidden md:inline-flex">
                查看更多 <span className="ts-icon fa-solid fa-arrow-right"></span>
            </Link>
        </div>
        
        {recentArticles.length === 0 ? (
             <div className="ts-placeholder is-active is-secondary is-dashed">
                <div className="header">目前沒有日誌</div>
                <div className="description">敬請期待更多精彩內容。</div>
            </div>
        ) : (
            <div className="ts-grid is-3-columns is-relaxed is-stackable">
            {recentArticles.map((article) => {
                const category = getCategory(article.categoryId);
                return (
                    <div className="column" key={article.id}>
                    <Link href={`/articles/${article.id}`} className="ts-card hover:translate-y-[-4px] transition-transform duration-200 cursor-pointer block h-full">
                        <div className="image">
                            <img src={article.coverImage || placeholderImg} className="object-cover h-56 w-full" alt={article.title} />
                        </div>
                        <div className="content">
                            <div className="ts-meta is-secondary is-small mb-3">
                                {category && (
                                    <span className={`ts-badge is-small ${category.color || 'is-secondary'} is-outlined mr-2`}>
                                        {category.name}
                                    </span>
                                )}
                                <span className="ts-icon fa-regular fa-calendar mr-1"></span>
                                <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="ts-header is-heavy is-big mb-2 line-clamp-1">{article.title}</div>
                            <p className="ts-text is-secondary line-clamp-3">
                                {article.summary}
                            </p>
                        </div>
                    </Link>
                    </div>
                );
            })}
            </div>
        )}
        
        <div className="ts-center mt-8 md:hidden">
            <Link href="/articles" className="ts-button is-secondary is-outlined is-end-icon w-full">
                查看更多 <span className="ts-icon is-arrow-right-icon"></span>
            </Link>
        </div>
      </div>

      {/* CTA Section */}
      <div className="ts-section is-primary is-inverted">
          <div className="ts-container is-narrow section-padding py-20 text-center">
              <h2 className="ts-header is-huge is-inverted mb-6">準備好開始您的旅程了嗎？</h2>
              <p className="ts-text is-large is-inverted opacity-90 mb-10 max-w-2xl mx-auto">
                  無論您是開發者、設計師還是內容創作者，Tocas CMS 都能為您提供所需的工具。立即加入我們，開始打造您的專屬網站。
              </p>
              <div className="flex gap-4 justify-center">
                  <Link href="/admin/register" className="ts-button is-secondary is-large is-rounded">
                      立即註冊帳號
                  </Link>
                  <Link href="/contact" className="ts-button is-primary is-large is-outlined is-inverted is-rounded">
                      聯絡我們
                  </Link>
              </div>
          </div>
      </div>
    </PublicLayout>
  );
}
