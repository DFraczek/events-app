import React, { useState, useEffect, useRef } from 'react';
import { Calendar, MapPin, Users, Trash2, Pencil, Save, X, Loader2 } from 'lucide-react';
import { Event } from '../types/event';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { MapPreview } from "./MapPreview";
import { toast } from 'sonner';
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import { deleteEvent, joinEvent, leaveEvent, updateEvent } from '../services/api';
import { EVENT_CATEGORIES } from "../constants/categories";
import axios from "axios";

interface EventDetailsModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  onToggleRegistration: (eventId: number) => void | Promise<void>;
  onDeleteEvent?: (eventId: number) => void;
  onEventUpdated?: () => void | Promise<void>;
}

const geocodeAddressSimulated = async (address: string): Promise<{ lat: number; lng: number } | null> => {
  if (!address || address.length < 5) return null;
  await new Promise(resolve => setTimeout(resolve, 500));
  const baseCoords = { lat: 51.2465, lng: 22.5684 };
  return {
    lat: baseCoords.lat + (Math.random() * 0.01),
    lng: baseCoords.lng + (Math.random() * 0.01)
  };
};

export function EventDetailsModal({
                                    event,
                                    isOpen,
                                    onClose,
                                    currentUserId,
                                    onToggleRegistration,
                                    onDeleteEvent,
                                    onEventUpdated
                                  }: EventDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen || !event) {
      if (isInitialized) {
        setIsInitialized(false);
        setIsEditing(false);
      }
      return;
    }

    if (!isInitialized) {
      setEditData({
        name: event.name,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate || event.startDate,
        location: event.location,
        category: event.category,
        numberOfParticipants: event.numberOfParticipants,
        photo: event.photo
      });
      setIsInitialized(true);
    }
  }, [event, isOpen, isInitialized]);

  useEffect(() => {
    const address = isEditing ? editData?.location : event?.location;
    if (isOpen && address) {
      geocodeAddressSimulated(address).then(coords => setCoordinates(coords || undefined));
    }
  }, [event?.location, editData?.location, isOpen, isEditing]);

  if (!event || !editData) return null;

  const isOrganizer = (event as any).userRole === 'ORGANIZER' || String(event.organizerId) === String(currentUserId);
  const isParticipant = (event as any).userRole === 'PARTICIPANT';
  const categoryName = EVENT_CATEGORIES.find(cat => cat.id === (isEditing ? editData.category : event.category))?.name || event.category;
  const isPastEvent = new Date(event.endDate || event.startDate) < new Date();
  const registeredCount = event.registeredCount || 0;
  const capacity = event.numberOfParticipants || 0;
  const isFull = (capacity - registeredCount) <= 0;

  const handleSave = async () => {
    const start = new Date(editData.startDate);
    const end = new Date(editData.endDate);

    if (!editData.name.trim()) return toast.error('Nazwa nie może być pusta');
    if (!editData.location.trim()) return toast.error('Lokalizacja nie może być pusta');
    if (start >= end) return toast.error('Data zakończenia musi być późniejsza niż rozpoczęcia');

    setIsSaving(true);
    try {
      const fullEventObject = {
        ...event,
        name: editData.name.trim(),
        description: editData.description.trim(),
        location: editData.location.trim(),
        category: editData.category,
        numberOfParticipants: editData.numberOfParticipants,
        startDate: editData.startDate.length === 16 ? editData.startDate + ":00" : editData.startDate,
        endDate: editData.endDate.length === 16 ? editData.endDate + ":00" : editData.endDate,
        photo: editData.photo
      };

      await updateEvent(event.id, fullEventObject);
      toast.success("Wydarzenie zostało zaktualizowane");
      setIsEditing(false);
      if (onEventUpdated) onEventUpdated();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Nie udało się zapisać zmian");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      setIsUploading(true);
      const response = await axios.post(`/api/events/${event.id}/upload-photo`, uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const newPhotoUrl = response.data.url;
      setEditData((prev: any) => ({ ...prev, photo: newPhotoUrl }));
      toast.success('Zdjęcie przesłane');
      if (onEventUpdated) onEventUpdated();
    } catch (err) {
      toast.error('Błąd uploadu zdjęcia');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!window.confirm("Czy na pewno chcesz usunąć zdjęcie?")) return;
    try {
      setIsUploading(true);
      await axios.delete(`/api/events/${event.id}/photo`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setEditData((prev: any) => ({ ...prev, photo: null }));
      toast.success('Zdjęcie usunięte');
      if (onEventUpdated) onEventUpdated();
    } catch (err) {
      toast.error('Błąd podczas usuwania zdjęcia');
    } finally {
      setIsUploading(false);
    }
  };

  const handleToggleRegistration = async () => {
    setIsActionLoading(true);
    try {
      if (isParticipant) {
        await leaveEvent(event.id);
        toast.success("Wypisano się");
        onClose();
      } else {
        await joinEvent(event.id);
        toast.success("Zapisano się");
      }
      await onToggleRegistration(event.id);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Błąd operacji");
    } finally {
      setIsActionLoading(false);
    }
  };

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return {
      date: d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }),
      time: d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
      <>
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto !rounded-[2.5rem] p-0 border-none shadow-2xl">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="!text-3xl sm:!text-4xl !font-bold tracking-tight text-left pr-6">
                {isEditing ? (
                    <Input
                        value={editData.name}
                        onChange={e => setEditData({ ...editData, name: e.target.value })}
                        className="text-xl font-bold h-12 mt-2"
                    />
                ) : event.name}
              </DialogTitle>
            </DialogHeader>

            <div className="p-6 space-y-6">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted group">
                <img
                    key={isEditing ? editData?.photo : event?.photo}
                    src={(isEditing ? editData?.photo : event.photo) || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(event.name)}`}
                    alt={event.name}
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />

                {isEditing && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                      <Button
                          variant="secondary"
                          size="sm"
                          className="rounded-full shadow-lg"
                          onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                          disabled={isUploading}
                      >
                        {isUploading ? <Loader2 className="animate-spin size-4" /> : <Pencil className="size-4 mr-2" />}
                        Zmień
                      </Button>
                      {(editData?.photo || event.photo) && (
                          <Button
                              variant="destructive"
                              size="sm"
                              className="rounded-full shadow-lg"
                              onClick={(e) => { e.stopPropagation(); handleRemovePhoto(); }}
                              disabled={isUploading}
                          >
                            <Trash2 className="size-4 mr-2" />
                            Usuń
                          </Button>
                      )}
                    </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isEditing ? (
                    <Select value={editData.category} onValueChange={v => setEditData({ ...editData, category: v })}>
                      <SelectTrigger className="w-[200px] h-9">
                        <SelectValue placeholder="Kategoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {EVENT_CATEGORIES.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                ) : (
                    <Badge variant="outline" className="border-zinc-200 text-zinc-500 py-1 px-3">
                      {categoryName}
                    </Badge>
                )}
                {(isOrganizer || isParticipant) && (
                    <Badge variant="outline" className="border-zinc-200 text-zinc-500 py-1 px-3">
                      {isOrganizer ? "Organizator" : "Zapisany"}
                    </Badge>
                )}
              </div>

              <div>
                <h4 className="font-bold text-zinc-900 mb-2 text-lg">O wydarzeniu</h4>
                {isEditing ? (
                    <Textarea
                        value={editData.description}
                        onChange={e => setEditData({ ...editData, description: e.target.value })}
                        rows={4}
                        className="resize-none"
                    />
                ) : (
                    <p className="text-zinc-500 leading-relaxed">{event.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 border-y border-zinc-100">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-zinc-50 rounded-2xl text-zinc-400"><Calendar className="size-5" /></div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Początek</p>
                    {isEditing ? (
                        <Input
                            type="datetime-local"
                            value={editData.startDate.slice(0, 16)}
                            onChange={e => setEditData({ ...editData, startDate: e.target.value })}
                            className="h-8 text-xs mt-1"
                        />
                    ) : (
                        <p className="text-sm font-semibold text-zinc-700">
                          {formatDateTime(event.startDate).date} o {formatDateTime(event.startDate).time}
                        </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-zinc-50 rounded-2xl text-zinc-400"><Calendar className="size-5" /></div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Koniec</p>
                    {isEditing ? (
                        <Input
                            type="datetime-local"
                            value={editData.endDate.slice(0, 16)}
                            onChange={e => setEditData({ ...editData, endDate: e.target.value })}
                            className="h-8 text-xs mt-1"
                        />
                    ) : (
                        <p className="text-sm font-semibold text-zinc-700">
                          {formatDateTime(event.endDate || event.startDate).date} o {formatDateTime(event.endDate || event.startDate).time}
                        </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-zinc-50 rounded-2xl text-zinc-400"><MapPin className="size-5" /></div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Lokalizacja</p>
                    {isEditing ? (
                        <Input
                            value={editData.location}
                            onChange={e => setEditData({ ...editData, location: e.target.value })}
                            className="h-8 text-xs mt-1"
                        />
                    ) : (
                        <p className="text-sm font-semibold text-zinc-700">{event.location}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-zinc-50 rounded-2xl text-zinc-400"><Users className="size-5" /></div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Uczestnicy</p>
                    <p className="text-sm font-semibold text-zinc-700">{registeredCount} / {capacity} osób</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-zinc-900 mb-3 text-lg">Lokalizacja na mapie</h4>
                <div className="rounded-[2.5rem] overflow-hidden shadow-sm h-[220px]">
                  <MapPreview address={isEditing ? editData.location : event.location} coordinates={coordinates} />
                </div>
              </div>

              <div className="pt-4 pb-4">
                {!isOrganizer ? (
                    <Button
                        className="w-full h-14 !rounded-2xl font-bold text-lg transition-all active:scale-[0.98]"
                        variant={isParticipant ? "outline" : (isFull || isPastEvent || event.eventStatus === 'ZAKONCZONE') ? "secondary" : "default"}
                        onClick={handleToggleRegistration}
                        disabled={((isFull || isPastEvent || event.eventStatus === 'ZAKONCZONE') && !isParticipant) || isActionLoading}
                    >
                      {isActionLoading ? <Loader2 className="animate-spin" /> : isParticipant ? 'Wypisz się' : (isPastEvent || event.eventStatus === 'ZAKONCZONE') ? 'Wydarzenie zakończone' : isFull ? 'Brak miejsc' : 'Zapisz się'}
                    </Button>
                ) : (
                    <div className="flex gap-3 w-full">
                      {isEditing ? (
                          <>
                            <Button className="flex-1 h-14 !rounded-2xl font-bold gap-2" onClick={handleSave} disabled={isSaving}>
                              {isSaving ? <Loader2 className="animate-spin" /> : <Save className="size-4" />}
                              Zapisz zmiany
                            </Button>
                            <Button variant="outline" className="flex-1 h-14 !rounded-2xl font-bold gap-2" onClick={() => setIsEditing(false)}>
                              <X className="size-4" /> Anuluj
                            </Button>
                          </>
                      ) : (
                          <>
                            {!isPastEvent && (
                                <Button variant="outline" className="flex-1 h-14 !rounded-2xl font-bold border-zinc-200 text-zinc-600 gap-2" onClick={() => setIsEditing(true)}>
                                  <Pencil className="size-4" /> Edytuj
                                </Button>
                            )}
                            <Button className="flex-1 h-14 !rounded-2xl font-bold !bg-black" onClick={() => setIsDeleteDialogOpen(true)}>
                              <Trash2 className="size-4" /> Usuń
                            </Button>
                          </>
                      )}
                    </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <ConfirmDeleteModal
            isOpen={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            onConfirm={async () => {
              await deleteEvent(event.id);
              onDeleteEvent?.(event.id);
              onClose();
            }}
            eventName={event.name}
        />
      </>
  );
}