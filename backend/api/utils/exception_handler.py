from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """Custom exception handler for Django REST Framework.

    In development, include the exception message so we can see what went
    wrong instead of a generic "Internal server error".
    """
    response = exception_handler(exc, context)

    if response is not None:
        # Normal DRF-handled errors (validation, auth, etc.)
        if isinstance(response.data, dict):
            error_message = response.data.get('detail', str(exc))
        else:
            error_message = str(exc)

        response.data = {
            'error': error_message,
        }
    else:
        # Unhandled exception – expose message during local development
        response = Response(
            {
                'error': 'Internal server error',
                'detail': str(exc),
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return response
