export type ApplicationErrorCode =
  | "UNAUTHENTICATED"
  | "ACCESS_DENIED"
  | "NOT_FOUND"
  | "VALIDATION_FAILED"
  | "UNEXPECTED_FAILURE";

export type Failure = {
  ok: false;
  error: { code: ApplicationErrorCode };
};

export type Success<T> = {
  ok: true;
  value: T;
};

export type Result<T> = Success<T> | Failure;

export function success<T>(value: T): Success<T> {
  return { ok: true, value };
}

export function failure(code: ApplicationErrorCode): Failure {
  return { ok: false, error: { code } };
}
