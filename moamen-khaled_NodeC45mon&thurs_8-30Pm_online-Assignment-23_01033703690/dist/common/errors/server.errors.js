import { AppError } from "./app.errors.js";
export class InternalServerError extends AppError {
    constructor(message = "Internal Server Error", cause) {
        super(500, message, { cause });
    }
}
