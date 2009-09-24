from django.shortcuts import render_to_response
from comicbuilder.comics.models import *
from django.template import RequestContext
from django import forms
from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response
from django.contrib.auth.forms import UserCreationForm

def home(request):
	latest = Comic.objects.order_by('-created_on')
	return render_to_response(
		"home.html",
		{'latest':latest },
		context_instance = RequestContext(request)
	)

def error(request):
	return render_to_response("error.html")

def register(request):
    form = UserCreationForm()

    if request.method == 'POST':
        data = request.POST.copy()
        errors = form.get_validation_errors(data)
        if not errors:
            new_user = form.save(data)
            if new_user is not None:
              return HttpResponseRedirect("/")
    else:
        data, errors = {}, {}

    return render_to_response("register.html", {
        'form' : form
    })

