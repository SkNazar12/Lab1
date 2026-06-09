export type RegistrationDto = {
  id: number;
  eventId: number;
  userId: number;
  registeredAt: string;
  eventTitle?: string;
  eventDate?: string;
  eventLocation?: string;
  userEmail?: string;
  userName?: string;
};
