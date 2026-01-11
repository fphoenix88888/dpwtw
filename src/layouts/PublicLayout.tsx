import { Link, useLocation } from "wouter";
import type { ReactNode } from "react";
import { useEffect, useState, useRef } from "react";
import { db } from "@/services/db";
import type { Page, SiteSettings } from "@/types";

export default function PublicLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [pages, setPages] = useState<Page[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const allPages = db.pages.getAll();
    setPages(allPages.filter(p => p.status === 'published'));
    setSettings(db.settings.get());

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const footerStyle = {
      backgroundColor: settings?.footerBackgroundColor,
      color: settings?.footerTextColor
  };

  const footerHeaderStyle = {
      color: settings?.footerTextColor
  };

  const footerLinkClass = settings?.footerTextColor ? "hover:opacity-80 transition-opacity" : "ts-text is-secondary hover:text-primary transition-colors";

  const rootPages = pages.filter(p => !p.parentId);
  const getSubPages = (parentId: string) => pages.filter(p => p.parentId === parentId);

  // Navigation Items
  const getNavItems = () => {
      const items: any[] = [];
      items.push({ id: 'home', title: '首頁', href: '/', order: 0 });

      rootPages.forEach(page => {
          let order = 50;
          if (page.slug === 'services') order = 20;
          if (page.slug === 'contact') order = 100;
          if (page.slug === 'about') order = 10;
          
          const subPages = pages.filter(p => p.parentId === page.id);
          
          items.push({
              id: page.id,
              title: page.title,
              href: `/p/${page.slug}`, // Will be updated in next task
              order,
              subPages: subPages.length > 0 ? subPages : undefined
          });
      });

      items.push({ id: 'events', title: '活動日曆', href: '/events', order: 25 });
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
            <div className="column" ref={navRef}>
              <nav className="ts-tab">
                {navItems.map(item => {
                    if (item.subPages) {
                        const isActive = activeDropdown === item.id;
                        return (
                            <div 
                                key={item.id} 
                                className={`item is-dropdown ${isActive ? 'is-active' : ''}`}
                                onMouseEnter={() => setActiveDropdown(item.id)}
                                onMouseLeave={() => setActiveDropdown(null)}
                                onClick={() => toggleDropdown(item.id)}
                            >
                                <div className="text">
                                    {item.title}
                                    <span className="ts-icon is-angle-down-icon ml-1 is-tiny"></span>
                                </div>
                                <div className="menu" style={{ display: isActive ? 'block' : 'none', position: 'absolute', zIndex: 100 }}>
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
              {/* Footer columns same as before */}
              <div className="column">
                  <div className="ts-header is-heavy is-big mb-4" style={footerHeaderStyle}>
                      {settings?.siteName || "My Tocas Site"}
                  </div>
                  <p className={`ts-text mb-6 ${!settings?.footerTextColor ? 'is-secondary' : ''}`}>
                      {settings?.footerDescription || "這是一個基於 Tocas UI 建置的範例網站。"}
                  </p>
                  <div className="ts-buttons is-icon is-secondary is-dense">
                      {/* Social Links */}
                      {settings?.socialLinks?.facebook && <a href={settings.socialLinks.facebook} target="_blank" className="ts-button"><span className="ts-icon fa-brands fa-facebook"></span></a>}
                      {settings?.socialLinks?.twitter && <a href={settings.socialLinks.twitter} target="_blank" className="ts-button"><span className="ts-icon fa-brands fa-twitter"></span></a>}
                      {settings?.socialLinks?.instagram && <a href={settings.socialLinks.instagram} target="_blank" className="ts-button"><span className="ts-icon fa-brands fa-instagram"></span></a>}
                      {settings?.socialLinks?.github && <a href={settings.socialLinks.github} target="_blank" className="ts-button"><span className="ts-icon fa-brands fa-github"></span></a>}
                  </div>
              </div>

              <div className="column">
                  <div className="ts-header is-heavy mb-4" style={footerHeaderStyle}>快速連結</div>
                  <div className="flex flex-col gap-2">
                      <Link href="/sitemap" className={footerLinkClass}>網站導覽</Link>
                      {navItems.map(item => (
                          <Link key={item.id} href={item.href} className={footerLinkClass}>
                              {item.title}
                          </Link>
                      ))}
                  </div>
              </div>

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
