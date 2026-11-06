import { Global, Module } from '@nestjs/common';
import { ExtensionRegistryService } from './extension-registry.service';
import { SubjectTypeService } from './subject-type.service';

@Global()
@Module({
  providers: [ExtensionRegistryService, SubjectTypeService],
  exports: [ExtensionRegistryService, SubjectTypeService],
})
export class RegistryModule {}
