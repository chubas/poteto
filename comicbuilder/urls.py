from django.conf.urls.defaults import *
from django.contrib import admin
import os.path as path
from django.contrib.auth.views import login, logout

admin.autodiscover()

static_doc_root = {'document_root':path.join(path.dirname(__file__), 'static').replace('\\', '/')}
media_doc_root = {'document_root':path.join(path.dirname(__file__), 'media', 'images').replace('\\', '/')}

urlpatterns = patterns('comicbuilder.views.views',
  (r'^$', 'home'),
  (r'^error/?$', 'error'),
  (r'^register/?$', 'register'),
)

urlpatterns += patterns('comicbuilder.comics.views',
	(r'^create/?$', 'create'),
	(r'^characters/(\d+)/?$', 'characters'),
	(r'^save/?$', 'save'),
	(r'^show/(\d*)/?$', 'show'),
	(r'^comic/(\d+)/?$', 'comic'),
)

urlpatterns += patterns('comicbuilder.xml_rpc.xmlrpc_handler',
	(r'^xmlrpc/', 'handle_xmlrpc'),
)

urlpatterns += patterns('',
	(r'^admin/(.*)', admin.site.root),
	(r'^login/?$', login, {'template_name':'login.html'}),
	(r'^logout/?$', logout, {'next_page':'/'}),
	(r'^images/(?P<path>.*)$', 'django.views.static.serve', media_doc_root),
	(r'^(?P<path>.*)$', 'django.views.static.serve', static_doc_root),
)

