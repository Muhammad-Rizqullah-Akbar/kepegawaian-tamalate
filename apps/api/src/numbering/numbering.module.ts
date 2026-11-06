import { Module } from '@nestjs/common';
import { NumberingController } from './numbering.controller';
import { NumberingService } from './numbering.service';
import { PrismaModule } from '../platform/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NumberingController],
  providers: [NumberingService],
  exports: [NumberingService],
})
export class NumberingModule {}
