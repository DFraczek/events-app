import {useState, useEffect, useCallback} from 'react';
import { Event } from '../types/event';
import { EventCard } from '../components/EventCard';
import { EventDetailsModal } from '../components/EventDetailsModal';
import { getMyJoinedEvents } from '../services/api';

interface RegisteredEventsPageProps {
    currentUserId: string;
}

export function RegisteredEventsPage({ currentUserId }: RegisteredEventsPageProps) {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

    useEffect(() => {
        getMyJoinedEvents()
            .then(data => {
                setEvents(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Błąd pobierania zapisanych wydarzeń:", err);
                setLoading(false);
            });
    }, []);

    const fetchEvents = useCallback(() => {
        setLoading(true);
        getMyJoinedEvents()
            .then(data => {
                setEvents(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Błąd pobierania:", err);
                setLoading(false);
            });
    }, []);

    const handleLocalToggle = async (eventId: number) => {

        setEvents(prev => prev.filter(e => e.id !== eventId));

        setSelectedEvent(null);

        await fetchEvents();
    };


    const upcomingEvents = events
        .filter(e => new Date(e.startDate) >= new Date())
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    const pastEvents = events
        .filter(e => new Date(e.startDate) < new Date())
        .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    if (loading) {
        return <div className="p-10 text-center font-medium text-zinc-500">Ładowanie zapisanych wydarzeń...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 tracking-tight">Zapisane wydarzenia</h1>
                <p className="text-muted-foreground font-medium">
                    Wydarzenia, na które jesteś zapisany/a
                </p>
            </div>

            {events.length === 0 ? (
                <div className="text-center py-24 bg-zinc-50 rounded-[3rem] border-2 border-dashed border-zinc-100">
                    <h3 className="text-lg font-bold mb-2 text-zinc-800">Nie jesteś zapisany/a na żadne wydarzenia</h3>
                    <p className="text-muted-foreground font-medium">
                        Przeglądaj dostępne wydarzenia i zapisz się na te, które Cię interesują
                    </p>
                </div>
            ) : (
                <div className="space-y-12">
                    {upcomingEvents.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold mb-6 text-zinc-800 flex items-center gap-2">
                                Nadchodzące wydarzenia
                                <span className="bg-zinc-100 text-zinc-500 text-xs py-1 px-2.5 rounded-full">{upcomingEvents.length}</span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {upcomingEvents.map(event => (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                        onClick={() => setSelectedEvent(event)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {pastEvents.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold mb-6 text-zinc-400 flex items-center gap-2">
                                Przeszłe wydarzenia
                                <span className="bg-zinc-50 text-zinc-300 text-xs py-1 px-2.5 rounded-full">{pastEvents.length}</span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-75 grayscale-[0.5]">
                                {pastEvents.map(event => (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                        onClick={() => setSelectedEvent(event)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {selectedEvent && (
                <EventDetailsModal
                    event={selectedEvent}
                    isOpen={!!selectedEvent}
                    onClose={() => setSelectedEvent(null)}
                    currentUserId={currentUserId}
                    onToggleRegistration={handleLocalToggle}
                />
            )}
        </div>
    );
}