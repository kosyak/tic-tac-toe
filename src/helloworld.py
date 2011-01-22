import os
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext.webapp import template
from google.appengine.ext import db

import game
import player
import random
import time

class MainPage(webapp.RequestHandler):
    def get(self):
        #self.response.headers['Content-Type'] = 'text/plain'
#        self.response.out.write("""
#      <html>
#        <body>
#          <form action="/gamestart" method="post">
#            <div><textarea name="content" rows="3" cols="60">player1 player2</textarea></div>
#            <div><input type="submit" value="play"></div>
#          </form>
#        </body>
#      </html>""")
        self.response.headers['Content-Type'] = 'text/html'
        path = os.path.join(os.path.dirname(__file__), 'html/main.html')
        self.response.out.write(template.render(path, {}))


def buildGame(players_names):
        #players_names = self.request.get("content")
        first_name = players_names.split()[0]
        second_name = players_names.split()[1]
        curent_game = game.TheGame(player.getUid(first_name),player.getUid(second_name))
        curent_game_record = game.GameRecord()
        curent_game_record.pack(curent_game)
        curent_game_record.put()
        #self.redirect('/game', True)

class OnlineChecker(webapp.RequestHandler):
    def post(self):
        if self.request.get('online') != 0:
            return
        cur_uid = self.request.cookies.get('uid', None)
        if cur_uid:
            cur_query = db.GqlQuery("SELECT * FROM Player " + 
                "WHERE record_of_uid = :1", cur_uid)
            cur_player_record = cur_query.get()
            if not cur_player_record:
                return
            cur_player_record.record_last_online = time.mktime(time.gmtime())
            cur_player_record.put()
            

class GamePage(webapp.RequestHandler):
    def post(self):
        player_name = self.request.get('name')
        cur_player = player.Player(player_name)
        cur_record_player = player.PlayerRecord()
        cur_record_player.pack(cur_player)
        cur_record_player.put()
        #make cookies
        
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
                                      ('/onlinechecker', OnlineChecker)],
                                      ('gamestart', GameStarer)
                                      debug=True)


def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()
