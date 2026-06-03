// DTO для створення (POST) - без ID, бо його дає сервер [cite: 451, 974]
export interface CreateEventDto {
    title: string;
    date: string;
    location: string;
    capacity: number;
    desc: string;
}

// DTO для відповіді (Response) - вже з ID [cite: 455, 975]
export interface EventResponseDto {
    id: string;
    title: string;
    date: string;
    location: string;
    capacity: number;
    desc: string;
}