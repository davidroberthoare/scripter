from django import template
from django.conf import settings
from django.templatetags.static import static
import time
import os

register = template.Library()


# settings value
@register.simple_tag
def settings_value(name):
    return getattr(settings, name, "")



# fetches the modification_date from the git repo - - will change with each commit or pull.
@register.simple_tag
def version_date():
    try:
        # logger.debug(getattr(settings, "BASE_DIR"))
        version = time.strftime('%Y_%m_%d_%H_%M_%S', time.gmtime(os.path.getmtime(f'{getattr(settings, "BASE_DIR")}/../.git')))
        # logger.debug(f"VERSION: {version}")
    except Exception as e:
        # logger.error(f"error: {e}")
        version = "1"
    return version



@register.simple_tag
def vstatic(path):
    url = static(path)
    # static_version = getattr(settings, 'STATIC_VERSION', '')
    version = time.strftime('%Y_%m_%d_%H_%M_%S', time.gmtime(os.path.getmtime(f'{getattr(settings, "BASE_DIR")}/../.git')))
    if version:
         url += '?v=' + version
    return url