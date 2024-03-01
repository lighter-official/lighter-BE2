import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma/prisma.service';

@Injectable()
export class BadgeService {
  constructor(private readonly prismaService: PrismaService) {}
}
