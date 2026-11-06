import { Controller, Get, Param } from '@nestjs/common';
import { FeaturesService } from './features.service';

@Controller('features')
export class FeaturesController {
  constructor(private readonly features: FeaturesService) {}

  @Get()
  list() {
    return { items: this.features.list(), groups: this.features.groups() };
  }

  @Get('stats')
  stats() {
    return this.features.stats();
  }

  @Get(':code')
  detail(@Param('code') code: string) {
    return this.features.get(code.toUpperCase());
  }
}
