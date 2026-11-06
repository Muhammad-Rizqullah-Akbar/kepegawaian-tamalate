import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('health')
  health() {
    return { status: 'ok', at: new Date().toISOString() };
  }

  @Get('ready')
  ready() {
    return { status: 'ready' };
  }
}
