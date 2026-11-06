export type ExtensionKind = 'guard' | 'strategy' | 'renderer' | 'resolver';

export interface ExtensionPoint<TInput = unknown, TOutput = unknown> {
  readonly key: string;
  readonly kind: ExtensionKind;
  run(input: TInput): Promise<TOutput>;
}

export interface ExtensionRegistry {
  register<TIn, TOut>(point: ExtensionPoint<TIn, TOut>): void;
  resolve<TIn, TOut>(key: string): ExtensionPoint<TIn, TOut>;
  has(key: string): boolean;
  list(): readonly string[];
}
