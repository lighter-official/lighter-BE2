export interface CreateWritingSessionDto {
  subject: string;
  period: number;
  page: number;
  startAt: { hour: number; minute: number };
  writingHours: number;
}

export interface UpdateWritingSessionDto {
  subject: string;
  period: number;
  page: number;
  startAt: { hour: number; minute: number };
  writingHours: number;
}
