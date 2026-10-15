import { Link, useLocation } from 'react-router-dom';
import { Calendar, Home, PlusCircle, User, Menu, X, BookmarkCheck, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface NavigationProps {
  userName: string;
  userAvatar?: string;
}

export function Navigation({ userName, userAvatar }: NavigationProps) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout, user } = useAuth();
  const [profile, setProfile] = useState<{ name?: string; surname?: string; image_url?: string }>({});

  const fetchProfile = useCallback(() => {
    const token = localStorage.getItem('token');
    if (user && user.email && token) {
      axios.get('/api/users/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
          .then(res => setProfile(res.data))
          .catch(() => setProfile({ name: userName }));
    }
  }, [user, userName]);

  useEffect(() => {
    fetchProfile();
    window.addEventListener('profileUpdated', fetchProfile);
    return () => window.removeEventListener('profileUpdated', fetchProfile);
  }, [fetchProfile]);

  const navItems = [
    { path: '/', icon: Home, label: 'Wszystkie wydarzenia' },
    { path: '/my-events', icon: User, label: 'Moje wydarzenia' },
    { path: '/registered', icon: BookmarkCheck, label: 'Zapisane wydarzenia' },
    { path: '/calendar', icon: Calendar, label: 'Kalendarz' },
  ];

  const getInitials = (name?: string, surname?: string) => {
    if (!name && !surname) return '?';
    return `${name?.[0] || ''}${surname?.[0] || ''}`.toUpperCase();
  };

  return (
      <>
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b h-16 flex items-center justify-between px-4">
          <Link to="/">
            <h1 className="text-primary cursor-pointer font-bold">EventManager</h1>
          </Link>

          <div className="flex items-center gap-3">
            <Link to="/create">
              <Button size="sm" className="gap-2">
                <PlusCircle className="size-4" />
              </Button>
            </Link>

            <Link to="/profile">
              <Avatar className="size-9 cursor-pointer hover:ring-2 ring-ring transition-all">
                <AvatarImage src={profile.image_url || userAvatar} alt={userName} className="object-cover" />
                <AvatarFallback>{getInitials(profile.name || userName, profile.surname)}</AvatarFallback>
              </Avatar>
            </Link>

            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile sidebar overlay */}
        {isMobileMenuOpen && (
            <div
                className="lg:hidden fixed inset-0 bg-black/50 z-40 top-16"
                onClick={() => setIsMobileMenuOpen(false)}
            />
        )}

        {/* Sidebar */}
        <aside
            className={`
          fixed top-16 lg:top-0 left-0 h-[calc(100vh-4rem)] lg:h-screen w-64 bg-card border-r z-40
          flex flex-col
          transition-transform duration-300
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        >
          <div className="hidden lg:flex items-center h-16 px-6 border-b">
            <Link to="/">
              <h1 className="text-primary cursor-pointer font-bold">EventManager</h1>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                  <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block"
                  >
                    <Button
                        variant={isActive ? 'secondary' : 'ghost'}
                        className="w-full justify-start gap-3"
                    >
                      <Icon className="size-5" />
                      {item.label}
                    </Button>
                  </Link>
              );
            })}

            <div className="pt-4 mt-6">
              <Link to="/create" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full gap-2 bg-primary hover:bg-primary/90">
                  <PlusCircle className="size-4" />
                  Dodaj wydarzenie
                </Button>
              </Link>
            </div>
          </nav>

          {/* Bottom section - Desktop Profile Info */}
          <div className="hidden lg:flex flex-col gap-3 p-4 border-t">
            <Link to="/profile">
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                <Avatar className="size-10 border">
                  <AvatarImage src={profile.image_url || userAvatar} alt={profile.name || userName} className="object-cover" />
                  <AvatarFallback>{getInitials(profile.name || userName, profile.surname)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium truncate">
                    {profile.name ? `${profile.name} ${profile.surname || ''}` : userName}
                  </p>
                  <p className="text-xs text-muted-foreground">Zobacz profil</p>
                </div>
              </div>
            </Link>

            <Button
                variant="outline"
                className="w-full gap-2 justify-center border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all font-medium"
                onClick={logout}
            >
              <LogOut className="size-4" />
              Wyloguj
            </Button>
          </div>
        </aside>
      </>
  );
}