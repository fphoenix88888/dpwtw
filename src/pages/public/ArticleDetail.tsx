import PublicLayout from "@/layouts/PublicLayout";
import { db } from "@/services/db";
import type { Article } from "@/types";
import { useEffect, useState } from "react";
import { useRoute, useLocation, Link } from "wouter";
import placeholderImg from "@/assets/placeholder.jpg";
import MDEditor from '@uiw/react-md-editor';
import Breadcrumb from "@/components/Breadcrumb";

export default function ArticleDetail() {
  const [match, params] = useRoute("/articles/:id");
  const [article, setArticle] = useState<Article | null>(null);
  const [prevArticle, setPrevArticle] = useState<Article | null>(null);
  const [nextArticle, setNextArticle] = useState<Article | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (params?.id) {
      const allArticles = db.articles.getAll();
      const published = allArticles.filter(a => a.status === 'published');
      // Sort by date desc (New -> Old)
      published.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const currentIndex = published.findIndex(a => a.id === params.id);
      
      if (currentIndex !== -1) {
        setArticle(published[currentIndex]);
        
        // Prev/Next logic (Index + 1 is older, Index - 1 is newer)
        setPrevArticle(published[currentIndex + 1] || null); // Older
        setNextArticle(published[currentIndex - 1] || null); // Newer
      } else {
        setLocation("/articles");
      }
    }
  }, [params, setLocation]);

  if (!article) return null;

  const category = article.categoryId ? db.categories.getAll().find(c => c.id === article.categoryId) : null;
  const breadcrumbs = [
      { label: "首頁", href: "/" },
      { label: "站長日誌", href: "/articles" },
      ...(category ? [{ label: category.name, href: `/articles?category=${category.id}` }] : []), // Note: ArticleList doesn't support query params yet, but for breadcrumb display it's fine or just link to list
      { label: article.title }
  ];

  return (
    <PublicLayout>
      <div className="ts-container is-narrow pt-6">
          <Breadcrumb items={breadcrumbs} />
      </div>
      
      <div className="relative h-96 mt-6">
        <img 
          src={article.coverImage || placeholderImg} 
          className="w-full h-full object-cover absolute inset-0" 
          alt={article.title} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center">
            <div className="ts-container is-narrow pb-12 w-full text-center">
                <div className="ts-meta is-inverted is-small mb-2 flex justify-center items-center">
                    {category && (
                        <span className={`ts-badge is-small is-outlined is-inverted mr-2 ${category.color || 'is-secondary'}`}>
                           {category.name}
                        </span>
                    )}
                    <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                </div>
                <h1 className="ts-header is-huge is-inverted mb-2">{article.title}</h1>
                <div className="flex gap-2 mt-4 justify-center">
                    {article.tags?.map(tag => (
                        <span key={tag} className="ts-badge is-small is-secondary is-inverted">#{tag}</span>
                    ))}
                </div>
            </div>
        </div>
      </div>

      <div className="ts-container is-narrow section-padding py-12">
        <div className="ts-content is-relaxed">
             <div data-color-mode="light">
                <MDEditor.Markdown source={article.content} style={{ whiteSpace: 'pre-wrap', backgroundColor: 'transparent', fontSize: '1.1em' }} />
            </div>
        </div>
        
        <div className="ts-divider mt-12 mb-8"></div>
        
        {/* Navigation */}
        <div className="ts-grid is-2-columns is-relaxed">
            <div className="column">
                {prevArticle ? (
                    <Link href={`/articles/${prevArticle.id}`} className="ts-box p-4 hover:bg-gray-50 transition-colors block h-full">
                        <div className="ts-text is-small is-secondary mb-1">← 上一篇</div>
                        <div className="ts-header is-heavy is-truncated">{prevArticle.title}</div>
                    </Link>
                ) : (
                    <div className="ts-box p-4 is-disabled h-full flex flex-col justify-center">
                        <div className="ts-text is-secondary">沒有更舊的文章了</div>
                    </div>
                )}
            </div>
            <div className="column">
                {nextArticle ? (
                    <Link href={`/articles/${nextArticle.id}`} className="ts-box p-4 hover:bg-gray-50 transition-colors block h-full text-right">
                        <div className="ts-text is-small is-secondary mb-1">下一篇 →</div>
                        <div className="ts-header is-heavy is-truncated">{nextArticle.title}</div>
                    </Link>
                ) : (
                    <div className="ts-box p-4 is-disabled h-full flex flex-col justify-center items-end">
                        <div className="ts-text is-secondary">沒有更新的文章了</div>
                    </div>
                )}
            </div>
        </div>

        <div className="ts-content mt-8 is-center-aligned">
            <a href="/articles" className="ts-button is-secondary is-outlined is-start-icon">
                <span className="ts-icon fa-solid fa-arrow-left"></span> 返回站長日誌
            </a>
        </div>
      </div>
    </PublicLayout>
  );
}
