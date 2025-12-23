type ApiResponse<T = unknown> = {
  message?: string | null
  data?: T | null
  meta?: Meta | null
}

type Meta = {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

type Criteria = {
  page?: number
  limit?: number
  search?: string
  paginate?: boolean
}

type Breadcrumb = {
  label: string
  to: { name: string; params?: Record<string, string | number> }
}
