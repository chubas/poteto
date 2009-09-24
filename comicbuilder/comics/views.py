from django.shortcuts import render_to_response, get_object_or_404
from comicbuilder.comics.models import *
from django.template import RequestContext

#from django.forms import form_for_model
from django import forms
from django.forms import ModelForm

from django.http import HttpResponseRedirect

def create(request):
	char_profiles = CharacterProfile.objects.all()
	backgrounds = Background.objects.all()
	return render_to_response(
		"create.html",
		{ 'char_profiles':char_profiles, 'backgrounds':backgrounds },
		context_instance = RequestContext(request)
	)

def characters(request, char_profile_id):
	char_profile_id = int(char_profile_id)
	characters = Character.objects.filter(character_profile = char_profile_id)
	return render_to_response(
		"characters.html",
		{ 'characters':characters }
	)

def comic(request, comic_id):
	comic = get_object_or_404(Comic, id=int(comic_id))
	return render_to_response(
		"comic.html",
		{'comic':comic}
	)

#ComicForm = form_for_model(Comic)
class ComicForm(forms.ModelForm):
  class Meta:
    model = Comic

def save(request):
	if request.method != 'POST':
		return HttpResponseRedirect("/error");
	else:
		for k in request.POST:
			print "%s => %s" % (k, request.POST[k])
		form = ComicForm(request.POST)
		if form.is_valid():
			new_comic = form.save()
			return HttpResponseRedirect('/show/' + str(new_comic.id))
		else:
			# Should never get here...
			print "An error ocurred saving a comic!", form.errors
			return HttpResponseRedirect('/error')

def show(request, id):
	if not id:
		id = None;
	return render_to_response(
		'show.html',
		{'comic_to_show':id},
		context_instance = RequestContext(request)
	)

