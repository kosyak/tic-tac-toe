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


def buildGame(players_ids):
        curent_game = game.TheGame(players_ids[0], players_ids[1])
        curent_game_record = game.GameRecord()
        curent_game_record.pack(curent_game)
        curent_game_record.put()
        

class OnlineChecker(webapp.RequestHandler):
    def post(self):
        if self.request.get('online') != 0:
            return
        cur_uid = self.request.cookies.get('uid', None)
        if cur_uid:
            cur_query = db.GqlQuery("SELECT * FROM PlayerRecord " + 
                "WHERE record_of_uid = :1", str(cur_uid))
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
        self.request.cookies['uid'] = cur_player.uid  
        self.response.headers['Content-Type'] = 'text/plain'
        self.response.out.write('number ' + str(db.GqlQuery("SELECT * FROM PlayerRecord").count()))
        
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
        self.response.out.write('number ' + str(db.GqlQuery("SELECT * FROM PlayerRecord").count()))
    def post(self):
        self.response.headers['Content-Type'] = 'text/plain'
        self.response.out.write(self.request.get('data'))
        #path = os.path.join(os.path.dirname(__file__), 'html/game.html')
        #self.response.out.write(template.render(path, {}))
        #print 'POST'
                
class GameStart(webapp.RequestHandler):
    def get(self):
        cur_query = db.GqlQuery("SELECT * FROM PlayerRecord " + 
                                "WHERE record_of_last_online > :1", str(time.mktime(time.gmtime()) - 20))
        if not cur_query or cur_query.count(2) < 2:
            return
        else:
            buildGame([cur_query.get(0).record_of_uid, cur_query.get(1).record_of_uid])
             
            self.redirect('/game', True)     
        

application = webapp.WSGIApplication([('/', MainPage),
                                      (r'/[G,g]ame', GamePage),
                                      (r'/[T,t]est', TestPage),
                                      ('/onlinechecker', OnlineChecker),
                                      ('/gamestart', GameStart)],
                                      debug=True)


def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()
