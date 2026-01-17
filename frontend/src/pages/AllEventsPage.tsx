import { useState, useMemo, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Event } from '../types/event';
import { getEvents } from '../services/api';
import { EventCard } from '../components/EventCard';
import { EventDetailsModal } from '../components/EventDetailsModal';
import { EventFiltersModal } from '../components/EventFiltersModal';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

interface AllEventsPageProps {
  currentUserId: string;
}

export function AllEventsPage({ currentUserId }: AllEventsPageProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      const data = await getEvents();
      setEvents(data);
      setSelectedEvent(current => {
        if (!current) return null;
        const updated = data.find(e => e.id === current.id);
        return updated || current;
      });
    } catch (err) {
      console.error("Błąd podczas pobierania wydarzeń:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleToggleRegistration = async () => {
    await fetchEvents();
  };

  const handleDeleteEventFromState = (id: number) => {
    setEvents(prevEvents => prevEvents.filter(event => event.id !== id));
    setSelectedEvent(null);
  };

  const filteredAndSortedEvents = useMemo(() => {
    let filtered = events;

    if (selectedCategories.length > 0) {
      filtered = filtered.filter(event => selectedCategories.includes(event.category));
    }
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter(event => selectedStatuses.includes(event.eventStatus));
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event =>
          (event.name?.toLowerCase().includes(query)) ||
          (event.description?.toLowerCase().includes(query)) ||
          (event.location?.toLowerCase().includes(query))
      );
    }
    if (showAvailableOnly) {
      filtered = filtered.filter(event =>
          (event.registeredCount || 0) < (event.numberOfParticipants || 0)
      );
    }

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date': return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        case 'date-desc': return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        case 'popularity': return (b.registeredCount || 0) - (a.registeredCount || 0);
        case 'title': return (a.name || "").localeCompare(b.name || "");
        default: return 0;
      }
    });
  }, [events, searchQuery, selectedCategories, selectedStatuses, showAvailableOnly, sortBy]);

  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev => prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]);
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedStatuses([]);
    setShowAvailableOnly(false);
  };

  if (loading) return <div className="flex h-96 items-center justify-center font-medium">Ładowanie wydarzeń...</div>;

  const activeFiltersCount = selectedCategories.length + selectedStatuses.length + (showAvailableOnly ? 1 : 0);

  return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6 tracking-tight text-zinc-900">Wszystkie wydarzenia</h1>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                  placeholder="Szukaj wydarzeń..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl border-zinc-200"
              />
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[200px] rounded-xl">
                <SelectValue placeholder="Sortuj" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Data (najwcześniej)</SelectItem>
                <SelectItem value="date-desc">Data (najpóźniej)</SelectItem>
                <SelectItem value="popularity">Popularność</SelectItem>
                <SelectItem value="title">Nazwa A-Z</SelectItem>
              </SelectContent>
            </Select>

            <EventFiltersModal
                isOpen={isFiltersOpen}
                onOpenChange={setIsFiltersOpen}
                selectedCategories={selectedCategories}
                toggleCategory={toggleCategory}
                selectedStatuses={selectedStatuses}
                toggleStatus={toggleStatus}
                showAvailableOnly={showAvailableOnly}
                setShowAvailableOnly={setShowAvailableOnly}
                activeFiltersCount={activeFiltersCount}
                resultsCount={filteredAndSortedEvents.length}
                onClearFilters={clearFilters}
            />
          </div>

          <div className="mt-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Znaleziono {filteredAndSortedEvents.length} {filteredAndSortedEvents.length === 1 ? 'wydarzenie' : 'wydarzeń'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedEvents.map((event: Event) => (
              <EventCard key={event.id} event={event} onClick={() => setSelectedEvent(event)} />
          ))}
        </div>

        {selectedEvent && (
            <EventDetailsModal
                event={selectedEvent}
                isOpen={!!selectedEvent}
                onClose={() => setSelectedEvent(null)}
                currentUserId={currentUserId}
                onToggleRegistration={handleToggleRegistration}
                onDeleteEvent={handleDeleteEventFromState}
                onEventUpdated={fetchEvents}
            />
        )}
      </div>
  );
}