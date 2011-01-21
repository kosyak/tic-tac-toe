import os
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext.webapp import template
from google.appengine.ext import db

import game
import random

class MainPage(webapp.RequestHandler):
    def get(self):
        #self.response.headers['Content-Type'] = 'text/plain'
        self.response.out.write("""
      <html>
        <body>
          <form action="/gamestart" method="post">
            <div><textarea name="content" rows="3" cols="60">player1 player2</textarea></div>
            <div><input type="submit" value="play"></div>
          </form>
        </body>
      </html>""")

def getUid(name):
    res = 0
    for ch in name:
        res = res * 239 + ord(ch)
        if res > 10**9 + 9:
            res -= 10**9 + 9
    return int(random.random() * res) 

class GameStarterPage(webapp.RequestHandler):
    def post(self):
        players_names = self.request.get("content")
        first_name = players_names.split()[0]
        second_name = players_names.split()[1]
        self.response.headers['Content-Type'] = 'text/html'
        self.response.out.write('Making game for players ' + first_name + ' and ' + second_name)
        curent_game = game.TheGame(getUid(first_name), getUid(second_name))
        curent_game_record = game.GameRecord()
        curent_game_record.pack(curent_game)
        curent_game_record.put()
        self.redirect('/game', True)
    def get(self):
        print 'Nothing!'
        
class GamePage(webapp.RequestHandler):
    def get(self):
        games = db.GqlQuery("SELECT * FROM GameRecord")
        self.response.headers['Content-Type'] = 'text/plain'
        self.response.out.write("There is a list of game_ids: \n")
        c = 0
        for g in games: 
            c += 1
            self.response.out.write(str(c) + '-th game has id ' + g.record_of_game_id + '\n')
             
        
#       self.response.out.write('A Game will be here soon!')
        #path = os.path.join(os.path.dirname(__file__), 'html/game.html')
#        print path
        #self.response.out.write(template.render(path, {}))

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
                                      (r'/[T,t]est', TestPage),
                                      (r'/[G,g]amestart', GameStarterPage)
                                      ],
                                     debug=True)


def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()
