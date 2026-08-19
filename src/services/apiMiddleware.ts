import { ApiResponse, successResponse, errorResponse, UnauthorizedError, ForbiddenError, ValidationError } from './apiResponse';
import { logger } from './logger';
import { User, UserRole } from '../types';

export interface ApiRequestContext<TBody = any, TQuery = any> {
  user: User | null;
  role: UserRole | null;
  body?: TBody;
  query?: TQuery;
  params?: Record<string, string>;
  path?: string;
}

export interface ApiSecurityPolicy {
  requireAuth?: boolean;
  allowedRoles?: UserRole[];
  requireScope?: {
    institute?: boolean;
    department?: boolean;
  };
}

export type PayloadValidator<T> = (data: any) => { valid: boolean; errors?: { field: string; message: string }[]; value?: T };

/**
 * Standard API Dispatcher Pipeline executing:
 * Request -> Auth (401) -> Authorization (403) -> Validation (422) -> Service -> Database -> Response
 */
export async function executeApiPipeline<TReq = any, TRes = any>(
  context: ApiRequestContext<TReq>,
  policy: ApiSecurityPolicy,
  validator: PayloadValidator<TReq> | null,
  handler: (validatedPayload: TReq, ctx: ApiRequestContext<TReq>) => Promise<TRes> | TRes
): Promise<ApiResponse<TRes>> {
  const { user, role, body, path } = context;

  try {
    // 1. Authentication Check (401)
    if (policy.requireAuth !== false && !user) {
      throw new UnauthorizedError('Authentication required to access this endpoint.');
    }

    // 2. Role & Authorization Check (403)
    if (policy.allowedRoles && policy.allowedRoles.length > 0) {
      if (!role || !policy.allowedRoles.includes(role)) {
        throw new ForbiddenError(`Access Denied: Role "${role || 'ANONYMOUS'}" is not authorized for this operation.`);
      }
    }

    // 3. Scope Isolation Check
    if (policy.requireScope?.institute && role === 'PRINCIPAL' && !user?.instituteId) {
      throw new ForbiddenError('Access Denied: Missing authorized institute scope on session.');
    }
    if (policy.requireScope?.department && role === 'HOD' && !user?.departmentId) {
      throw new ForbiddenError('Access Denied: Missing authorized department scope on session.');
    }

    // 4. Request Payload Validation (422)
    let validatedData = body as TReq;
    if (validator && body !== undefined) {
      const validation = validator(body);
      if (!validation.valid) {
        throw new ValidationError(
          'Request payload validation failed.',
          validation.errors?.map(e => ({ field: e.field, message: e.message }))
        );
      }
      if (validation.value !== undefined) {
        validatedData = validation.value;
      }
    }

    // 5. Execute Service / Handler
    const result = await handler(validatedData, context);

    // 6. Return Standard Envelope (200)
    return successResponse(result);
  } catch (err: unknown) {
    logger.error(`API Pipeline Error [${path || 'Endpoint'}]`, 'ApiMiddleware', err instanceof Error ? err : undefined, { user: user?.name, role });
    return errorResponse(err, path);
  }
}
