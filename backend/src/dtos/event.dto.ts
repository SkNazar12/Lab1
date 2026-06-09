export type EventDto = {
  id: number;
  title: string;
  date: string;
  location: string;
  capacity: number;
  description: string | null;
  createdAt: string;
};

export type EventWithStatsDto = EventDto & {
  registrationsCount: number;
  freePlaces: number;
};

export type CreateEventDto = {
  title: string;
  date: string;
  location: string;
  capacity: number;
  description: string | null;
};

export type UpdateEventDto = CreateEventDto;
