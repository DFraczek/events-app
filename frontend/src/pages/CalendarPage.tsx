import { useState, useMemo, useEffect, useCallback } from 'react';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { Event } from '../types/event';
import { EventCard } from '../components/EventCard';
import { EventDetailsModal } from '../components/EventDetailsModal';
import { Calendar } from '../components/ui/calendar';
import { pl } from 'date-fns/locale';
import { getMyJoinedEvents } from '../services/api';

interface CalendarPageProps {
  currentUserId: string;
}

export function CalendarPage({ currentUserId }: CalendarPageProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const fetchMyCalendar = useCallback(async () => {
    try {
      const data = await getMyJoinedEvents();
      setEvents(data);


      setSelectedEvent(current => {
        if (!current) return null;
        const updated = data.find(e => e.id === current.id);
        return updated || current;
      });
    } catch (err) {
      console.error("Błąd pobierania kalendarza:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyCalendar();
  }, [fetchMyCalendar]);

  const handleToggleRegistration = async (eventId: number) => {

    await fetchMyCalendar();
  };

  const eventDates = useMemo(() => {
    return events.map(e => new Date(e.startDate).toDateString());
  }, [events]);

  const eventsOnSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = selectedDate.toDateString();
    return events.filter(e => new Date(e.startDate).toDateString() === dateStr);
  }, [selectedDate, events]);

  if (loading) {
    return (
        <div className="flex h-96 flex-col items-center justify-center gap-4">
          <Loader2 className="size-10 animate-spin text-zinc-300" />
          <p className="font-medium text-zinc-500">Ładowanie Twojego planu...</p>
        </div>
    );
  }

  return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 tracking-tight">Twój Kalendarz</h1>
          <p className="text-muted-foreground font-medium">
            Widok wydarzeń, na które jesteś zapisany/a
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white border border-zinc-100 rounded-[2rem] p-6 sticky top-8 shadow-sm">
              <h3 className="text-lg font-bold mb-4 px-2 text-zinc-800">Wybierz datę</h3>
              <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  locale={pl}
                  className="rounded-md border-none"
                  modifiers={{
                    hasEvent: (date) => eventDates.includes(date.toDateString())
                  }}
                  modifiersStyles={{
                    hasEvent: {
                      fontWeight: '900',
                      color: '#ff0000',
                      backgroundColor: '#fff',
                      borderRadius: '10px',
                      textDecoration: 'underline',
                      textUnderlineOffset: '4px'
                    }
                  }}
              />
              <div className="mt-6 p-4 bg-zinc-50 rounded-2xl text-[12px] border border-zinc-100">
                <div className="mt-4 p-3 bg-muted/50 rounded text-sm">
                  <p className="text-muted-foreground">
                    Czerwone, pogrubione i podkreślone daty mają zaplanowane wydarzenia
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedDate ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-800">
                      {selectedDate.toLocaleDateString('pl-PL', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </h2>
                    <span className="text-sm font-bold text-zinc-400 bg-zinc-100 px-3 py-1 rounded-full">
                  {eventsOnSelectedDate.length} {eventsOnSelectedDate.length === 1 ? 'wydarzenie' : 'wydarzenia'}
                </span>
                  </div>

                  {eventsOnSelectedDate.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {eventsOnSelectedDate.map(event => (
                            <EventCard
                                key={event.id}
                                event={event}
                                onClick={() => setSelectedEvent(event)}
                            />
                        ))}
                      </div>
                  ) : (
                      <div className="text-center py-24 bg-zinc-50 rounded-[3rem] border-2 border-dashed border-zinc-100">
                        <p className="text-zinc-400 font-medium">
                          Brak wydarzeń na ten dzień
                        </p>
                      </div>
                  )}
                </div>
            ) : (
                <div className="text-center py-24 bg-zinc-50 rounded-[3rem] border-2 border-dashed border-zinc-100">
                  <CalendarIcon className="size-12 mx-auto mb-4 text-zinc-200" />
                  <p className="text-zinc-400 font-medium">
                    Wybierz datę z kalendarza
                  </p>
                </div>
            )}
          </div>
        </div>

        {selectedEvent && (
            <div key={`${selectedEvent.id}-${selectedEvent.photo || 'no-photo'}`}>
              <EventDetailsModal
                  event={selectedEvent}
                  isOpen={!!selectedEvent}
                  onClose={() => setSelectedEvent(null)}
                  currentUserId={currentUserId}
                  onToggleRegistration={handleToggleRegistration}
                  onEventUpdated={fetchMyCalendar}
              />
            </div>
        )}
      </div>
  );
}