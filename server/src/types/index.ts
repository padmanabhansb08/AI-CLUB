
export interface Pagination {
  page: number;
  limit: number;
}
export interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}
