import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {ArrowLeft, Camera, Loader2, MapPin} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Event } from '../types/event';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card } from '../components/ui/card';
import { MapPreview } from '../components/MapPreview';
import { User } from '../types/event';
import { toast } from 'sonner';
import api from '../services/api';
import {EVENT_CATEGORIES} from "../constants/categories";

interface CreateEventPageProps {
  currentUser: User;
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

export function CreateEventPage({  }:CreateEventPageProps) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    category: '',
    numberOfParticipants: '',
  });

  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | undefined>(undefined);

  useEffect(() => {
    const address = formData.location;
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
  }, [formData.location]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const now = new Date();
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const participants = parseInt(formData.numberOfParticipants);

    if (!formData.name.trim()) {
      toast.error('Nazwa wydarzenia jest wymagana');
      return;
    }

    if (!formData.category) {
      toast.error('Wybierz kategorię wydarzenia');
      return;
    }

    if (startDate <= now) {
      toast.error('Data rozpoczęcia musi być w przyszłości');
      return;
    }

    if (startDate >= endDate) {
      toast.error('Data zakończenia musi być późniejsza niż data rozpoczęcia');
      return;
    }

    if (!formData.location.trim()) {
      toast.error('Adres wydarzenia jest wymagany');
      return;
    }

    if (isNaN(participants) || participants <= 0) {
      toast.error('Limit uczestników musi być większy niż 0');
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append('name', formData.name.trim());
      data.append('description', formData.description.trim() || '');
      data.append('startDate', formData.startDate);
      data.append('endDate', formData.endDate);
      data.append('location', formData.location.trim());
      data.append('category', formData.category);
      data.append('numberOfParticipants', participants.toString());

      if (selectedFile) {
        data.append('image', selectedFile);
      }

      await api.post('/events', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Wydarzenie zostało utworzone!');
      navigate('/my-events');
    } catch (error: any) {
      console.error(error);
      const message = error.response?.data?.message || 'Błąd podczas tworzenia wydarzenia';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button variant="ghost" className="mb-6 gap-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="size-4" /> Powrót
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">Utwórz wydarzenie</h1>
          <p className="text-muted-foreground">Podziel się swoją inicjatywą z innymi</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="p-6 space-y-6">
            <div className="space-y-2">
              <Label>Zdjęcie wydarzenia</Label>
              <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative aspect-video w-full rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-100 transition-colors overflow-hidden"
              >
                {imagePreview ? (
                    <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                    <>
                      <Camera className="size-8 text-zinc-400 mb-2" />
                      <span className="text-sm text-zinc-500">Kliknij, aby dodać zdjęcie</span>
                    </>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nazwa wydarzenia *</Label>
              <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategoria *</Label>
              <Select onValueChange={(v) => setFormData({...formData, category: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz kategorię" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_CATEGORIES.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Data i godzina rozpoczęcia *</Label>
                <Input
                    id="startDate"
                    type="datetime-local"
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Data i godzina zakończenia *</Label>
                <Input
                    id="endDate"
                    type="datetime-local"
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    required
                />
              </div>
            </div>

            <div className="space-y-2 text-left">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="size-4 text-muted-foreground" /> Lokalizacja
              </Label>
              <Input
                  id="location"
                  placeholder="np. ul. Krakowskie Przedmieście 1, Lublin"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
              {isGeocoding && <p className="text-xs text-muted-foreground animate-pulse mt-1">Lokalizowanie na mapie...</p>}
            </div>

            {formData.location && formData.location.length >= 5 && (
                <div className="space-y-2 text-left border-t pt-4">
                  <Label className="text-sm font-medium block">Podgląd lokalizacji</Label>
                  <MapPreview address={formData.location} coordinates={coordinates} />
                </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="numberOfParticipants">Limit uczestników</Label>
              <Input
                  id="numberOfParticipants"
                  type="number"
                  value={formData.numberOfParticipants}
                  onChange={(e) => setFormData({...formData, numberOfParticipants: e.target.value})}
                  required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Opis wydarzenia</Label>
              <Textarea
                  id="description"
                  rows={5}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <Button type="submit" className="w-full h-12 text-lg" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : 'Opublikuj wydarzenie'}
            </Button>
          </Card>
        </form>
      </div>
  );
}