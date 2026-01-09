import { nanoid } from "nanoid";
import type { Article, Page, Category, SiteSettings, User, Role, Event, Media } from "@/types";
import placeholderImg from "@/assets/placeholder.jpg";

const STORAGE_KEY_ARTICLES = "tocas_cms_articles";
const STORAGE_KEY_PAGES = "tocas_cms_pages";
const STORAGE_KEY_CATEGORIES = "tocas_cms_categories";
const STORAGE_KEY_SETTINGS = "tocas_cms_settings";
const STORAGE_KEY_USERS = "tocas_cms_users";
const STORAGE_KEY_ROLES = "tocas_cms_roles";
const STORAGE_KEY_EVENTS = "tocas_cms_events";
const STORAGE_KEY_MEDIA = "tocas_cms_media";

// Seed Roles
const seedRoles: Role[] = [
  {
    id: "role_admin",
    name: "系統管理員 (Admin)",
    description: "擁有系統所有權限",
    permissions: [
      'view_dashboard',
      'manage_articles',
      'manage_categories',
      'manage_pages',
      'manage_users',
      'manage_roles',
      'manage_settings',
      'manage_events',
      'manage_media'
    ]
  },
  {
    id: "role_editor",
    name: "內容編輯 (Editor)",
    description: "可管理文章與頁面",
    permissions: [
      'view_dashboard',
      'manage_articles',
      'manage_categories',
      'manage_pages',
      'manage_events',
      'manage_media'
    ]
  },
  {
    id: "role_user",
    name: "一般使用者 (User)",
    description: "僅基本存取權限",
    permissions: []
  }
];

// Seed Users
const seedUsers: User[] = [
  {
    id: "admin_1",
    email: "admin@example.com",
    password: "password",
    name: "System Admin",
    roleId: "role_admin",
    createdAt: new Date().toISOString()
  }
];

// Seed Categories
const seedCategories: Category[] = [
  { id: "cat_1", name: "技術教學", slug: "tech-tutorial", color: "is-info", createdAt: new Date().toISOString() },
  { id: "cat_2", name: "系統公告", slug: "announcement", color: "is-warning", createdAt: new Date().toISOString() },
  { id: "cat_3", name: "生活隨筆", slug: "life", color: "is-success", createdAt: new Date().toISOString() },
];

// Seed Articles
const seedArticles: Article[] = [
  {
    id: "1",
    title: "歡迎使用 Tocas CMS",
    summary: "這是一個基於 Tocas UI 的內容管理系統範例。",
    content: "## 歡迎\n\nTocas CMS 是一個輕量級的 React 應用程式。\n\n它具備以下功能：\n- 文章管理\n- 頁面管理\n- RWD 響應式設計\n- Tocas UI 主題",
    coverImage: placeholderImg,
    status: "published",
    categoryId: "cat_2",
    tags: ["公告", "Tocas UI"],
    isSticky: true,
    stickyOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Tocas UI 的設計哲學",
    summary: "探討 Tocas UI 如何透過簡潔的類別名稱實現模組化設計。",
    content: "Tocas UI 是一套來自台灣的 CSS 框架...",
    coverImage: placeholderImg,
    status: "published",
    categoryId: "cat_1",
    tags: ["CSS", "Frontend", "Design"],
    isSticky: false,
    stickyOrder: 0,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  }
];

