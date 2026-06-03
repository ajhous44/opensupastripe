/**
 * Common repository response type used across all repositories
 */
export type RepositoryResponse<T> = {
  data?: T
  error?: {
    message: string
    code?: string
  }
}

/**
 * Query options for repository functions
 */
export interface QueryOptions {
  limit?: number
  offset?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
