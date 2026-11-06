import { Module } from '@nestjs/common';
import { ConfigModule } from './platform/config/config.module';
import { PrismaModule } from './platform/prisma/prisma.module';
import { RedisModule } from './platform/redis/redis.module';
import { StorageModule } from './platform/storage/storage.module';
import { SearchModule } from './platform/search/search.module';
import { PdfModule } from './platform/pdf/pdf.module';
import { OpenApiModule } from './platform/openapi/openapi.module';
import { HealthModule } from './platform/health/health.module';
import { SimulationModule } from './simulation/simulation.module';
import { RegistryModule } from './kernel/registry/registry.module';
import { FeaturesModule } from './features/features.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { ReferenceModule } from './reference/reference.module';
import { AuthModule } from './auth/auth.module';
import { NumberingModule } from './numbering/numbering.module';
import { RegistersModule } from './registers/registers.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    RedisModule,
    StorageModule,
    SearchModule,
    PdfModule,
    OpenApiModule,
    HealthModule,
    SimulationModule,
    RegistryModule,
    FeaturesModule,
    SubmissionsModule,
    ReferenceModule,
    AuthModule,
    NumberingModule,
    RegistersModule,
  ],
})
export class AppModule {}
