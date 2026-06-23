import { IsUUID } from 'class-validator';

export class ExpedienteSummaryDto {
  @IsUUID()
  expedienteId!: string;
}
