import { Controller, Get } from '@nestjs/common';
import { ReferenceService } from './reference.service';

@Controller('reference')
export class ReferenceController {
  constructor(private readonly reference: ReferenceService) {}

  @Get('persons')
  async persons() {
    return { items: await this.reference.persons() };
  }

  @Get('positions')
  async positions() {
    return { items: await this.reference.positions() };
  }
}
