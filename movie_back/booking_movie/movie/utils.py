from django.conf import settings
from django.utils.cache import patch_cache_control
from threading import current_thread

def get_language():
    """
    Returns the current language, based on settings, session, cookie, or request.
    """
    # Get the current thread-local data
    thread = current_thread()
    if hasattr(thread, 'language'):
        return thread.language

    # Check if there's a request in the context (e.g., in a view)
    from django.http import HttpRequest
    request = getattr(thread, 'request', None)
    
    if request is not None:
        # Check session or cookie for language preference
        if hasattr(request, 'session') and 'django_language' in request.session:
            return request.session['django_language']
        
        # Check Accept-Language header
        if hasattr(request, 'META') and 'ACCEPT_LANGUAGE' in request.META:
            from django.utils.http import parse_accept_lang_header
            languages = parse_accept_lang_header(request.META['ACCEPT_LANGUAGE'])
            if languages:
                return languages[0][0]  # Return the first preferred language

    # Fall back to default language from settings
    return settings.LANGUAGE_CODE