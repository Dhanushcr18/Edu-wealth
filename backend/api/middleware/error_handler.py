import logging
from django.http import JsonResponse

logger = logging.getLogger(__name__)


class ErrorHandlerMiddleware:
    """
    Middleware to handle errors globally.
    """
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        response = self.get_response(request)
        return response
    
    def process_exception(self, request, exception):
        """
        Handle exceptions globally.
        """
        logger.error(f"Error processing request: {str(exception)}", exc_info=True)
        
        return JsonResponse(
            {'error': 'Internal server error'},
            status=500
        )
