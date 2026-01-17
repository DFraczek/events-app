import { Calendar, MapPin, Users } from 'lucide-react';
import { Card } from './ui/card';
import React from 'react';

interface Event {
  id: number;
  name: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  photo: string;
  category: string;
  eventStatus: string;
  numberOfParticipants?: number;
  registeredCount?: number;
}

interface EventCardProps {
  event: Event;
  onClick: () => void;
  key?: React.Key;
}

export function EventCard({ event, onClick }: EventCardProps) {
  const registeredCount = event.registeredCount || 0;
  const capacity = event.numberOfParticipants || 0;
  const availableSpots = capacity - registeredCount;
  const spotsPercentage = capacity > 0 ? (registeredCount / capacity) * 100 : 0;
  const now = new Date();
  const endDate = new Date(event.endDate);
  const isExpired = endDate < now;
  const eventDate = new Date(event.startDate);
  const formattedDate = eventDate.toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const formattedTime = eventDate.toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
      <Card
          className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 border-zinc-100 group"
          onClick={onClick}
      >
        <div className="aspect-video w-full overflow-hidden bg-muted relative">

          <img
              src={event.photo || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(event.name)}&backgroundColor=f1f5f9`}
              alt={event.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 z-0"
          />

        </div>

        <div className="p-4 space-y-3">

          <div className="flex items-center justify-between gap-2">
            <h3 className="line-clamp-1 font-bold text-zinc-800">
              {event.name}
            </h3>

            {(isExpired || event.eventStatus === 'ZAKONCZONE') && (
                <div className="bg-white/90 text-black border border-black/30 rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap">
                  ZAKOŃCZONE
                </div>
            )}
          </div>

          <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
            {event.description}
          </p>

          <div className="space-y-2 text-sm font-medium">
            <div className="flex items-center gap-2 text-zinc-600">
              <Calendar className="size-4 text-zinc-400"/>
              <span>{formattedDate} o {formattedTime}</span>
            </div>

            <div className="flex items-center gap-2 text-zinc-600">
              <MapPin className="size-4 text-zinc-400"/>
              <span className="line-clamp-1">{event.location}</span>
            </div>

            <div className="flex items-center gap-2 text-zinc-600">
              <Users className="size-4 text-zinc-400"/>
              <span>
              {registeredCount} / {capacity} osób
                {availableSpots > 0 && (
                    <span className="text-zinc-400/80 font-normal"> · {availableSpots} wolnych</span>
                )}
            </span>
            </div>
          </div>

          <div className="pt-2">
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                  className="h-full bg-primary transition-all"
                  style={{width: `${Math.min(spotsPercentage, 100)}%`}}
              />
            </div>
          </div>
        </div>
      </Card>
  );
}