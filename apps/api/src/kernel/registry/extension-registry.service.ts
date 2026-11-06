import { Injectable, Logger } from '@nestjs/common';
import type { ExtensionPoint, ExtensionRegistry } from '../contracts/extension-point';

@Injectable()
export class ExtensionRegistryService implements ExtensionRegistry {
  private readonly log = new Logger(ExtensionRegistryService.name);
  private readonly points = new Map<string, ExtensionPoint<unknown, unknown>>();

  register<TIn, TOut>(point: ExtensionPoint<TIn, TOut>): void {
    if (this.points.has(point.key)) {
      this.log.warn('Extension key sudah terdaftar, ditolak: ' + point.key);
      return;
    }
    this.points.set(point.key, point as ExtensionPoint<unknown, unknown>);
  }

  resolve<TIn, TOut>(key: string): ExtensionPoint<TIn, TOut> {
    const point = this.points.get(key);
    if (!point) throw new Error('Extension key tidak terdaftar: ' + key);
    return point as ExtensionPoint<TIn, TOut>;
  }

  has(key: string): boolean {
    return this.points.has(key);
  }

  list(): readonly string[] {
    return [...this.points.keys()].sort();
  }
}
