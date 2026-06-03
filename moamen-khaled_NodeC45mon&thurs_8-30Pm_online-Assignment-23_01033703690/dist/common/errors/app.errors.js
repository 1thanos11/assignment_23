export class AppError extends Error {
    status;
    constructor(status, message, cause) {
        super(message, { cause });
        this.status = status;
        this.name = this.constructor.name;
    }
}
