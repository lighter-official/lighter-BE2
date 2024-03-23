export type CreateWritingDto = {
  title: string;
  content: string;
};

export type UpdateWritingDto = CreateWritingDto;

export type SubmitWritingDto = CreateWritingDto;

export type TemporarySaveWritingDto = Partial<CreateWritingDto>;