// Seed Pages
const seedPages: Page[] = [
  {
    id: "about",
    title: "關於我們",
    slug: "about",
    status: "published",
    content: `
<div class="ts-content is-center-aligned">
    <div class="ts-header is-huge">致力於創新與卓越</div>
    <div class="ts-text is-large is-secondary mt-2">我們是一群充滿熱情的開發者，專注於打造最佳的 Web 體驗。</div>
</div>
<div class="ts-divider is-section"></div>
<div class="ts-grid is-3-columns is-relaxed">
    <div class="column">
        <div class="ts-box h-full">
            <div class="ts-content">
                <div class="ts-header is-big mb-2">我們的使命</div>
                <p>透過技術創新，為客戶提供穩定、高效且美觀的數位解決方案，協助企業進行數位轉型。</p>
            </div>
        </div>
    </div>
    <div class="column">
        <div class="ts-box h-full">
            <div class="ts-content">
                <div class="ts-header is-big mb-2">我們的願景</div>
                <p>成為業界領先的 CMS 解決方案提供者，讓每個人都能輕鬆建立屬於自己的網站。</p>
            </div>
        </div>
    </div>
    <div class="column">
        <div class="ts-box h-full">
            <div class="ts-content">
                <div class="ts-header is-big mb-2">核心價值</div>
                <p>誠信、創新、用戶至上。我們相信好的產品源自於對細節的堅持與對用戶需求的深刻理解。</p>
            </div>
        </div>
    </div>
</div>
    `,
    updatedAt: new Date().toISOString()
  },
  {
    id: "contact",
    title: "聯絡我們",
    slug: "contact",
    status: "published",
    content: `
<div class="ts-grid is-2-columns is-relaxed is-stackable">
    <div class="column">
        <div class="ts-header is-huge mb-4">與我們聯繫</div>
        <p class="ts-text is-large is-secondary mb-6">有任何問題或合作需求？歡迎隨時填寫表單或透過以下方式聯繫我們。</p>
    </div>
    <div class="column">
        <div class="ts-box">
            <div class="ts-content">
                <div class="ts-field"><label>姓名</label><div class="ts-input"><input type="text"></div></div>
                <div class="ts-field mt-4"><label>Email</label><div class="ts-input"><input type="email"></div></div>
                <button class="ts-button is-primary is-fluid mt-6">送出訊息</button>
            </div>
        </div>
    </div>
</div>
    `,
    updatedAt: new Date().toISOString()
  }
];

const seedSettings: SiteSettings = {
  isSetup: false, // Default to false to trigger wizard
  siteName: "My Tocas Site",
  enableRegistration: false,
  themeMode: 'auto',
  
  postsPerPage: 6,
  maintenance: {
      enabled: true, // Default closed until admin opens it
      reason: "網站進行例行性維護，請稍後再試。"
  },

  heroTitle: "歡迎來到 Tocas CMS",
  heroDescription: "探索最新的技術文章與資訊，打造極致的閱讀體驗。",
  footerText: "© 2026 Tocas UI CMS Project. All rights reserved.",
  footerDescription: "Tocas CMS 致力於提供最簡潔、高效的網站建置方案。",
  footerBackgroundColor: "#f7f7f7",
  footerTextColor: "#5c5c5c",
  socialLinks: {
    facebook: "https://facebook.com",
    twitter: "https://twitter.com",
    github: "https://github.com/teacat/tocas"
  },
  contactInfo: {
    address: "台北市信義區",
    phone: "+886 2 1234 5678",
    email: "contact@example.com"
  }
};

const seedEvents: Event[] = [
    {
        id: "ev_1",
        title: "Tocas CMS 發布會",
        description: "我們將正式發布 Tocas CMS v1.0，歡迎共襄盛舉。",
        startDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
        location: "台北國際會議中心",
        createdAt: new Date().toISOString()
    }
];

