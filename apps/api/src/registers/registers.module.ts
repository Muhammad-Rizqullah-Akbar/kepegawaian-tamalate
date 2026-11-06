import { Module } from '@nestjs/common';
import { RegistersController } from './registers.controller';
import { RegistersService } from './registers.service';
import { PrismaModule } from '../platform/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [RegistersController],
  providers: [RegistersService],
})
export class RegistersModule {}
