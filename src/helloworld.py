import os
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext.webapp import template

class MainPage(webapp.RequestHandler):
    def get(self):
        self.response.headers['Content-Type'] = 'text/plain'
        self.response.out.write('Hello, World! Please visit /Game URL!')

class GamePage(webapp.RequestHandler):
    def get(self):
        self.response.headers['Content-Type'] = 'text/html'
#       self.response.out.write('A Game will be here soon!')
        path = os.path.join(os.path.dirname(__file__), 'html/game.html')
#        print path
        self.response.out.write(template.render(path, {}))


class TestPage(webapp.RequestHandler):
    def get(self):
        self.response.headers['Content-Type'] = 'text/html'
        path = os.path.join(os.path.dirname(__file__), 'html/test.html')
        self.response.out.write(template.render(path, {}))

    def post(self):
        self.response.headers['Content-Type'] = 'text/plain'
        self.response.out.write(self.request.get('data'))
        #path = os.path.join(os.path.dirname(__file__), 'html/game.html')
        #self.response.out.write(template.render(path, {}))
        #print 'POST'
                
application = webapp.WSGIApplication([('/', MainPage),
                                      (r'/[G,g]ame', GamePage),
                                      (r'/[T,t]est', TestPage)],
                                     debug=True)


def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()
