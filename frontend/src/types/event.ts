export interface Event {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  photo: string;
  category: string;
  eventStatus: string;
  numberOfParticipants: number;
  registeredCount?: number;
  organizerName: string;
  organizerId: string;
}

export interface User {
  id: string;
  name: string;
  surname: string;
  email: string;
  location: string;
  description: string;
  image_url?: string;
  role: string;
}