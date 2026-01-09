import AdminLayout from "@/layouts/AdminLayout";
import { db } from "@/services/db";
import { useEffect, useState } from "react";
import type { Article } from "@/types";
import { Link } from "wouter";

export default function Dashboard() {
  const [stats, setStats] = useState({ articles: 0, published: 0 });

  useEffect(() => {
    const articles = db.articles.getAll();
    setStats({
      articles: articles.length,
      published: articles.filter(a => a.status === 'published').length
    });
  }, []);

  return (
    <AdminLayout>
      <div className="ts-header is-big mb-6">儀表板</div>
      
      <div className="ts-grid is-3-columns is-relaxed">
        <div className="column">
          <div className="ts-box">
            <div className="ts-content">
              <div className="ts-statistic">
                <div className="value">{stats.articles}</div>
                <div className="label">總文章數</div>
              </div>
            </div>
            <div className="ts-divider"></div>
            <Link href="/admin/articles" className="ts-content is-secondary is-dense is-link is-center-aligned cursor-pointer">
              管理文章
            </Link>
          </div>
        </div>
        
        <div className="column">
          <div className="ts-box">
             <div className="ts-content">
              <div className="ts-statistic">
                <div className="value">{stats.published}</div>
                <div className="label">已發布</div>
              </div>
            </div>
             <div className="ts-divider"></div>
            <div className="ts-content is-secondary is-dense is-center-aligned">
               公開內容
            </div>
          </div>
        </div>

        <div className="column">
           <div className="ts-box">
             <div className="ts-content">
              <div className="ts-statistic">
                <div className="value">0</div>
                <div className="label">頁面數</div>
              </div>
            </div>
             <div className="ts-divider"></div>
            <Link href="/admin/pages" className="ts-content is-secondary is-dense is-link is-center-aligned cursor-pointer">
               管理頁面
            </Link>
          </div>
        </div>
      </div>

      <div className="ts-header is-large mt-12 mb-6">快速開始</div>
      <div className="ts-grid is-2-columns">
          <div className="column">
              <Link href="/admin/articles/new" className="ts-box is-dashed is-padded is-center-aligned h-full flex flex-col justify-center items-center hover:bg-gray-50 transition-colors">
                  <span className="ts-icon is-plus-icon is-big mb-2"></span>
                  <div className="ts-text is-bold">撰寫新文章</div>
              </Link>
          </div>
      </div>
    </AdminLayout>
  );
}
