import { Link, useLocation } from "wouter";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { db } from "@/services/db";
import type { Page, SiteSettings } from "@/types";

export default function PublicLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [pages, setPages] = useState<Page[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    // Fetch published pages for navigation
    const allPages = db.pages.getAll();
    setPages(allPages.filter(p => p.status === 'published'));
    
    // Fetch site settings
    setSettings(db.settings.get());
  }, []);

  const footerStyle = {
      backgroundColor: settings?.footerBackgroundColor,
      color: settings?.footerTextColor
  };

  const footerHeaderStyle = {
      color: settings?.footerTextColor
  };

  const footerLinkClass = settings?.footerTextColor ? "hover:opacity-80 transition-opacity" : "ts-text is-secondary hover:text-primary transition-colors";

  // Navigation Logic
  const getNavItems = () => {
      const items: any[] = [];
      
      // 1. Home
      items.push({ id: 'home', title: '首頁', href: '/', order: 0 });

      // 2. Dynamic Pages & Fixed Features
      // We assign weights to order them:
      // Home: 0
      // Services: 20
      // Events: 25 (Right of Services)
      // Blog: 90 (Left of Contact)
      // Contact: 100
      // Others: 50

      const rootPages = pages.filter(p => !p.parentId);
      
      rootPages.forEach(page => {
          let order = 50; // Default
          if (page.slug === 'services') order = 20;
          if (page.slug === 'contact') order = 100;
          if (page.slug === 'about') order = 10;
          
          // Check children
          const subPages = pages.filter(p => p.parentId === page.id);
          
          items.push({
              id: page.id,
              title: page.title,
              href: `/p/${page.slug}`,
              order,
              subPages: subPages.length > 0 ? subPages : undefined
          });
      });

      // Events (Right of Services -> 25)
      items.push({ id: 'events', title: '活動日曆', href: '/events', order: 25 });

      // Blog (Left of Contact -> 90)
      items.push({ id: 'blog', title: '站長日誌', href: '/articles', order: 90 });

      return items.sort((a, b) => a.order - b.order);
  };

  const navItems = getNavItems();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <div className="ts-content is-dense is-secondary">
        <div className="ts-container">
          <div className="ts-grid is-middle-aligned">
            <div className="column is-fluid">
              <Link href="/" className="ts-header is-heavy is-big flex items-center gap-3">
                {settings?.logoUrl ? (
                    <img src={settings.logoUrl} alt="Logo" className="h-8 w-auto object-contain" />
                ) : null}
                <span>{settings?.siteName || "My Tocas Site"}</span>
              </Link>
            </div>
            <div className="column">
              <nav className="ts-tab">
                {navItems.map(item => {
                    if (item.subPages) {
                        return (
                            <div key={item.id} className="item is-dropdown">
                                <div className="text">{item.title}</div>
                                <div className="menu">
                                    <Link href={item.href} className="item">
                                        {item.title} (主頁)
                                    </Link>
                                    {item.subPages.map((sub: Page) => (
                                        <Link key={sub.id} href={`/p/${sub.slug}`} className="item">
                                            {sub.title}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        );
                    }
                    return (
                        <Link 
                            key={item.id} 
                            href={item.href} 
                            className={`item ${location === item.href || (item.href !== '/' && location.startsWith(item.href)) ? 'is-active' : ''}`}
                        >
                            {item.title}
                        </Link>
                    );
                })}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <div 
        className={`ts-section is-fitted mt-12 ${!settings?.footerBackgroundColor ? 'is-secondary' : ''}`}
        style={footerStyle}
      >
        <div className="ts-container section-padding py-12">
          <div className="ts-grid is-3-columns is-relaxed is-stackable">
              
              {/* Column 1: Brand & Description */}
              <div className="column">
                  <div className="ts-header is-heavy is-big mb-4" style={footerHeaderStyle}>
                      {settings?.siteName || "My Tocas Site"}
                  </div>
                  <p className={`ts-text mb-6 ${!settings?.footerTextColor ? 'is-secondary' : ''}`}>
                      {settings?.footerDescription || "這是一個基於 Tocas UI 建置的範例網站。"}
                  </p>
                  <div className="ts-buttons is-icon is-secondary is-dense">
                      {settings?.socialLinks?.facebook && (
                          <a href={settings.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="ts-button">
                              <span className="ts-icon fa-brands fa-facebook"></span>
                          </a>
                      )}
                      {settings?.socialLinks?.twitter && (
                          <a href={settings.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="ts-button">
                              <span className="ts-icon fa-brands fa-twitter"></span>
                          </a>
                      )}
                      {settings?.socialLinks?.instagram && (
                          <a href={settings.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="ts-button">
                              <span className="ts-icon fa-brands fa-instagram"></span>
                          </a>
                      )}
                      {settings?.socialLinks?.github && (
                          <a href={settings.socialLinks.github} target="_blank" rel="noopener noreferrer" className="ts-button">
                              <span className="ts-icon fa-brands fa-github"></span>
                          </a>
                      )}
                  </div>
              </div>

              {/* Column 2: Quick Links */}
              <div className="column">
                  <div className="ts-header is-heavy mb-4" style={footerHeaderStyle}>快速連結</div>
                  <div className="flex flex-col gap-2">
                      <Link href="/sitemap" className={footerLinkClass}>網站導覽</Link>
                      {navItems.map(item => (
                          <Link key={item.id} href={item.href} className={footerLinkClass}>
                              {item.title}
                          </Link>
                      ))}
                      <Link href="/sitemap" className={footerLinkClass}>網站導覽</Link>
                  </div>
              </div>

              {/* Column 3: Contact Info */}
              <div className="column">
                  <div className="ts-header is-heavy mb-4" style={footerHeaderStyle}>聯絡資訊</div>
                  <div className={`flex flex-col gap-3 ${!settings?.footerTextColor ? 'text-gray-500' : ''}`}>
                      {settings?.contactInfo?.address && (
                          <div className="flex items-start gap-3">
                              <span className="ts-icon fa-solid fa-location-dot mt-1"></span>
                              <span>{settings.contactInfo.address}</span>
                          </div>
                      )}
                      {settings?.contactInfo?.phone && (
                          <div className="flex items-center gap-3">
                              <span className="ts-icon fa-solid fa-phone"></span>
                              <span>{settings.contactInfo.phone}</span>
                          </div>
                      )}
                      {settings?.contactInfo?.email && (
                          <div className="flex items-center gap-3">
                              <span className="ts-icon fa-solid fa-envelope"></span>
                              <a href={`mailto:${settings.contactInfo.email}`} className="hover:underline">
                                  {settings.contactInfo.email}
                              </a>
                          </div>
                      )}
                  </div>
              </div>
          </div>

          <div className={`ts-divider is-section ${settings?.footerTextColor ? 'opacity-20' : ''}`}></div>

          <div className="ts-content is-center-aligned">
            <p className={`ts-text is-small ${!settings?.footerTextColor ? 'is-secondary' : ''}`}>
              {settings?.footerText || "© 2026 Tocas UI CMS Project. All rights reserved."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
