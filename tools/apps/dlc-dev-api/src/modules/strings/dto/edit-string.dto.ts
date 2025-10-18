import { IsString, IsOptional, IsInt, Min, MaxLength, IsIn } from 'class-validator';

const SUPPORTED_LANGS = [
  'usa', 'ger', 'spn', 'frc', 'rus', 'base', 'twn', 'chn', 'thai', 'jpn',
  'mal', 'brz', 'hk', 'pld', 'tur', 'ita', 'mex', 'nld', 'uk', 'dev'
];

export class EditStringDto {
  @IsString()
  @IsIn(SUPPORTED_LANGS)
  lang: string;

  @IsString()
  @MaxLength(255)
  value: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  ifVersion?: number;
}

export class UpdateStateDto {
  @IsString()
  @IsIn(SUPPORTED_LANGS)
  lang: string;

  @IsString()
  @IsIn(['draft', 'reviewed', 'published'])
  status: 'draft' | 'reviewed' | 'published';
}

export class BulkEditDto {
  @IsOptional()
  dryRun?: boolean;

  edits: Array<{
    a_index: number;
    lang: string;
    value: string;
    reason?: string;
  }>;
}
