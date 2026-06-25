import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Response } from 'express';
import { BibliotecaService } from './biblioteca.service';
import { UploadBibliotecaDto } from './dto/upload-biblioteca.dto';
import { FindBibliotecaQueryDto } from './dto/find-biblioteca-query.dto';
import { ConsultarBibliotecaDto } from './dto/consultar-biblioteca.dto';
import { TextExtractionService } from './text-extraction.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

const ALLOWED_MIMES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]);

const ALLOWED_EXTS = new Set(['.pdf', '.docx', '.txt']);

const multerOptions = {
  storage: diskStorage({
    destination: 'uploads/biblioteca',
    filename: (_req, file, cb) => {
      const ext = extname(file.originalname).toLowerCase();
      cb(null, `${uuidv4()}${ext}`);
    },
  }),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (_req: unknown, file: Express.Multer.File, cb: (err: Error | null, accept: boolean) => void) => {
    const ext = extname(file.originalname).toLowerCase();
    if (!ALLOWED_MIMES.has(file.mimetype) || !ALLOWED_EXTS.has(ext)) {
      return cb(new BadRequestException('Tipo de archivo no permitido. Solo PDF, DOCX y TXT.'), false);
    }
    cb(null, true);
  },
};

@Controller(['api/biblioteca', 'biblioteca'])
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'abogado', 'asistente')
export class BibliotecaController {
  constructor(
    private readonly bibliotecaService: BibliotecaService,
    private readonly extractionService: TextExtractionService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('archivo', multerOptions))
  upload(
    @Request() req: { user: { userId: string } },
    @UploadedFile() file: Express.Multer.File,
    @Body() payload: UploadBibliotecaDto,
  ) {
    if (!file) {
      throw new BadRequestException('Se requiere un archivo');
    }
    return this.bibliotecaService.create(file, payload, req.user.userId);
  }

  @Post('consultar')
  consultar(
    @Request() req: { user: { userId: string } },
    @Body() payload: ConsultarBibliotecaDto,
  ) {
    return this.bibliotecaService.consultar(payload, req.user.userId);
  }

  @Get()
  findAll(@Query() query: FindBibliotecaQueryDto) {
    return this.bibliotecaService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bibliotecaService.findOne(id);
  }

  @Get(':id/file')
  async serveFile(@Param('id') id: string, @Res() res: Response) {
    const { filePath, mimeType, filename } = await this.bibliotecaService.resolveFilePath(id);
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(filename)}"`);
    res.sendFile(filePath);
  }

  @Post(':id/process')
  async processDocument(@Param('id') id: string) {
    return this.extractionService.processDocument(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bibliotecaService.remove(id);
  }
}

