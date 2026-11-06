import { Injectable } from '@nestjs/common';
import { SUBJECT_TYPE_INDEX, SUBJECT_TYPES, type SubjectTypeDef } from './subject-type.catalog';

@Injectable()
export class SubjectTypeService {
  list(): readonly SubjectTypeDef[] {
    return SUBJECT_TYPES;
  }

  get(code: string): SubjectTypeDef {
    const found = SUBJECT_TYPE_INDEX.get(code);
    if (!found) throw new Error('subjectType tidak terdaftar di K5: ' + code);
    return found;
  }

  isRegistered(code: string): boolean {
    return SUBJECT_TYPE_INDEX.has(code);
  }
}
