import { Router, Route, Switch, useLocation } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import { db } from "@/services/db";

// Public Pages
import Home from "@/pages/public/Home";
import ArticleList from "@/pages/public/ArticleList";
import ArticleDetail from "@/pages/public/ArticleDetail";
import PageDetail from "@/pages/public/PageDetail";
import Events from "@/pages/public/Events";
import Sitemap from "@/pages/public/Sitemap";
import Maintenance from "@/pages/Maintenance";
import Setup from "@/pages/Setup";
import NotFound from "@/pages/NotFound";

// Admin Pages
import Login from "@/pages/admin/Login";
import Register from "@/pages/admin/Register";
import Dashboard from "@/pages/admin/Dashboard";
import AdminArticleList from "@/pages/admin/ArticleList";
import AdminArticleEditor from "@/pages/admin/ArticleEditor";
import AdminPageList from "@/pages/admin/PageList";
import AdminPageEditor from "@/pages/admin/PageEditor";
import AdminCategoryList from "@/pages/admin/CategoryList";
import AdminUserList from "@/pages/admin/UserList";
import AdminUserEditor from "@/pages/admin/UserEditor";
import AdminRoleList from "@/pages/admin/RoleList";
import AdminRoleEditor from "@/pages/admin/RoleEditor";
import AdminSettings from "@/pages/admin/Settings";
import AdminEventList from "@/pages/admin/EventList";
import AdminEventEditor from "@/pages/admin/EventEditor";
import AdminSystemInfo from "@/pages/admin/SystemInfo";
import AdminMediaLibrary from "@/pages/admin/MediaLibrary";

function AppRouter() {
  const [location, setLocation] = useLocation();
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isSetup, setIsSetup] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check Setup Status
    const checkSetup = () => {
        const settings = db.settings.get();
        const setupStatus = settings.isSetup === undefined ? false : settings.isSetup;
        setIsSetup(setupStatus);
        
        if (!setupStatus) {
            if (location !== "/setup") {
                setLocation("/setup");
            }
        } else {
            if (location === "/setup") {
                setLocation("/");
            }
        }
        setLoading(false);
    };

    checkSetup();
    window.addEventListener('tocas-settings-updated', checkSetup);

    // Check Maintenance
    const checkMaintenance = () => {
        const settings = db.settings.get();
        const m = settings.maintenance;
        
        if (!m || !m.enabled) {
            setIsMaintenance(false);
            return;
        }

        if (m.startTime && m.endTime) {
            const now = new Date();
            const start = new Date(m.startTime);
            const end = new Date(m.endTime);
            if (now >= start && now <= end) {
                setIsMaintenance(true);
                return;
            }
        } else {
            setIsMaintenance(true);
        }
    };

    checkMaintenance();
    const interval = setInterval(checkMaintenance, 60000);
    window.addEventListener('tocas-settings-updated', checkMaintenance);

    return () => {
        clearInterval(interval);
        window.removeEventListener('tocas-settings-updated', checkMaintenance);
        window.removeEventListener('tocas-settings-updated', checkSetup);
    };
  }, [location, setLocation]);

  if (loading) return null;

  if (!isSetup) {
      if (location !== "/setup") {
          return <Setup />;
      }
      return (
          <Switch>
              <Route path="/setup" component={Setup} />
              <Route component={() => null} />
          </Switch>
      );
  }

  if (isMaintenance && !location.startsWith("/admin")) {
      return <Maintenance />;
  }

  return (
      <Switch>
        {/* Public Routes */}
        <Route path="/" component={Home} />
        <Route path="/articles" component={ArticleList} />
        <Route path="/articles/:id" component={ArticleDetail} />
        <Route path="/p/:slug" component={PageDetail} />
        <Route path="/events" component={Events} />
        <Route path="/sitemap" component={Sitemap} />
        
        <Route path="/setup" component={Setup} />

        {/* Admin Routes */}
        <Route path="/admin/login" component={Login} />
        <Route path="/admin/register" component={Register} />
        
        <Route path="/admin" component={Dashboard} />
        <Route path="/admin/dashboard" component={Dashboard} />
        
        <Route path="/admin/articles" component={AdminArticleList} />
        <Route path="/admin/articles/new" component={AdminArticleEditor} />
        <Route path="/admin/articles/edit/:id" component={AdminArticleEditor} />
        
        <Route path="/admin/categories" component={AdminCategoryList} />
        
        <Route path="/admin/pages" component={AdminPageList} />
        <Route path="/admin/pages/new" component={AdminPageEditor} />
        <Route path="/admin/pages/edit/:id" component={AdminPageEditor} />
        
        <Route path="/admin/users" component={AdminUserList} />
        <Route path="/admin/users/new" component={AdminUserEditor} />
        <Route path="/admin/users/edit/:id" component={AdminUserEditor} />
        
        <Route path="/admin/roles" component={AdminRoleList} />
        <Route path="/admin/roles/new" component={AdminRoleEditor} />
        <Route path="/admin/roles/edit/:id" component={AdminRoleEditor} />
        
        <Route path="/admin/events" component={AdminEventList} />
        <Route path="/admin/events/new" component={AdminEventEditor} />
        <Route path="/admin/events/edit/:id" component={AdminEventEditor} />
        
        <Route path="/admin/settings" component={AdminSettings} />
        <Route path="/admin/system" component={AdminSystemInfo} />
        <Route path="/admin/media" component={AdminMediaLibrary} />
        
        {/* Fallback */}
        <Route component={NotFound} />
      </Switch>
  );
}

function App() {
  useEffect(() => {
    const updateFavicon = () => {
        const settings = db.settings.get();
        if (settings.faviconUrl) {
            let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.getElementsByTagName('head')[0].appendChild(link);
            }
            link.href = settings.faviconUrl;
        }
    };
    
    updateFavicon();
    window.addEventListener('storage', updateFavicon);
    window.addEventListener('tocas-settings-updated', updateFavicon);
    
    return () => {
        window.removeEventListener('storage', updateFavicon);
        window.removeEventListener('tocas-settings-updated', updateFavicon);
    };
  }, []);

  return (
    <ErrorBoundary>
      <Toaster />
      <Router hook={useHashLocation}>
        <AppRouter />
      </Router>
    </ErrorBoundary>
  );
}

export default App;
