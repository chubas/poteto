from SimpleXMLRPCServer import SimpleXMLRPCDispatcher
from django.http import HttpResponse
from django.shortcuts import render_to_response
from comicbuilder.comics.models import Comic

dispatcher = SimpleXMLRPCDispatcher( allow_none=False, encoding=None )

# Method definition section

def recent_comic_titles():
	"""
	Returns the last 10 comic titles
	"""
	return [comic.title for comic in Comic.objects.all().order_by('-created_on')[0:10]]
	
dispatcher.register_function(recent_comic_titles, 'recent_comic_titles')


#################################

def handle_xmlrpc(request):
	response = HttpResponse()
	if len(request.POST):
		response.write(dispatcher._marshaled_dispatch(request.raw_post_data))
	else:
		response = render_to_response(
			"xmlrpc_methods.xml",
			{'methods':
				[
					{
						'name': method,
						'signature': dispatcher.system_methodSignature(method),
						'help': dispatcher.system_methodHelp(method)
					} for method in dispatcher.system_listMethods()
				]
			}
		)
	response['Content-length'] = str(len(response.content))
	response['Content-type'] = 'text/xml'
	return response