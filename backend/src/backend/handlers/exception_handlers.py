from backend.handlers.app_exception import AppException
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import ValidationError

# Main Control Unit


def registerErrorHandlers(app: FastAPI):

    def validation_exception_handler(
        request: Request, exception: RequestValidationError
    ):
        errorData = exception.errors()

        messages: list[str] = []

        for err in errorData:
            field = ".".join(map(str, err["loc"][1:]))  # skip 'query/body'
            msg = err["msg"]
            input = err["input"]

            messages.append(f"{field}={input}: {msg}")

        return JSONResponse(
            status_code=406,
            content={
                "success": False,
                "message": ", ".join(messages),
                "data": exception.errors(),
            },
        )

    app.exception_handler(RequestValidationError)(validation_exception_handler)

    def pydantic_validation_handler(request: Request, exception: ValidationError):
        errors = exception.errors()

        messages: list[str] = []

        for err in errors:
            field = ".".join(map(str, err["loc"]))
            messages.append(f"{field}: {err['msg']}")

        return JSONResponse(
            status_code=406,
            content={"success": False, "message": ", ".join(messages), "data": errors},
        )

    app.exception_handler(ValidationError)(pydantic_validation_handler)

    def http_exception_handler(request: Request, exc: HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"success": False, "message": exc.detail, "data": None},
        )

    app.exception_handler(HTTPException)(http_exception_handler)

    def app_exception_handler(request: Request, exc: AppException):

        return JSONResponse(
            status_code=exc.status_code,
            content={"success": False, "message": exc.message, "data": exc.data},
        )

    app.exception_handler(AppException)(app_exception_handler)

    def global_exception_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": str(exc),
                "data": {"type": exc.__class__.__name__},
            },
        )

    app.exception_handler(Exception)(global_exception_handler)
