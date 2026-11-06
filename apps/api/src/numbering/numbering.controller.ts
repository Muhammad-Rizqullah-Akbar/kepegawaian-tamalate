import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import { NumberingService } from './numbering.service';
import { AuthGuard } from '../auth/auth.guard';

const AllocateBody = z.object({
  scopeKey: z.string().min(3),
  prefix: z.string().min(1).max(32),
  width: z.number().int().min(1).max(10).optional(),
});

@Controller('numbering')
@UseGuards(AuthGuard)
export class NumberingController {
  constructor(private readonly numbering: NumberingService) {}

  @Post('allocate')
  async allocate(@Body() raw: unknown) {
    const body = AllocateBody.parse(raw);
    return this.numbering.allocate(body.scopeKey, body.prefix, body.width ?? 4);
  }

  @Get('peek')
  async peek(@Body() raw: unknown) {
    const body = AllocateBody.parse(raw);
    return { scopeKey: body.scopeKey, lastValue: await this.numbering.peek(body.scopeKey) };
  }
}
