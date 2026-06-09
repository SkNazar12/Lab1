export interface TicketDto {
    id: number;
    userId: number;
    title: string;
    description: string | null;
    status: string;
    createdAt: string;
}

export interface ApiError {
    status: number;
    message: string;
    details?: string;
}

export {};