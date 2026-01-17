import React, { useState, useEffect, ReactNode, useRef } from 'react';
import { Mail, FileText, MapPin, Camera, Loader2, Trash2 } from 'lucide-react';
import { User } from '../types/event';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { MapPreview } from '../components/MapPreview';
import { toast } from 'sonner';
import axios from 'axios';
import api, {getOrganizedEventsCount, getRegisteredEventsCount} from '../services/api';

interface FormErrors {
  name?: string;
  surname?: string;
}

const geocodeAddressSimulated = async (address: string): Promise<{ lat: number; lng: number } | null> => {
  if (!address || address.length < 5) return null;
  await new Promise(resolve => setTimeout(resolve, 500));
  const baseCoords = { lat: 51.2465, lng: 22.5684 };
  const offset = Math.random() * 0.05;
  return {
    lat: baseCoords.lat + (Math.random() > 0.5 ? offset : -offset),
    lng: baseCoords.lng + (Math.random() > 0.5 ? offset : -offset)
  };
};

export function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<User | null>(null);
  const [stats, setStats] = useState({ organized: 0, registered: 0, past: 0 });

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isUploading, setIsUploading] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const [userRes, organizedRes, registeredRes] = await Promise.all([
          api.get('/users/me'),
          getOrganizedEventsCount(),
          getRegisteredEventsCount()
        ]);

        setUser(userRes.data);
        setFormData(userRes.data);
        setStats({
          organized: organizedRes.data,
          registered: registeredRes.data,
          past: 0
        });
      } catch (err) {
        toast.error("Nie udało się pobrać danych profilu");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  // Geokodowanie adresu
  useEffect(() => {
    const address = formData?.location;
    if (!address || address.length < 5) {
      setCoordinates(undefined);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsGeocoding(true);
      const coords = await geocodeAddressSimulated(address);
      setCoordinates(coords || undefined);
      setIsGeocoding(false);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [formData?.location]);

  if (loading) return <div className="flex h-screen items-center justify-center font-medium text-zinc-400">Ładowanie profilu...</div>;
  if (!user || !formData) return null;

  const handleChange = (field: keyof User, value: string | null) => {
    setFormData(prev => prev ? ({ ...prev, [field]: value }) : null);
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleAvatarClick = () => {
    if (isEditing) fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      setIsUploading(true);
      const response = await axios.post('http://localhost:8080/api/users/upload-avatar', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      handleChange('image_url', response.data.url);
      toast.success('Zdjęcie przesłane!');
      window.dispatchEvent(new Event('profileUpdated'));
    } catch (err) {
      toast.error('Błąd podczas przesyłania zdjęcia');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Czy na pewno chcesz usunąć zdjęcie?")) return;

    try {
      setIsUploading(true);
      await api.delete('/users/avatar');
      handleChange('image_url', null);
      toast.success('Zdjęcie usunięte');
      window.dispatchEvent(new Event('profileUpdated'));
    } catch (err) {
      toast.error('Błąd podczas usuwania zdjęcia');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData) return;

    const nameRegex = /^[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]+(?:[- ]?[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]+)*$/;
    const newErrors: FormErrors = {};

    if (!formData.name?.trim()) newErrors.name = "Imię jest wymagane";
    else if (!nameRegex.test(formData.name.trim())) newErrors.name = "Błędny format imienia";

    if (!formData.surname?.trim()) newErrors.surname = "Nazwisko jest wymagane";
    else if (!nameRegex.test(formData.surname.trim())) newErrors.surname = "Błędny format nazwiska";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Popraw błędy w formularzu");
      return;
    }

    try {
      setIsUploading(true);
      const response = await api.put('/users/me', formData);
      setUser(response.data);
      setIsEditing(false);
      toast.success('Profil zaktualizowany!');
      window.dispatchEvent(new Event('profileUpdated'));
    } catch (err) {
      toast.error("Błąd podczas zapisywania zmian");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setFormData(user);
    setErrors({});
    setIsEditing(false);
  };

  const ErrorMessage = ({ message }: { message?: string }) =>
      message ? <p className="text-red-500 text-xs mt-1 font-medium text-left">{message}</p> : null;

  return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8 text-left">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Mój profil</h1>
          <p className="text-muted-foreground">Zarządzaj swoimi danymi i lokalizacją</p>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-left">
              <div className="relative group">
                <Avatar
                    className={`size-32 border-2 border-muted transition-opacity ${isEditing ? 'cursor-pointer' : ''}`}
                    onClick={handleAvatarClick}
                >
                  <AvatarImage src={formData.image_url || ''} alt={formData.name} className="object-cover"/>
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    <span className="text-3xl font-semibold">
                      {(formData.name?.[0] || '') + (formData.surname?.[0] || '')}
                    </span>
                  </AvatarFallback>
                  {isEditing && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        {isUploading ? <Loader2 className="animate-spin text-white"/> : <Camera className="text-white"/>}
                      </div>
                  )}
                </Avatar>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*"/>
              </div>

              <div className="flex-1 w-full">
                <h2 className="text-2xl font-semibold">{formData.name} {formData.surname}</h2>
                <p className="text-muted-foreground">{formData.email}</p>
                {isEditing && (
                    <div className="mt-2 space-y-3">
                      <p className="text-xs text-primary animate-pulse font-medium">Kliknij zdjęcie, aby je zmienić</p>
                      {formData.image_url && (
                          <Button variant="destructive" size="sm" className="h-8 gap-2" onClick={handleRemovePhoto} disabled={isUploading}>
                            <Trash2 className="size-4"/> Usuń zdjęcie
                          </Button>
                      )}
                    </div>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium">Informacje o profilu</h3>
              {!isEditing && <Button variant="outline" onClick={() => setIsEditing(true)}>Edytuj profil</Button>}
            </div>

            <div className="space-y-6 text-left">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="name">Imię *</Label>
                  <Input id="name" value={formData.name || ''} onChange={(e) => handleChange('name', e.target.value)} disabled={!isEditing}/>
                  <ErrorMessage message={errors.name}/>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="surname">Nazwisko *</Label>
                  <Input id="surname" value={formData.surname || ''} onChange={(e) => handleChange('surname', e.target.value)} disabled={!isEditing}/>
                  <ErrorMessage message={errors.surname}/>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="size-4 text-muted-foreground"/> Adres Email
                </Label>
                <Input id="email" value={formData.email || ''} disabled className="bg-muted text-muted-foreground cursor-not-allowed"/>
              </div>

              <div className="space-y-1">
                <Label htmlFor="description" className="flex items-center gap-2">
                  <FileText className="size-4 text-muted-foreground"/> O mnie
                </Label>
                <Textarea id="description" value={formData.description || ''} onChange={(e) => handleChange('description', e.target.value)} disabled={!isEditing} rows={4} className="resize-none" placeholder="Napisz kilka słów o sobie..."/>
              </div>

              <div className="space-y-1">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="size-4 text-muted-foreground"/> Adres
                </Label>
                <Input id="location" placeholder="np. ul. Krakowskie Przedmieście 1, Lublin" value={formData.location || ''} onChange={(e) => handleChange('location', e.target.value)} disabled={!isEditing} />
                {isGeocoding && <p className="text-xs text-muted-foreground animate-pulse mt-1">Lokalizowanie...</p>}

                {formData.location && formData.location.length >= 5 && (
                    <div className="space-y-2 text-left border-t pt-4 mt-4">
                      <Label className="text-sm font-medium block mb-2">Podgląd lokalizacji</Label>
                      <MapPreview address={formData.location} coordinates={coordinates}/>
                    </div>
                )}
              </div>

              {isEditing && (
                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" className="flex-1 border-black text-black" onClick={handleCancel}>Anuluj</Button>
                    <Button className="flex-1" onClick={handleSave} disabled={isGeocoding || isUploading}>
                      {isUploading ? <Loader2 className="animate-spin size-4 mr-2" /> : 'Zapisz zmiany'}
                    </Button>
                  </div>
              )}
            </div>
          </Card>
        </div>
      </div>
  );
}