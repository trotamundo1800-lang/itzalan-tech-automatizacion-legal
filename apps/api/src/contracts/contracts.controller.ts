import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { GenerateContractDto } from './dto/generate-contract.dto';
import { UpdateContractDraftDto } from './dto/update-contract-draft.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('api/contracts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'abogado', 'asistente')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get('drafts')
  listDrafts() {
    return this.contractsService.listDrafts();
  }

  @Get('drafts/:id')
  getDraftById(@Param('id') id: string) {
    return this.contractsService.getDraftById(id);
  }

  @Patch('drafts/:id')
  updateDraft(@Param('id') id: string, @Body() updateContractDraftDto: UpdateContractDraftDto) {
    return this.contractsService.updateDraft(id, updateContractDraftDto);
  }

  @Post('drafts/:id/regenerate')
  regenerateDraft(@Param('id') id: string) {
    return this.contractsService.regenerateDraft(id);
  }

  @Post('generate')
  generate(@Body() generateContractDto: GenerateContractDto) {
    return this.contractsService.generateContract(generateContractDto);
  }
}