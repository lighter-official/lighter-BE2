import { WritingSessionStartAt } from './writing-session.type';

export interface CreateWritingSessionDto {
  subject: string;
  period: number;
  page: number;
  startAt: WritingSessionStartAt;
  writingHours: number;
}

export interface UpdateWritingSessionDto extends CreateWritingSessionDto {}

export interface ContinueWritingSessionDto extends CreateWritingSessionDto {}
