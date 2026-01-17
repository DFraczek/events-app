import React, { useState } from 'react';
import {Link, useNavigate} from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';

interface LoginPageProps {
  onLogin: (data: { email: string; password: string }) => void;
  error?: string;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLocalError(null);

    try {
      await onLogin({ email, password });
      navigate('/');
    } catch (err: any) {
      console.error("Szczegóły błędu:", err);

      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;

        if (status === 401) {
          if (typeof data === 'string' && data.length > 0) {
            setLocalError(data);
          } else {
            setLocalError("Nieprawidłowy email lub hasło");
          }
        }
        else if (status === 403) {
          setLocalError(typeof data === 'string' ? data : "Dostęp zabroniony");
        }
        else {
          if (typeof data === 'string') {
            setLocalError(data);
          } else if (data && data.message) {
            setLocalError(data.message);
          } else {
            setLocalError("Wystąpił błąd logowania.");
          }
        }
      } else {
        setLocalError("Błąd połączenia z serwerem. Spróbuj później.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
        <div className="w-full max-w-sm p-6">
          <Card className="p-6 shadow-lg" style={{maxWidth: '1000px', margin: '0 auto'}}>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center size-12 bg-primary/10 rounded-full mb-3">
                <LogIn className="size-6 text-primary"/>
              </div>
              <h1 className="text-xl font-semibold mb-1">Witaj ponownie</h1>
              <p className="text-sm text-muted-foreground">
                Zaloguj się, aby kontynuować
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="space-y-1.5">
                <Label htmlFor="email"
                       className="flex items-center gap-2 text-xs uppercase text-muted-foreground font-bold tracking-wider mb-4">
                  <Mail className="size-3"/>
                  Email
                </Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="twoj@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password"
                       className="flex items-center gap-2 text-xs uppercase text-muted-foreground font-bold tracking-wider mb-4">
                  <Lock className="size-3"/>
                  Hasło
                </Label>
                <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="h-9"
                />
              </div>

              {(error || localError) && (
                  <div
                      className="flex items-center gap-3 p-3 rounded-md bg-destructive/15 border border-destructive/20 text-destructive animate-in fade-in slide-in-from-top-2 duration-300">
                    <AlertCircle className="size-5 shrink-0"/>
                    <p className="text-sm font-medium leading-tight">
                      {error || localError}
                    </p>
                  </div>
              )}

              <Button
                  type="submit"
                  className="w-full gap-2 mt-2"
                  disabled={isLoading}
                  size="sm"
              >
                <LogIn className="size-4"/>
                {isLoading ? 'Logowanie...' : 'Zaloguj się'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-s text-muted-foreground">
                Nie masz konta?{' '}
                <Link to="/register" className="text-primary hover:underline font-medium">
                  Zarejestruj się
                </Link>
              </p>
            </div>

          </Card>
        </div>
        </div>
        );
        };

        export default LoginPage;