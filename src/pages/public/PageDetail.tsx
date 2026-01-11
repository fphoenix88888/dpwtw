import PublicLayout from "@/layouts/PublicLayout";
import { db } from "@/services/db";
import type { Page } from "@/types";
import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import MDEditor from '@uiw/react-md-editor';
import Breadcrumb from "@/components/Breadcrumb";

export default function PageDetail() {
  const [match, params] = useRoute<any>("/p/:path*");
  const [page, setPage] = useState<Page | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<{ label: string; href?: string; active?: boolean }[]>([]);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (params?.path) {
      // Decode path segments
      const segments = params.path.split("/").map(s => decodeURIComponent(s));
      const currentSlug = segments[segments.length - 1];

      const allPages = db.pages.getAll();
      // Find candidate pages with the matching slug
      const candidate = allPages.find(p => p.slug === currentSlug && p.status === 'published');

      if (candidate) {
          // Verify path hierarchy
          let isValidPath = true;
          let current: Page | undefined = candidate;
          const pathCheck: string[] = [];

          // Trace back from candidate to root
          // This creates a chain: [child, parent, grandparent]
          // We need to match this against segments [grandparent, parent, child]
          const chain: Page[] = [];
          
          while (current) {
              chain.unshift(current);
              if (current.parentId) {
                  current = allPages.find(p => p.id === current?.parentId);
                  // If parent id exists but page not found, broken chain
                  if (!current) {
                      isValidPath = false;
                      break;
                  }
              } else {
                  current = undefined;
              }
          }

          // Check if chain slugs match URL segments
          if (isValidPath && chain.length === segments.length) {
              for (let i = 0; i < chain.length; i++) {
                  if (chain[i].slug !== segments[i]) {
                      isValidPath = false;
                      break;
                  }
              }
          } else {
              isValidPath = false;
          }

          if (isValidPath) {
              setPage(candidate);
              
              // Build breadcrumbs
              const crumbs = [
                  { label: "首頁", href: "/" },
                  ...chain.map((p, index) => ({
                      label: p.title,
                      href: index === chain.length - 1 ? undefined : `/p/${chain.slice(0, index + 1).map(c => c.slug).join('/')}`,
                      active: index === chain.length - 1
                  }))
              ];
              setBreadcrumbs(crumbs);
          } else {
              setPage(null);
          }
      } else {
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

  return (
    <PublicLayout>
      <div className="ts-container is-narrow pt-4">
          <Breadcrumb items={breadcrumbs} />
      </div>

      {page.coverImage ? (
          <div className="relative h-64 mt-4">
            <img 
              src={page.coverImage} 
              className="w-full h-full object-cover absolute inset-0" 
              alt={page.title} 
            />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="ts-header is-huge is-inverted is-center-aligned">{page.title}</div>
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
