import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { RegistersService } from './registers.service';
import { BOOKS, CreateEntryBody } from './registers.schema';
import { AuthGuard } from '../auth/auth.guard';
import type { SessionClaims } from '../auth/session-token';

// Kontrak minimal yang benar-benar dipakai controller ini.
// Sengaja tidak mengimpor tipe framework agar tidak menambah dependensi runtime.
interface AuthedRequest {
  session?: SessionClaims;
}

@Controller('registers')
export class RegistersController {
  constructor(private readonly registers: RegistersService) {}

  @Get()
  books() {
    return { items: BOOKS };
  }

  @Get(':book/entries')
  list(@Param('book') book: string, @Query('limit') limit?: string, @Query('offset') offset?: string) {
    const lim = Math.min(Math.max(Number(limit ?? 50), 1), 200);
    const off = Math.max(Number(offset ?? 0), 0);
    return this.registers.list(book, lim, off);
  }

  @Get(':book/entries/:id')
  get(@Param('book') book: string, @Param('id') id: string) {
    return this.registers.get(book, id);
  }

  @Post(':book/entries')
  @UseGuards(AuthGuard)
  create(@Param('book') book: string, @Body() raw: unknown, @Req() req: AuthedRequest) {
    const claims = req.session;
    if (!claims) {
      throw new Error('Session tidak tersedia setelah AuthGuard, ini cacat wiring');
    }
    const body = CreateEntryBody.parse(raw);
    return this.registers.create(book, body, claims.sub);
  }
}
