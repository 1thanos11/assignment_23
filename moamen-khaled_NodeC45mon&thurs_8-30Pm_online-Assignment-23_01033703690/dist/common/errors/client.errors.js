import { AppError } from "./app.errors.js";
export class BadRequestError extends AppError {
    constructor(message = "Bad Request", cause) {
        super(400, message, { cause });
    }
}
export class NotFoundError extends AppError {
    constructor(message = "Not Found", cause) {
        super(404, message, { cause });
    }
}
export class UnauthorizedError extends AppError {
    constructor(message = "Unauthorized", cause) {
        super(401, message, { cause });
    }
}
export class ForbiddenError extends AppError {
    constructor(message = "Forbidden", cause) {
        super(403, message, { cause });
    }
}
export class ConflictError extends AppError {
    constructor(message = "Conflict", cause) {
        super(409, message, { cause });
    }
}
export class TooManyRequestsError extends AppError {
    constructor(message = "Too Many Requests", cause) {
        super(429, message, { cause });
    }
}
export class ValidationError extends AppError {
    constructor(message = "Validation Error", cause) {
        super(422, message, { cause });
    }
}
