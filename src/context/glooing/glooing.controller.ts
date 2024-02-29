import { Controller } from '@nestjs/common';
import { GlooingService } from './glooing.service';

@Controller('glooing')
export class GlooingController {
  constructor(private readonly glooingService: GlooingService) {}
}
