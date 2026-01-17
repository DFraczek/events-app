import { useState, useEffect, useCallback, useMemo } from 'react';
import { Event } from '../types/event';
import { EventCard } from '../components/EventCard';
import { EventDetailsModal } from '../components/EventDetailsModal';
import { PlusCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';
import { getMyOrganizedEvents } from '../services/api';
import { toast } from 'sonner';

interface MyEventsPageProps {
    currentUserId: string;
}

export function MyEventsPage({ currentUserId }: MyEventsPageProps) {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

    const fetchMyEvents = useCallback(async () => {
        try {
            const data = await getMyOrganizedEvents();
            const onlyOrganized = data.filter((e: Event) => String(e.organizerId) === String(currentUserId));
            setEvents(onlyOrganized);

            setSelectedEvent(current => {
                if (!current) return null;
                const updated = onlyOrganized.find(e => e.id === current.id);
                return updated || null;
            });
        } catch (err) {
            console.error("Błąd pobierania Twoich wydarzeń:", err);
            toast.error("Nie udało się pobrać listy wydarzeń");
        } finally {
            setLoading(false);
        }
    }, [currentUserId]);

    useEffect(() => {
        fetchMyEvents();
    }, [fetchMyEvents]);

    const handleToggleRegistration = async () => {
        return;
    };

    const handleDeleteEventFromState = (id: number) => {
        setEvents((prevEvents) => prevEvents.filter((event) => event.id !== id));
        setSelectedEvent(null);
    };

    const { upcomingEvents, pastEvents } = useMemo(() => {
        const now = new Date();

        const upcoming = events
            .filter((e) => new Date(e.endDate || e.startDate) >= now)
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

        const past = events
            .filter((e) => new Date(e.endDate || e.startDate) < now)
            .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

        return { upcomingEvents: upcoming, pastEvents: past };
    }, [events]);

    if (loading) return <div className="p-10 text-center font-medium">Ładowanie Twoich wydarzeń...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2 tracking-tight">Moje wydarzenia</h1>
                    <p className="text-zinc-500">Zarządzaj wydarzeniami, które organizujesz</p>
                </div>
                <Link to="/create">
                    <Button className="gap-2 rounded-xl bg-black hover:bg-zinc-800">
                        <PlusCircle className="size-4" />
                        Dodaj wydarzenie
                    </Button>
                </Link>
            </div>

            {events.length === 0 ? (
                <div className="text-center py-12 bg-zinc-50 rounded-[2rem] border-2 border-dashed border-zinc-100">
                    <h3 className="text-lg font-bold mb-2">Nie organizujesz jeszcze żadnych wydarzeń</h3>
                    <p className="text-muted-foreground mb-6">Stwórz swoje pierwsze wydarzenie i zacznij zapraszać uczestników</p>
                    <Link to="/create">
                        <Button className="gap-2 rounded-xl">
                            <PlusCircle className="size-4" />
                            Dodaj wydarzenie
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-12">
                    {upcomingEvents.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-zinc-800">
                                Nadchodzące <span className="text-sm font-normal text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">{upcomingEvents.length}</span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {upcomingEvents.map((event) => (
                                    <EventCard key={event.id} event={event} onClick={() => setSelectedEvent(event)} />
                                ))}
                            </div>
                        </div>
                    )}

                    {pastEvents.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold pt-6 mb-6 flex items-center gap-2 text-zinc-400">
                                Archiwalne <span className="text-sm font-normal bg-zinc-50 px-2 py-0.5 rounded-full">{pastEvents.length}</span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-75 grayscale-[0.5]">
                                {pastEvents.map((event) => (
                                    <EventCard key={event.id} event={event} onClick={() => setSelectedEvent(event)} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {selectedEvent && (
                <div key={`${selectedEvent.id}-${selectedEvent.photo || 'no-photo'}`}>
                    <EventDetailsModal
                        event={selectedEvent}
                        isOpen={!!selectedEvent}
                        onClose={() => setSelectedEvent(null)}
                        currentUserId={currentUserId}
                        onToggleRegistration={handleToggleRegistration}
                        onDeleteEvent={handleDeleteEventFromState}
                        onEventUpdated={fetchMyEvents}
                    />
                </div>
            )}
        </div>
    );
}