import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContractDraft } from './contract-draft.entity';
import { GenerateContractDto } from './dto/generate-contract.dto';
import { UpdateContractDraftDto } from './dto/update-contract-draft.dto';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(ContractDraft)
    private readonly contractDraftRepository: Repository<ContractDraft>,
  ) {}

  private buildGeneratedContent(payload: {
    tipoContrato: string;
    nombreCliente: string;
    descripcionCaso: string;
  }) {
    const { tipoContrato, nombreCliente, descripcionCaso } = payload;

    return {
      titulo: `${tipoContrato} para ${nombreCliente}`,
      resumen: `Borrador inicial de ${tipoContrato.toLowerCase()} preparado para ${nombreCliente} con base en el contexto del caso: ${descripcionCaso}`,
      clausulasSugeridas: [
        `Identificación de partes y alcance del ${tipoContrato.toLowerCase()}.`,
        `Obligaciones principales relacionadas con: ${descripcionCaso}.`,
        'Confidencialidad, cumplimiento normativo y tratamiento de información sensible.',
        'Vigencia, causales de terminación y mecanismo de solución de controversias.',
      ],
    };
  }

  private toContractDraftResponse(savedDraft: ContractDraft) {
    return {
      id: savedDraft.id,
      createdAt: savedDraft.createdAt,
      updatedAt: savedDraft.updatedAt,
      tipoContrato: savedDraft.tipoContrato,
      nombreCliente: savedDraft.nombreCliente,
      descripcionCaso: savedDraft.descripcionCaso,
      titulo: savedDraft.titulo,
      resumen: savedDraft.resumen,
      clausulasSugeridas: savedDraft.clausulasSugeridas,
    };
  }

  async listDrafts() {
    return this.contractDraftRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getDraftById(id: string) {
    const draft = await this.contractDraftRepository.findOne({ where: { id } });

    if (!draft) {
      throw new NotFoundException('Borrador no encontrado');
    }

    return draft;
  }

  async generateContract(payload: GenerateContractDto) {
    const { tipoContrato, nombreCliente, descripcionCaso } = payload;
    const generatedContent = this.buildGeneratedContent({
      tipoContrato,
      nombreCliente,
      descripcionCaso,
    });

    const draft = this.contractDraftRepository.create({
      tipoContrato,
      nombreCliente,
      descripcionCaso,
      titulo: generatedContent.titulo,
      resumen: generatedContent.resumen,
      clausulasSugeridas: generatedContent.clausulasSugeridas,
    });

    const savedDraft = await this.contractDraftRepository.save(draft);

    return this.toContractDraftResponse(savedDraft);
  }

  async updateDraft(id: string, payload: UpdateContractDraftDto) {
    const draft = await this.getDraftById(id);

    Object.assign(draft, payload);

    const updatedDraft = await this.contractDraftRepository.save(draft);

    return this.toContractDraftResponse(updatedDraft);
  }

  async regenerateDraft(id: string) {
    const draft = await this.getDraftById(id);
    const generatedContent = this.buildGeneratedContent({
      tipoContrato: draft.tipoContrato,
      nombreCliente: draft.nombreCliente,
      descripcionCaso: draft.descripcionCaso,
    });

    draft.titulo = generatedContent.titulo;
    draft.resumen = generatedContent.resumen;
    draft.clausulasSugeridas = generatedContent.clausulasSugeridas;

    const updatedDraft = await this.contractDraftRepository.save(draft);

    return this.toContractDraftResponse(updatedDraft);
  }
}