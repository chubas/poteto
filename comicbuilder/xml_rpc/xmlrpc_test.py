# Test for comicbuilder XML RPC Services

import xmlrpclib
server = xmlrpclib.ServerProxy("http://localhost:8000/xmlrpc/")
print server.recent_comic_titles()
