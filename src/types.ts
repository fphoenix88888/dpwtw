export interface Category {
  id: string;
  name: string;
  slug: string;
  color?: string;
  createdAt: string;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  coverImage: string;
  status: 'draft' | 'published';
  categoryId?: string;
  tags?: string[];
  isSticky?: boolean;
  stickyOrder?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: 'draft' | 'published';
  parentId?: string;
  coverImage?: string;
  order?: number; // New field
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location?: string;
  createdAt: string;
}

export interface Media {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string;
  createdAt: string;
}

export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  github?: string;
}

export interface ContactInfo {
  address?: string;
  phone?: string;
  email?: string;
}

export interface MaintenanceSettings {
  enabled: boolean;
  startTime?: string;
  endTime?: string;
  reason?: string;
}

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface SiteSettings {
  isSetup: boolean;
  siteName: string;
  logoUrl?: string;
  faviconUrl?: string;
  enableRegistration: boolean;
  themeMode: ThemeMode;
  
  postsPerPage: number;

  maintenance: MaintenanceSettings;

  heroTitle?: string;
  heroDescription?: string;

  footerText: string;
  footerDescription?: string;
  footerBackgroundColor?: string;
  footerTextColor?: string;
  
  socialLinks?: SocialLinks;
  contactInfo?: ContactInfo;
}

export type UserRole = 'admin' | 'editor' | 'user';

export type Permission = 
  | 'view_dashboard'
  | 'manage_articles'
  | 'manage_categories'
  | 'manage_pages'
  | 'manage_users'
  | 'manage_roles'
  | 'manage_settings'
  | 'manage_events'
  | 'manage_media';

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
  description?: string;
}

export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  roleId: string;
  createdAt: string;
}
