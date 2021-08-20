import saveError from "./ErrorHistory";

export const errorHandler = (err, req, res, next) => {
    if(err instanceof GeneralError) {
        return res.status(err.getCode()).json({
            status: 'error',
            message: err.message
        });
    }

    saveError(err);
    return res.status(500).json({
        status: 'error',
        message: 'Internal server error'
    })
}

export class GeneralError extends Error {
    constructor(msg) {
        super(msg);
    }

    getCode() {
        if(this instanceof BadRequestError) return 400;
        else if(this instanceof UnauthorizedError) return 404;
        else if(this instanceof ForbiddenError) return 404;
        else if(this instanceof NotFoundError) return 404;
        else if(this instanceof ConflictError) return 409;
    }
}

export class BadRequestError extends GeneralError {
    constructor(msg) {
        super(msg);
        this.name = `BadRequestError:${msg}`;
    }
}

export class UnauthorizedError extends GeneralError {
    constructor(msg) {
        super(msg);
        this.name = `UnauthorizedError:${msg}`;
    }
}

export class ForbiddenError extends GeneralError {
    constructor(msg) {
        super(msg);
        this.name = `ForbiddenError:${msg}`;
    }
}

export class NotFoundError extends GeneralError {
    constructor(msg) {
        super(msg);
        this.name = `NotFoundError:${msg}`;
    }
}

export class ConflictError extends GeneralError {
    constructor(msg) {
        super(msg);
        this.name = `ConflictError:${msg}`;
    }
}