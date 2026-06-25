import { IsIn, IsObject, IsOptional } from 'class-validator';

export class GenerateDocumentDto {
  @IsIn(['docx', 'pdf'])
  formato!: 'docx' | 'pdf';

  @IsOptional()
  @IsObject()
  variables?: Record<string, string>;
}