from django.http import HttpResponse

class SetUser:
	def process_view(self, request, view, args, kwargs):
		if not 'user' in kwargs:
			kwargs['user'] = request.user
		return None
