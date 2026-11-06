import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { CreateSubmissionSchema, ListQuerySchema, TransitionSchema } from './submission.schema';
import { AuthGuard } from '../auth/auth.guard';
import type { SessionClaims } from '../auth/session-token';

@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissions: SubmissionsService) {}

  @Get()
  async list(@Query() rawQuery: unknown) {
    const query = ListQuerySchema.parse(rawQuery);
    return this.submissions.list(query);
  }

  @Get(':id')
  async detail(@Param('id') id: string) {
    return this.submissions.detail(id);
  }

  @Get(':id/audit')
  async audit(@Param('id') id: string) {
    const submission = await this.submissions.detail(id);
    return this.submissions.verifyChain(submission.subjectType, submission.id);
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() rawBody: unknown, @Req() req: { session: SessionClaims }) {
    const body = CreateSubmissionSchema.parse(rawBody);
    // submittedBy wajib sama dengan sesi, mencegah pemalsuan identitas pengaju.
    if (body.submittedBy !== req.session.sub) {
      body.submittedBy = req.session.sub;
    }
    return this.submissions.create(body);
  }

  @Post(':id/transition')
  @UseGuards(AuthGuard)
  async transition(
    @Param('id') id: string,
    @Body() rawBody: unknown,
    @Req() req: { session: SessionClaims },
  ) {
    const body = TransitionSchema.parse(rawBody);
    // actorPersonId selalu diambil dari sesi, bukan dari body.
    return this.submissions.transition(
      id,
      { ...body, actorPersonId: req.session.sub },
      req.session.positionCode,
    );
  }
}
