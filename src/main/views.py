from django.shortcuts import get_object_or_404, render, redirect
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.forms.models import model_to_dict
from django.shortcuts import redirect
import re
from .models import *
import logging
logger = logging.getLogger(__name__)

# utility function
def contains_regex(s, regex):
    pattern = re.compile(regex)
    return bool(pattern.search(s))


def webmanifest(request):
    context = {}
    return render(request, 'main/site.webmanifest', context)


def index(request):
    context = {"title":"Scripter"}
    if request.user.is_authenticated:
        response = redirect('/home')
        return response
    # logging.info("test message")
    return render(request, 'main/index.html', context)


def about(request):
    context = {"title":"About"}
    return render(request, 'main/about.html', context)

def privacy(request):
    context = {"title":"Privacy"}
    return render(request, 'main/privacy.html', context)

def terms(request):
    context = {"title":"Terms"}
    return render(request, 'main/terms.html', context)

@login_required
def home(request):
    context = {"title":"Home"}
    # logging.info(model_to_dict(request.user))
    context["scripts"] = Script.objects.filter(owner=request.user).order_by("created_at")
    return render(request, 'main/home.html', context)




# main script-writing view
@login_required
def edit(request, id):
    context = {"script_id":id, "title":"Edit"}
    try:
        script = Script.objects.get(id=id)  #doesn't have to be the owner as a player
        context["title"] = f"Edit: {script.name}"
        context["script"] = script
        context["is_owner"] = (script.owner_id == request.user.id)
        # context["state"] = script.get_state(request.user)
        return render(request, 'main/edit.html', context)
        
    except Exception as e:
        logging.info("ERROR")
        logging.info(e)
        context["error"] = e
        return render(request, 'main/error.html', context)







# when a user joins an existing script
def join(request, joincode):
    context = {"joincode":joincode, "title":"Join"}
    try:
        logging.info(f"joining a script: {joincode}")
        return render(request, 'main/home.html', context)
        
    except:
        logging.info("ERROR")
        context["error"] = "bad_code"
        return render(request, 'main/index.html', context)

# for viewing public scripts
def public(request, publiccode):
    context = {"publiccode":publiccode, "title":"Public"}
    try:
        logging.info(f"Viewing publicly shared script: {publiccode}")
        return render(request, 'main/home.html', context)
        
    except:
        logging.info("ERROR")
        context["error"] = "bad_code"
        return render(request, 'main/index.html', context)
