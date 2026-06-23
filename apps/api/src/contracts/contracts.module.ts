import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractDraft } from './contract-draft.entity';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';

@Module({
  imports: [TypeOrmModule.forFeature([ContractDraft])],
  controllers: [ContractsController],
  providers: [ContractsService],
})
export class ContractsModule {}