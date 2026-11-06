export interface PageQuery { page?: number; pageSize?: number }
export interface Page<T> { items: T[]; page: number; pageSize: number; total: number }

export function normalizePage(q: PageQuery): { skip: number; take: number; page: number; pageSize: number } {
  const page = Math.max(1, Number(q.page ?? 1) || 1);
  const pageSize = Math.min(200, Math.max(1, Number(q.pageSize ?? 25) || 25));
  return { skip: (page - 1) * pageSize, take: pageSize, page, pageSize };
}
