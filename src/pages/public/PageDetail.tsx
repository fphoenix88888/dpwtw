import PublicLayout from "@/layouts/PublicLayout";
import { db } from "@/services/db";
import type { Page } from "@/types";
import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import MDEditor from '@uiw/react-md-editor';
import Breadcrumb from "@/components/Breadcrumb";

export default function PageDetail() {
  const [match, params] = useRoute("/p/:slug");
  const [page, setPage] = useState<Page | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (params?.slug) {
      const data = db.pages.getBySlug(params.slug);
      if (data && data.status === 'published') {
        setPage(data);
      } else {
        // Redirect to 404 or home if not found
        // For now, let's just show not found state in render
        setPage(null);
      }
    }
  }, [params, setLocation]);

  if (!match) return null;

  if (!page) {
    return (
        <PublicLayout>
            <div className="ts-container is-narrow section-padding py-24 text-center">
                <div className="ts-header is-huge mb-4">404</div>
                <div className="ts-text is-large is-secondary">找不到此頁面</div>
            </div>
        </PublicLayout>
    );
  }

  // Check if content looks like HTML (starts with <)
  const isHtml = page.content.trim().startsWith('<');
  const parentPage = page?.parentId ? db.pages.getById(page.parentId) : null;
  
  const breadcrumbs = [
      { label: "首頁", href: "/" },
      ...(parentPage ? [{ label: parentPage.title, href: `/p/${parentPage.slug}` }] : []),
      { label: page?.title || "", active: true }
  ];

  return (
    <PublicLayout>
      <div className="ts-container is-narrow pt-4">
          <Breadcrumb items={breadcrumbs} />
      </div>

      {page.coverImage ? (
          <div className="relative w-full h-[40vh] min-h-[250px] max-h-[500px] mt-4 overflow-hidden">
            <img 
              src={page.coverImage} 
              className="w-full h-full object-cover absolute inset-0" 
              alt={page.title} 
            />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="ts-header is-huge is-inverted is-center-aligned md:text-5xl text-3xl font-bold px-4">
                    {page.title}
                </div>
            </div>
          </div>
      ) : (
          <div className="ts-content is-tertiary is-fitted h-48 flex items-center justify-center mb-8 mt-4">
              <div className="ts-header is-huge is-center-aligned">{page.title}</div>
          </div>
      )}

      <div className="ts-container section-padding py-12">
        <div className="ts-content">
            {isHtml ? (
                <div dangerouslySetInnerHTML={{ __html: page.content }} />
            ) : (
                <div data-color-mode="light">
                    <MDEditor.Markdown source={page.content} style={{ whiteSpace: 'pre-wrap', backgroundColor: 'transparent' }} />
                </div>
            )}
        </div>
      </div>
    </PublicLayout>
  );
}
