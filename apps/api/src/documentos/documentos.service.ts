import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import PDFDocument from 'pdfkit';
import { LegalDocument } from './legal-document.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { Client } from '../clients/client.entity';
import { Expediente } from '../expedientes/expediente.entity';

@Injectable()
export class DocumentosService {
  constructor(
    @InjectRepository(LegalDocument)
    private readonly legalDocumentRepository: Repository<LegalDocument>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(Expediente)
    private readonly expedienteRepository: Repository<Expediente>,
  ) {}

  private async ensureClientExists(clienteId: string) {
    const client = await this.clientRepository.findOne({ where: { id: clienteId } });
    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }
  }

  private applyTemplate(template: string, variables?: Record<string, string>) {
    if (!variables) {
      return template;
    }

    return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => {
      return variables[key] ?? `{{${key}}}`;
    });
  }

  private async generateDocxBase64(text: string) {
    const paragraphs = text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => new Paragraph({ children: [new TextRun(line)] }));

    const doc = new Document({
      sections: [
        {
          children: paragraphs.length > 0 ? paragraphs : [new Paragraph({ children: [new TextRun(text)] })],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    return buffer.toString('base64');
  }

  private async generatePdfBase64(text: string) {
    return new Promise<string>((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks).toString('base64')));
      doc.on('error', reject);

      doc.fontSize(12).text(text);
      doc.end();
    });
  }

  private async resolveRelations(payload: { clienteId?: string; expedienteId?: string }) {
    let clienteId = payload.clienteId ?? null;
    let expedienteId = payload.expedienteId ?? null;

    if (expedienteId) {
      const expediente = await this.expedienteRepository.findOne({ where: { id: expedienteId } });
      if (!expediente) {
        throw new NotFoundException('Expediente no encontrado');
      }

      if (clienteId && clienteId !== expediente.clienteId) {
        throw new BadRequestException('El expediente no pertenece al cliente seleccionado');
      }

      clienteId = clienteId ?? expediente.clienteId;
    }

    if (clienteId) {
      await this.ensureClientExists(clienteId);
    }

    return { clienteId, expedienteId };
  }

  private async buildDocumentContent(payload: {
    plantilla: string;
    variables?: Record<string, string>;
    formato: 'docx' | 'pdf';
  }) {
    const contenidoTexto = this.applyTemplate(payload.plantilla, payload.variables);
    const contenidoBase64 =
      payload.formato === 'docx'
        ? await this.generateDocxBase64(contenidoTexto)
        : await this.generatePdfBase64(contenidoTexto);

    return { contenidoTexto, contenidoBase64 };
  }

  async create(payload: CreateDocumentDto) {
    const relations = await this.resolveRelations(payload);
    const generated = await this.buildDocumentContent(payload);

    const document = this.legalDocumentRepository.create({
      nombreArchivo: payload.nombreArchivo,
      tipoDocumento: payload.tipoDocumento,
      formato: payload.formato,
      plantilla: payload.plantilla,
      variables: payload.variables ?? null,
      contenidoTexto: generated.contenidoTexto,
      contenidoBase64: generated.contenidoBase64,
      observaciones: payload.observaciones ?? null,
      clienteId: relations.clienteId,
      expedienteId: relations.expedienteId,
    });

    return this.legalDocumentRepository.save(document);
  }

  async generateWord(payload: Omit<CreateDocumentDto, 'formato'>) {
    return this.create({ ...payload, formato: 'docx' });
  }

  async generatePdf(payload: Omit<CreateDocumentDto, 'formato'>) {
    return this.create({ ...payload, formato: 'pdf' });
  }

  findAll() {
    return this.legalDocumentRepository.find({
      order: { createdAt: 'DESC' },
      relations: { cliente: true, expediente: true },
    });
  }

  async findOne(id: string) {
    const doc = await this.legalDocumentRepository.findOne({
      where: { id },
      relations: { cliente: true, expediente: true },
    });

    if (!doc) {
      throw new NotFoundException('Documento no encontrado');
    }

    return doc;
  }

  async update(id: string, payload: UpdateDocumentDto) {
    const current = await this.findOne(id);

    const relations = await this.resolveRelations({
      clienteId: payload.clienteId ?? current.clienteId ?? undefined,
      expedienteId: payload.expedienteId ?? current.expedienteId ?? undefined,
    });

    const nextFormato = payload.formato ?? current.formato;
    const nextPlantilla = payload.plantilla ?? current.plantilla;
    const nextVariables = payload.variables ?? current.variables ?? undefined;

    const shouldRegenerate =
      payload.formato !== undefined ||
      payload.plantilla !== undefined ||
      payload.variables !== undefined;

    let generated = {
      contenidoTexto: current.contenidoTexto,
      contenidoBase64: current.contenidoBase64,
    };

    if (shouldRegenerate) {
      generated = await this.buildDocumentContent({
        formato: nextFormato,
        plantilla: nextPlantilla,
        variables: nextVariables,
      });
    }

    Object.assign(current, {
      nombreArchivo: payload.nombreArchivo ?? current.nombreArchivo,
      tipoDocumento: payload.tipoDocumento ?? current.tipoDocumento,
      formato: nextFormato,
      plantilla: nextPlantilla,
      variables: nextVariables ?? null,
      observaciones: payload.observaciones ?? current.observaciones,
      clienteId: relations.clienteId,
      expedienteId: relations.expedienteId,
      contenidoTexto: generated.contenidoTexto,
      contenidoBase64: generated.contenidoBase64,
    });

    return this.legalDocumentRepository.save(current);
  }

  async remove(id: string) {
    const doc = await this.findOne(id);
    await this.legalDocumentRepository.remove(doc);
    return { message: 'Documento eliminado' };
  }
}
