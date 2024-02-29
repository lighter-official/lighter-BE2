import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma/prisma.service';

@Injectable()
export class GlooingService {
  constructor(private readonly prismaService: PrismaService) {}
}
