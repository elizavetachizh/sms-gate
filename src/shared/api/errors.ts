export class ApiError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(status: number, body: unknown) {
    super(`Request failed with status ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

export class UnauthorizedError extends ApiError {
  constructor() {
    super(401, { detail: 'Unauthorized' })
    this.name = 'UnauthorizedError'
  }
}

export class NotFoundError extends ApiError {
  readonly detail: string

  constructor(detail: string) {
    super(404, { detail })
    this.name = 'NotFoundError'
    this.detail = detail
  }
}

export interface ValidationDetail {
  type: string
  loc: (string | number)[]
  msg: string
  input?: unknown
}

export class ValidationError extends ApiError {
  readonly details: ValidationDetail[]

  constructor(details: ValidationDetail[]) {
    super(422, { detail: details })
    this.name = 'ValidationError'
    this.details = details
  }

  static async fromResponse(response: Response): Promise<ValidationError> {
    const body = (await response.json()) as { detail?: ValidationDetail[] }
    return new ValidationError(body.detail ?? [])
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export function isUnauthorizedError(error: unknown): error is UnauthorizedError {
  return error instanceof UnauthorizedError
}

export function isNotFoundError(error: unknown): error is NotFoundError {
  return error instanceof NotFoundError
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError
}
