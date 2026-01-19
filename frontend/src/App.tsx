import {BrowserRouter as Router, Routes, Route, Navigate, Outlet} from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { AllEventsPage } from './pages/AllEventsPage';
import { MyEventsPage } from './pages/MyEventsPage';
import { RegisteredEventsPage } from './pages/RegisteredEventsPage';
import { CalendarPage } from './pages/CalendarPage';
import { CreateEventPage } from './pages/CreateEventPage';
import { ProfilePage } from './pages/ProfilePage';
import { User } from './types/event';
import { Toaster } from './components/ui/sonner';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import api from './services/api';
import {ROUTES} from "./routes/config";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { user, isLoading } = useAuth();

    if (isLoading) return <div>Ładowanie...</div>;
    if (!user) return <Navigate to="/login" replace />;

    return <>{children || <Outlet />}</>;
};

const PublicRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { user, isLoading } = useAuth();

    if (isLoading) return null;

    if (user) return <Navigate to={ROUTES.HOME} replace />;

    return <>{children || <Outlet />}</>;
};

function AppRoutes() {
    const { user, login, register, isLoading } = useAuth();
    const [fullUser, setFullUser] = useState<User | null>(null);

    useEffect(() => {
        const fetchUserData = () => {
            if (user) {
                api.get('/users/me')
                    .then(res => setFullUser(res.data))
                    .catch(err => {
                        console.error("Błąd profilu:", err);
                        setFullUser(null);
                    });
            }
        };

        fetchUserData();

        window.addEventListener('profileUpdated', fetchUserData);

        return () => window.removeEventListener('profileUpdated', fetchUserData);
    }, [user]);

    const currentUser = fullUser || (user as User);
    const currentUserId = currentUser?.id?.toString();

  if (isLoading) {
    return (
        <div className="flex h-screen items-center justify-center font-medium text-zinc-400">
          Ładowanie...
        </div>
    );
  }

    return (
        <div className="min-h-screen bg-background">
            {user && (
                <Navigation
                    userName={`${currentUser.name || ''} ${currentUser.surname || ''}`.trim() || user.email}
                    userAvatar={currentUser.image_url}
                />
            )}

            <main className={user ? 'lg:ml-64 pt-16 lg:pt-0' : ''}>
                <Routes>
                    <Route element={<PublicRoute />}>
                        <Route path={ROUTES.LOGIN} element={<LoginPage onLogin={login} />} />
                        <Route path={ROUTES.REGISTER} element={<RegisterPage onRegister={register} />} />
                    </Route>

                    <Route element={<ProtectedRoute />}>
                        <Route path={ROUTES.HOME} element={<AllEventsPage currentUserId={currentUserId} />} />
                        <Route path={ROUTES.MY_EVENTS} element={<MyEventsPage currentUserId={currentUserId} />} />
                        <Route path={ROUTES.CALENDAR} element={<CalendarPage currentUserId={currentUserId} />} />
                        <Route path={ROUTES.REGISTERED} element={<RegisteredEventsPage currentUserId={currentUserId} />} />
                        <Route path={ROUTES.CREATE} element={<CreateEventPage currentUser={currentUser} />} />
                        <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
                    </Route>

                    <Route path="*" element={<Navigate to={user ? ROUTES.HOME : ROUTES.LOGIN} replace />} />
                </Routes>
            </main>
            <Toaster />
        </div>
    );
}

export default function App() {
  return (
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
  );
}