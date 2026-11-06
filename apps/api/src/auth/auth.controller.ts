import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import type { SessionClaims } from './session-token';

const LoginSchema = z.object({ nip: z.string().min(8).max(30) });

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  async login(@Body() raw: unknown) {
    const body = LoginSchema.parse(raw);
    return this.auth.login(body.nip);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  me(@Req() req: { session: SessionClaims }) {
    return req.session;
  }
}
