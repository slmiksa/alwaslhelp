import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Home, Settings, FileText, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase, SiteSettings } from '@/integrations/supabase/client';
import { useTheme } from '@/contexts/ThemeContext';
const DEFAULT_SETTINGS = {
  primary_color: '#15437f',
  text_color: '#ffffff'
};
const AdminHeader = () => {
  const {
    logout,
    hasPermission,
    currentAdmin,
    isAuthenticated
  } = useAdminAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [settingsInitialized, setSettingsInitialized] = useState(false);
  const {
    theme,
    toggleTheme
  } = useTheme();
  
  useEffect(() => {
    fetchSiteSettings();
  }, []);
  
  const fetchSiteSettings = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('site_settings').select('primary_color, text_color').single();
      if (error) {
        if (error.code !== 'PGRST116') {
          // Not found error
          console.error('Error fetching site settings:', error);
        }
        setSettingsInitialized(true);
        return;
      }
      if (data) {
        setSettings({
          primary_color: data.primary_color,
          text_color: data.text_color
        });
      }
      setSettingsInitialized(true);
    } catch (error) {
      console.error('Error:', error);
      setSettingsInitialized(true);
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  // Check for ticket parameter in URL to redirect to ticket details
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ticketId = params.get('ticket');
    
    // If there's a ticket ID in the URL and user is authenticated, redirect to ticket details
    if (ticketId && isAuthenticated) {
      navigate(`/admin/tickets/${ticketId}`);
    }
  }, [navigate, isAuthenticated]);

  // Don't render until settings are initialized
  if (!settingsInitialized) {
    return null;
  }
  return <header style={{
    backgroundColor: settings.primary_color
  }} className="shadow-md">
      <div className="container mx-auto px-4 py-3 flex flex-wrap justify-between items-center">
        <div className="flex items-center space-x-2 mb-2 md:mb-0">
          <h1 className="text-2xl font-bold" style={{
          color: settings.text_color
        }}>لوحة تحكم FixDesk</h1>
          {currentAdmin && <span className="text-sm opacity-75 mr-2" style={{
          color: settings.text_color
        }}>
              ({currentAdmin.username})
            </span>}
        </div>
        <div className="flex items-center space-x-2 flex-wrap">
          <Button variant="outline" size="icon" className={`ml-2 mb-2 md:mb-0 ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white/90 text-gray-700 border-gray-200'}`} onClick={toggleTheme} title={theme === 'light' ? 'تفعيل الوضع المظلم' : 'تفعيل الوضع العادي'}>
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
          <Button variant="secondary" className="flex items-center space-x-2 ml-2 mb-2 md:mb-0" onClick={() => navigate('/admin/dashboard')}>
            <Home className="h-4 w-4 ml-1" />
            <span>الرئيسية</span>
          </Button>
          <Button variant="secondary" className="flex items-center space-x-2 ml-2 mb-2 md:mb-0" onClick={() => navigate('/admin/settings')}>
            <Settings className="h-4 w-4 ml-1" />
            <span>الإعدادات</span>
          </Button>
          <Button variant="destructive" className="flex items-center space-x-2 mb-2 md:mb-0" onClick={handleLogout}>
            <LogOut className="h-4 w-4 ml-1" />
            <span>تسجيل الخروج</span>
          </Button>
        </div>
      </div>
    </header>;
};
export default AdminHeader;
