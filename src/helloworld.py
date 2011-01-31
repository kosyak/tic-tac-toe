from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext import webapp

from MainPage import MainPage
from GameStart import GameStart
from OnlineChecker import OnlineChecker
from GamePage import GamePage
from TestPage import TestPage
from GameRepaint import GameRepaint
from GameProcess import GameProcess
from GameStatus import GameStatus
from Playing import Playing
     
application = webapp.WSGIApplication([('/', MainPage),
                                      (r'/[G,g]ame', GamePage),
                                      (r'/[T,t]est', TestPage),
                                      ('/onlinechecker', OnlineChecker),
                                      ('/gamestart', GameStart),
                                      ('/gameprocess', GameProcess),
                                      ('/gamerepaint', GameRepaint),
                                      ('/gamestatus', GameStatus),
                                      ('/gameprocess2', Playing)
                                      ],
                                      debug=True)

def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()
