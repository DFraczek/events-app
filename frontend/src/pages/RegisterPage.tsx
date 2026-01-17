import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';

interface RegisterPageProps {
  onRegister: (data: { name: string, surname: string, email: string; password: string }) => void;
  error?: string;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister, error }) => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const nameRegex = /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s-]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLocalError(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setLocalError("Imię jest wymagane.");
      setIsLoading(false);
      return;
    }
    if (!nameRegex.test(name)) {
      setLocalError("Imię zawiera niedozwolone znaki.");
      setIsLoading(false);
      return;
    }
    if (!surname.trim()) {
      setLocalError("Nazwisko jest wymagane.");
      setIsLoading(false);
      return;
    }
    if (!nameRegex.test(surname)) {
      setLocalError("Nazwisko zawiera niedozwolone znaki.");
      setIsLoading(false);
      return;
    }
    if (!emailRegex.test(email)) {
      setLocalError("Podaj poprawny adres email.");
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
      setLocalError("Hasło musi mieć co najmniej 6 znaków.");
      setIsLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setLocalError("Hasła nie są identyczne.");
      setIsLoading(false);
      return;
    }

    try {
      await onRegister({ name, surname, email, password });

      setSuccessMessage("Konto zostało utworzone pomyślnie! Możesz się teraz zalogować.");

      setName('');
      setSurname('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');

    } catch (err: any) {
      console.error("Błąd w RegisterPage:", err);

      if (err.response) {
        const data = err.response.data;
        if (typeof data === 'string' && data.length > 0) {
          setLocalError(data);
        } else if (data && data.message) {
          setLocalError(data.message);
        } else {
          setLocalError("Wystąpił błąd rejestracji.");
        }
      } else {
        setLocalError("Błąd połączenia z serwerem.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-6">
        <div className="w-full max-w-sm p-6">
          <Card className="p-6 shadow-lg" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center size-12 bg-primary/10 rounded-full mb-3">
                <UserPlus className="size-6 text-primary" />
              </div>
              <h1 className="text-xl font-semibold mb-1">Utwórz konto</h1>
              <p className="text-sm text-muted-foreground">
                Zarejestruj się, aby zarządzać wydarzeniami
              </p>
            </div>

            <div
                className="space-y-4"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSubmit(e);
                }}
            >
              {(error || localError) && (
                  <div className="flex items-center gap-3 p-3 rounded-md bg-destructive/15 border border-destructive/20 text-destructive animate-in fade-in slide-in-from-top-2 duration-300">
                    <AlertCircle className="size-5 shrink-0" />
                    <p className="text-sm font-medium leading-tight">{error || localError}</p>
                  </div>
              )}

              {successMessage && (
                  <div className="flex items-center gap-3 p-3 rounded-md bg-green-500/15 border border-green-500/20 text-green-700 animate-in fade-in slide-in-from-top-2 duration-300">
                    <CheckCircle className="size-5 shrink-0" />
                    <p className="text-sm font-medium leading-tight">{successMessage}</p>
                  </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs uppercase text-muted-foreground font-bold tracking-wider mb-4">Imię</Label>
                  <Input
                      id="name"
                      type="text"
                      placeholder="Jan"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="surname" className="text-xs uppercase text-muted-foreground font-bold tracking-wider mb-4">Nazwisko</Label>
                  <Input
                      id="surname"
                      type="text"
                      placeholder="Kowalski"
                      value={surname}
                      onChange={(e) => setSurname(e.target.value)}
                      className="h-9"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="flex items-center gap-2 text-xs uppercase text-muted-foreground font-bold tracking-wider mb-4">
                  <Mail className="size-3" /> Email
                </Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="twoj@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="flex items-center gap-2 text-xs uppercase text-muted-foreground font-bold tracking-wider mb-4">
                  <Lock className="size-3" /> Hasło
                </Label>
                <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="flex items-center gap-2 text-xs uppercase text-muted-foreground font-bold tracking-wider mb-4">
                  <Lock className="size-3" /> Potwierdź hasło
                </Label>
                <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-9"
                />
              </div>

              <Button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full gap-2 mt-2"
                  disabled={isLoading}
                  size="sm"
              >
                <UserPlus className="size-4" />
                {isLoading ? 'Tworzenie konta...' : 'Zarejestruj się'}
              </Button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-s text-muted-foreground">
                Masz już konto?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Zaloguj się
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
  );
};

export default RegisterPage;