export const db = {
  roles: {
    getAll: (): Role[] => {
      const data = localStorage.getItem(STORAGE_KEY_ROLES);
      if (!data) {
        localStorage.setItem(STORAGE_KEY_ROLES, JSON.stringify(seedRoles));
        return seedRoles;
      }
      return JSON.parse(data);
    },
    getById: (id: string): Role | undefined => {
      const roles = db.roles.getAll();
      return roles.find(r => r.id === id);
    },
    create: (role: Omit<Role, "id">): Role => {
      const roles = db.roles.getAll();
      const newRole: Role = { ...role, id: nanoid() };
      localStorage.setItem(STORAGE_KEY_ROLES, JSON.stringify([...roles, newRole]));
      return newRole;
    },
    update: (id: string, updates: Partial<Role>) => {
      const roles = db.roles.getAll();
      const index = roles.findIndex(r => r.id === id);
      if (index !== -1) {
        roles[index] = { ...roles[index], ...updates };
        localStorage.setItem(STORAGE_KEY_ROLES, JSON.stringify(roles));
      }
    },
    delete: (id: string) => {
      const roles = db.roles.getAll();
      if (id === 'role_admin') return; 
      const newRoles = roles.filter(r => r.id !== id);
      localStorage.setItem(STORAGE_KEY_ROLES, JSON.stringify(newRoles));
    }
  },
  users: {
    getAll: (): User[] => {
      const data = localStorage.getItem(STORAGE_KEY_USERS);
      if (!data) {
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(seedUsers));
        return seedUsers;
      }
      return JSON.parse(data);
    },
    getByEmail: (email: string): User | undefined => {
      const users = db.users.getAll();
      return users.find(u => u.email === email);
    },
    create: (user: Omit<User, "id" | "createdAt">): User => {
      const users = db.users.getAll();
      const newUser: User = {
        ...user,
        id: nanoid(),
        createdAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify([...users, newUser]));
      return newUser;
    },
    update: (id: string, updates: Partial<User>) => {
      const users = db.users.getAll();
      const index = users.findIndex(u => u.id === id);
      if (index !== -1) {
        users[index] = { ...users[index], ...updates };
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
      }
    },
    delete: (id: string) => {
      const users = db.users.getAll();
      const newUsers = users.filter(u => u.id !== id);
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(newUsers));
    }
  },
  categories: {
    getAll: (): Category[] => {
      const data = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      if (!data) {
        localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(seedCategories));
        return seedCategories;
      }
      return JSON.parse(data);
    },
    create: (data: Omit<Category, "id" | "createdAt">): Category => {
      const categories = db.categories.getAll();
      const newCat: Category = {
        ...data,
        id: nanoid(),
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify([newCat, ...categories]));
      return newCat;
    },
    delete: (id: string) => {
      const categories = db.categories.getAll();
      const newCategories = categories.filter((c) => c.id !== id);
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(newCategories));
    }
  },
  articles: {
    getAll: (): Article[] => {
      const data = localStorage.getItem(STORAGE_KEY_ARTICLES);
      if (!data) {
        localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(seedArticles));
        return seedArticles;
      }
      return JSON.parse(data);
    },
    getById: (id: string): Article | undefined => {
      const articles = db.articles.getAll();
      return articles.find((a) => a.id === id);
    },
    create: (article: Omit<Article, "id" | "createdAt" | "updatedAt">): Article => {
      const articles = db.articles.getAll();
      const newArticle: Article = {
        ...article,
        id: nanoid(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify([newArticle, ...articles]));
      return newArticle;
    },
    update: (id: string, updates: Partial<Omit<Article, "id" | "createdAt">>): Article | null => {
      const articles = db.articles.getAll();
      const index = articles.findIndex((a) => a.id === id);
      if (index === -1) return null;
      
      const updatedArticle = {
        ...articles[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      articles[index] = updatedArticle;
      localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(articles));
      return updatedArticle;
    },
    delete: (id: string) => {
      const articles = db.articles.getAll();
      const newArticles = articles.filter((a) => a.id !== id);
      localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(newArticles));
    },
    deleteMany: (ids: string[]) => {
      const articles = db.articles.getAll();
      const newArticles = articles.filter((a) => !ids.includes(a.id));
      localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(newArticles));
    },
  },
  pages: {
    getAll: (): Page[] => {
      const data = localStorage.getItem(STORAGE_KEY_PAGES);
      if (!data) {
        localStorage.setItem(STORAGE_KEY_PAGES, JSON.stringify(seedPages));
        return seedPages;
      }
      return JSON.parse(data);
    },
    getById: (id: string): Page | undefined => {
      const pages = db.pages.getAll();
      return pages.find((p) => p.id === id);
    },
    getBySlug: (slug: string): Page | undefined => {
      const pages = db.pages.getAll();
      return pages.find((p) => p.slug === slug);
    },
    create: (page: Omit<Page, "id" | "updatedAt">): Page => {
        const pages = db.pages.getAll();
        const newPage: Page = {
            ...page,
            id: nanoid(),
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEY_PAGES, JSON.stringify([...pages, newPage]));
        return newPage;
    },
    update: (id: string, updates: Partial<Omit<Page, "id">>): Page | null => {
        const pages = db.pages.getAll();
        const index = pages.findIndex(p => p.id === id);
        if (index === -1) return null;
        
        const updatedPage = { ...pages[index], ...updates, updatedAt: new Date().toISOString() };
        pages[index] = updatedPage;
        localStorage.setItem(STORAGE_KEY_PAGES, JSON.stringify(pages));
        return updatedPage;
    },
    delete: (id: string) => {
        const pages = db.pages.getAll();
        const newPages = pages.filter(p => p.id !== id);
        localStorage.setItem(STORAGE_KEY_PAGES, JSON.stringify(newPages));
    },
    deleteMany: (ids: string[]) => {
        const pages = db.pages.getAll();
        const newPages = pages.filter(p => !ids.includes(p.id));
        localStorage.setItem(STORAGE_KEY_PAGES, JSON.stringify(newPages));
    }
  },
  events: {
    getAll: (): Event[] => {
        const data = localStorage.getItem(STORAGE_KEY_EVENTS);
        if (!data) {
            localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(seedEvents));
            return seedEvents;
        }
        return JSON.parse(data);
    },
    getById: (id: string): Event | undefined => {
        const events = db.events.getAll();
        return events.find(e => e.id === id);
    },
    create: (event: Omit<Event, "id" | "createdAt">): Event => {
        const events = db.events.getAll();
        const newEvent: Event = {
            ...event,
            id: nanoid(),
            createdAt: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify([...events, newEvent]));
        return newEvent;
    },
    update: (id: string, updates: Partial<Omit<Event, "id" | "createdAt">>): Event | null => {
        const events = db.events.getAll();
        const index = events.findIndex(e => e.id === id);
        if (index === -1) return null;
        
        const updatedEvent = { ...events[index], ...updates };
        events[index] = updatedEvent;
        localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
        return updatedEvent;
    },
    delete: (id: string) => {
        const events = db.events.getAll();
        const newEvents = events.filter(e => e.id !== id);
        localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(newEvents));
    }
  },
  media: {
    getAll: (): Media[] => {
      const data = localStorage.getItem(STORAGE_KEY_MEDIA);
      return data ? JSON.parse(data) : [];
    },
    create: (media: Omit<Media, "id" | "createdAt">): Media => {
      const list = db.media.getAll();
      const newItem: Media = {
        ...media,
        id: nanoid(),
        createdAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY_MEDIA, JSON.stringify([newItem, ...list]));
      return newItem;
    },
    delete: (id: string) => {
      const list = db.media.getAll();
      const newList = list.filter(m => m.id !== id);
      localStorage.setItem(STORAGE_KEY_MEDIA, JSON.stringify(newList));
    },
    deleteMany: (ids: string[]) => {
      const list = db.media.getAll();
      const newList = list.filter(m => !ids.includes(m.id));
      localStorage.setItem(STORAGE_KEY_MEDIA, JSON.stringify(newList));
    }
  },
  settings: {
    get: (): SiteSettings => {
      const data = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (!data) {
        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(seedSettings));
        return seedSettings;
      }
      return JSON.parse(data);
    },
    update: (updates: Partial<SiteSettings>): SiteSettings => {
      const current = db.settings.get();
      const updated = { ...current, ...updates };
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
      return updated;
    }
  }
};
