from typing import Any


class AppException(Exception):
    def __init__(
        self,
        status_code: int = 500,
        message: str = "Internal server error",
        data: dict[str, Any] | None = None,
    ):
        self.status_code = status_code
        self.message = message
        self.data = data
