import PublicLayout from "@/layouts/PublicLayout";
import { db } from "@/services/db";
import type { Article, Category, SiteSettings } from "@/types";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import placeholderImg from "@/assets/placeholder.jpg";

export default function ArticleList() {
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const articlesData = db.articles.getAll();
    const published = articlesData.filter(a => a.status === 'published');
    // Sort by date desc
    published.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    setAllArticles(published);
    setCategories(db.categories.getAll());
    setSettings(db.settings.get());

    const allTags = new Set<string>();
    published.forEach(a => {
        a.tags?.forEach(t => allTags.add(t));
    });
    setTags(Array.from(allTags));
  }, []);

  // Filter Logic
  const isFiltering = selectedCategory !== null || selectedTag !== null || searchQuery !== "";

  let filtered = allArticles.filter(a => {
      const matchCat = selectedCategory ? a.categoryId === selectedCategory : true;
      const matchTag = selectedTag ? a.tags?.includes(selectedTag) : true;
      const matchSearch = searchQuery 
        ? (a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.summary.toLowerCase().includes(searchQuery.toLowerCase())) 
        : true;
      return matchCat && matchTag && matchSearch;
  });

  // Split Sticky if not filtering
  let stickyArticles: Article[] = [];
  let listArticles: Article[] = [];

  if (!isFiltering) {
      stickyArticles = filtered.filter(a => a.isSticky);
      // Sort sticky articles by order (ascending), then by date (descending)
      stickyArticles.sort((a, b) => {
          const orderA = a.stickyOrder ?? 0;
          const orderB = b.stickyOrder ?? 0;
          if (orderA !== orderB) return orderA - orderB;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      listArticles = filtered.filter(a => !a.isSticky);
  } else {
      listArticles = filtered;
  }

  // Pagination
  const itemsPerPage = settings?.postsPerPage || 10;
  const totalPages = Math.ceil(listArticles.length / itemsPerPage);
  
  // Adjust page if out of bounds
  if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
  }

  const paginatedArticles = listArticles.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );

  const getCategoryName = (id?: string) => {
    if (!id) return null;
    return categories.find(c => c.id === id)?.name;
  };

  const getCategoryColor = (id?: string) => {
    if (!id) return null;
    return categories.find(c => c.id === id)?.color;
  };

  const handlePageChange = (page: number) => {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <PublicLayout>
      <div className="ts-content is-tertiary is-fitted h-64 flex items-center justify-center mb-12">
          <div className="ts-header is-huge is-center-aligned">站長日誌</div>
      </div>

      <div className="ts-container is-narrow section-padding pb-12">
        <div className="ts-grid is-relaxed is-stackable">
            
            {/* Sidebar Filters */}
            <div className="column is-4-wide">
                <div className="ts-box is-sticky top-4">
                    <div className="ts-content">
                        <div className="ts-input is-start-icon is-fluid">
                            <span className="ts-icon fa-solid fa-magnifying-glass"></span>
                            <input 
                                type="text" 
                                placeholder="搜尋文章..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="ts-divider"></div>
                    <div className="ts-content">
                        <div className="ts-header is-heavy is-big mb-4">文章分類</div>
                        <div className="ts-menu is-fluid">
                            <button 
                                className={`item ${selectedCategory === null ? 'is-active' : ''}`}
                                onClick={() => setSelectedCategory(null)}
                            >
                                所有分類
                            </button>
                            {categories.map(cat => (
                                <button 
                                    key={cat.id}
                                    className={`item ${selectedCategory === cat.id ? 'is-active' : ''}`}
                                    onClick={() => setSelectedCategory(cat.id)}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="ts-divider"></div>
                    <div className="ts-content">
                        <div className="ts-header is-heavy is-big mb-4">標籤雲</div>
                        <div className="flex flex-wrap gap-2">
                             <button 
                                className={`ts-badge is-small cursor-pointer ${selectedTag === null ? 'is-primary' : 'is-secondary is-outlined'}`}
                                onClick={() => setSelectedTag(null)}
                            >
                                全部
                            </button>
                            {tags.map(tag => (
                                <button 
                                    key={tag}
                                    className={`ts-badge is-small cursor-pointer ${selectedTag === tag ? 'is-primary' : 'is-secondary is-outlined'}`}
                                    onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="column is-12-wide">
                
                {/* Active Filters Display */}
                {isFiltering && (
                    <div className="ts-content is-dense mb-6">
                        <div className="ts-text is-secondary flex items-center flex-wrap gap-2">
                            <span>篩選條件：</span>
                            {searchQuery && <span className="ts-badge is-small">搜尋: {searchQuery}</span>}
                            {selectedCategory && <span className="ts-badge is-small">分類: {getCategoryName(selectedCategory)}</span>}
                            {selectedTag && <span className="ts-badge is-small">標籤: {selectedTag}</span>}
                            <button 
                                className="ts-text is-link is-small ml-2" 
                                onClick={() => { setSelectedCategory(null); setSelectedTag(null); setSearchQuery(""); }}
                            >
                                清除全部
                            </button>
                        </div>
                    </div>
                )}

                {/* Sticky Posts (Only when not filtering) */}
                {(!isFiltering && stickyArticles.length > 0) && (
                    <div className="mb-12">
                        <div className="ts-header is-heavy is-big mb-6 flex items-center gap-2">
                            <span className="ts-icon fa-solid fa-thumbtack is-negative"></span> 精選文章
                        </div>
                        <div className="ts-grid is-2-columns is-relaxed is-stackable">
                            {stickyArticles.map((article) => (
                                <div className="column" key={article.id}>
                                    <Link href={`/articles/${article.id}`} className="ts-card hover:translate-y-[-4px] transition-transform duration-200 block h-full">
                                        <div className="image">
                                            <img src={article.coverImage || placeholderImg} className="object-cover h-64 w-full" alt={article.title} />
                                        </div>
                                        <div className="content">
                                            <div className="ts-meta is-secondary is-small mb-2">
                                                <span className="ts-badge is-small is-negative mr-2">Featured</span>
                                                {getCategoryName(article.categoryId) && (
                                                    <span className={`ts-badge is-small is-outlined mr-2 ${getCategoryColor(article.categoryId) || 'is-secondary'}`}>
                                                        {getCategoryName(article.categoryId)}
                                                    </span>
                                                )}
                                                <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="ts-header is-heavy is-big">{article.title}</div>
                                            <p className="ts-text is-secondary mt-2 line-clamp-3">
                                                {article.summary}
                                            </p>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                        <div className="ts-divider is-section"></div>
                    </div>
                )}

                {/* Main Article List */}
                <div className="ts-header is-heavy is-big mb-6">
                    {isFiltering ? "搜尋結果" : "最新日誌"}
                </div>

                {paginatedArticles.length === 0 ? (
                    <div className="ts-placeholder is-active is-secondary is-dashed">
                        <div className="header">沒有符合條件的日誌</div>
                        <div className="description">請嘗試其他篩選條件。</div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {paginatedArticles.map((article) => (
                            <Link key={article.id} href={`/articles/${article.id}`} className="ts-box hover:translate-x-2 transition-transform duration-200 cursor-pointer">
                                <div className="ts-grid is-middle-aligned">
                                    <div className="column is-4-wide">
                                        <div className="ts-image is-cover is-3-by-2 h-full">
                                            <img src={article.coverImage || placeholderImg} className="object-cover h-full w-full" alt={article.title} />
                                        </div>
                                    </div>
                                    <div className="column is-12-wide">
                                        <div className="ts-content">
                                            <div className="ts-meta is-secondary is-small mb-2">
                                                {getCategoryName(article.categoryId) && (
                                                    <span className={`ts-badge is-small is-outlined mr-2 ${getCategoryColor(article.categoryId) || 'is-secondary'}`}>
                                                        {getCategoryName(article.categoryId)}
                                                    </span>
                                                )}
                                                <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="ts-header is-heavy is-big mb-2">{article.title}</div>
                                            <p className="ts-text is-secondary line-clamp-2">
                                                {article.summary}
                                            </p>
                                            <div className="mt-3 flex flex-wrap gap-1">
                                                {article.tags?.slice(0, 5).map(tag => (
                                                    <span key={tag} className="ts-text is-tiny is-secondary mr-2">#{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="ts-pagination is-center-aligned mt-12">
                        <button 
                            className={`item ${currentPage === 1 ? 'is-disabled' : ''}`}
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            上一頁
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button 
                                key={page}
                                className={`item ${currentPage === page ? 'is-active' : ''}`}
                                onClick={() => handlePageChange(page)}
                            >
                                {page}
                            </button>
                        ))}
                        <button 
                            className={`item ${currentPage === totalPages ? 'is-disabled' : ''}`}
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            下一頁
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>
    </PublicLayout>
  );
}
