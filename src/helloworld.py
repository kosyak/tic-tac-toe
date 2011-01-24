import os
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext.webapp import template
from google.appengine.ext import db

import game
import player
import time

DIFF_TIME = 20

def getGameIdByRequest(request):
    cur_uid = int(request.cookies.get('uid', None))
    cur_query = db.GqlQuery("SELECT * FROM PlayerRecord " + 
               "WHERE record_of_uid = :1", cur_uid)
    cur_player_record = cur_query.get()
    if not cur_player_record:
        return None 
        
    return cur_player_record.record_of_game_id
            
def getUserIdByRequest(request):
    return int(request.cookies.get('uid', None))
         

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
        return curent_game.game_id

class OnlineChecker(webapp.RequestHandler):
    def post(self):
        if int(self.request.get('online')) != 1:
            #self.error(300)
            return
        
        cur_uid = int(self.request.cookies.get('uid', None))
        if cur_uid:
            #self.request.error(404)
            cur_query = db.GqlQuery("SELECT * FROM PlayerRecord " + 
                "WHERE record_of_uid = :1", cur_uid)
            cur_player_record = cur_query.get()
            if not cur_player_record:
                #self.error(301)
                return
            cur_player_record.record_of_last_online = time.mktime(time.gmtime())
            cur_player_record.put()
        else:
            #self.error(300)
            pass
            

class GamePage(webapp.RequestHandler):
    def post(self):
        player_name = self.request.get('name', None)
        cur_player = player.Player(player_name)
        cur_record_player = player.PlayerRecord()
        cur_record_player.pack(cur_player)
        cur_record_player.put()
        self.response.headers.add_header(
        'Set-Cookie', 
        'uid=%s; expires=Fri, 31-Dec-2020 23:59:59 GMT' \
          % (cur_player.uid))
        
        self.response.headers['Content-Type'] = 'text/plain'
        self.response.out.write('number ' + str(db.GqlQuery("SELECT * FROM PlayerRecord").count()))
        
    def get(self):
        path = os.path.join(os.path.dirname(__file__), r'html/game.html')
        self.response.out.write(template.render(path, {}))
        #self.response.out.write(path)
        '''self.response.headers['Content-Type'] = 'text/plain'
        cur_uid = int(self.request.cookies.get('uid', None))
        if cur_uid:
            cur_query = db.GqlQuery("SELECT * FROM PlayerRecord " + 
                "WHERE record_of_uid = :1", cur_uid)
            cur_player_record = cur_query.get()
            if not cur_player_record:
                return
            self.response.out.write("This man plays into game with id = " + str(cur_player_record.record_of_game_id) + '!\n')
            #cur_player_record.record_of_last_online = time.mktime(time.gmtime())
        #games = db.GqlQuery("SELECT * FROM GameRecord")
        #self.response.headers['Content-Type'] = 'text/plain'
        #self.response.out.write("There is a list of game_ids: \n")
        #c = 0
        #for g in games: 
        #    c += 1
        #    self.response.out.write(str(c) + '-th game has id ' + g.record_of_game_id + '\n')
             
        
#       self.response.out.write('A Game will be here soon!')
        #path = os.path.join(os.path.dirname(__file__), 'html/game.html')
#        print path
        #self.response.out.write(template.render(path, {}))'''
        

class TestPage(webapp.RequestHandler):
    def get(self):
        self.response.headers['Content-Type'] = 'text/html'
        self.response.out.write('number ' + str(db.GqlQuery("SELECT * FROM PlayerRecord").count()) + '<br>')

        for q in db.GqlQuery("SELECT * FROM PlayerRecord " + 
                                "WHERE record_of_last_online > :1", time.mktime(time.gmtime()) - DIFF_TIME):
            self.response.out.write('Name is ' + str(q.record_of_name) + '<br>')
            self.response.out.write('Uid is ' + str(q.record_of_uid) + '<br>')
            self.response.out.write('Last online is ' + str(q.record_of_last_online) + '<br>')
            self.response.out.write('Game id is ' + str(q.record_of_game_id) + '<br>')
            
        self.response.out.write("=" * 90 + "<br>")
        cur_uid = int(self.request.cookies.get('uid', None))
        self.response.out.write('Cur user in cookies is ' + str(cur_uid) + '<br>')
        if cur_uid:
            cur_query = db.GqlQuery("SELECT * FROM PlayerRecord " + 
                "WHERE record_of_uid = :1", cur_uid)
            cur_player_record = cur_query.get()
            self.response.out.write('Name is ' + str(cur_player_record.record_of_name) + '<br>')
            self.response.out.write('Uid is ' + str(cur_player_record.record_of_uid) + '<br>')
            self.response.out.write('Last online is ' + str(cur_player_record.record_of_last_online) + '<br>')
            q = db.GqlQuery("SELECT * FROM GameRecord WHERE record_of_game_id = :1", str(cur_player_record.record_of_game_id)).get()
            self.response.out.write('GameId is '+ str(q.record_of_game_id) + '<br>')
            self.response.out.write('First player uid is '+ str(q.record_first_player_uid) + '<br>')
            self.response.out.write('Second player uid is '+ str(q.record_second_player_uid) + '<br>')
            self.response.out.write('Curent turn is '+ str(q.record_of_turn) + '<br>')
            self.response.out.write('Last move is '+ str(q.record_of_last_move) + '<br>')
            self.response.out.write('Is_ended is '+ str(q.record_of_is_ended) + '<br>')
            self.response.out.write('<br>')
        else:
            self.response.out.write("No such user")
        self.response.out.write("=" * 90 + "<br>")
        for q in db.GqlQuery("SELECT * FROM GameRecord"):
            self.response.out.write('GameId is '+ str(q.record_of_game_id) + '<br>')
            self.response.out.write('First player uid is '+ str(q.record_first_player_uid) + '<br>')
            self.response.out.write('Second player uid is '+ str(q.record_second_player_uid) + '<br>')
            self.response.out.write('Curent turn is '+ str(q.record_of_turn) + '<br>')
            self.response.out.write('<br>')
            
            
        
    def post(self):
        self.response.headers['Content-Type'] = 'text/plain'
        self.response.out.write(self.request.get('data'))
        #path = os.path.join(os.path.dirname(__file__), 'html/game.html')
        #self.response.out.write(template.render(path, {}))
        #print 'POST'
                
class GameStart(webapp.RequestHandler):
    def get(self):
        cur_uid = int(self.request.cookies.get('uid', None))
        cur_query = db.GqlQuery("SELECT * FROM PlayerRecord " + 
                "WHERE record_of_uid = :1", cur_uid)
        cur_player_record = cur_query.get()
        if not cur_player_record:
            #self.error(111)
            return 
        
        if cur_player_record.record_of_game_id:
            #cur_player_record.delete()
            self.response.out.write('OK')
            return
            
        cur_query = db.GqlQuery("SELECT * FROM PlayerRecord " + 
                                "WHERE record_of_last_online > :1", time.mktime(time.gmtime()) - DIFF_TIME)
        
        if not cur_query or cur_query.count(2) < 2:
            return
        else:
            for player in cur_query:
                if player.record_of_uid != cur_player_record.record_of_uid and not player.record_of_game_id:
                    cur_player_record.record_of_game_id = 1635
                    player.record_of_game_id = 1635
                    cur_player_record.put()
                    player.put()
                    cur_game = buildGame(list((cur_player_record.record_of_uid, player.record_of_uid)))
                    #cur_player_record.delete()
                    cur_player_record.record_of_game_id = cur_game
                    cur_player_record.put()
                    player.record_of_game_id = cur_game
                    player.put()
                    #cur_query[0].delete()
                    #cur_query[0].delete()
                    self.response.out.write('OK')
                    #self.redirect('/game', True)
                    return
            else:
                self.error(333)
        
class GameProcess(webapp.RequestHandler):
    def post(self):
        game_id = getGameIdByRequest(self.request)
        player_id = getUserIdByRequest(self.request)
        cur_game_record = db.GqlQuery("SELECT * FROM GameRecord WHERE record_of_game_id = :1", str(game_id)).get()
        if not cur_game_record:
            self.error(301)
            return  
        cur_game = cur_game_record.unPack()
        x = int(self.request.get('x'))
        y = int(self.request.get('y'))
        if cur_game.turn == 0 and cur_game.first_player_uid == player_id or\
           cur_game.turn == 1 and cur_game.second_player_uid == player_id:
            if cur_game.is_ended:
                self.response.out.write('cannot')
                return
            can_move = cur_game.makeMove(x, y)
            cur_game_record.pack(cur_game)
            cur_game_record.put()
            if not can_move:
                self.response.out.write('cannot')
                return
            self.response.out.write('can ')
            self.response.out.write(' ' + ('X' if cur_game.turn else 'O') + ' ')
            if cur_game.is_ended:
                self.response.out.write(' ended ' + cur_game.getWinningString())
            else:
                self.response.out.write(' not_ended')
        else:
            self.response.out.write('cannot')
        
class GameRepaint(webapp.RequestHandler):
    def post(self):
        game_id = getGameIdByRequest(self.request)
        player_id = getUserIdByRequest(self.request)
        cur_game_record = db.GqlQuery("SELECT * FROM GameRecord WHERE record_of_game_id = :1", str(game_id)).get()
        if not cur_game_record:
            self.error(301)
            return  
        cur_game = cur_game_record.unPack()
        if cur_game.last_move != None and cur_game.last_move[0] == 1 and cur_game.first_player_uid == player_id or\
           cur_game.last_move != None and cur_game.last_move[0] == 0 and cur_game.second_player_uid == player_id:
            self.response.out.write(('X' if not cur_game.last_move[0] else 'O') + ' ' + str(cur_game.last_move[1]) + ' ' + str(cur_game.last_move[2]))

class GameStatus(webapp.RequestHandler):
    def post(self):
        game_id = getGameIdByRequest(self.request)
        player_id = getUserIdByRequest(self.request)
        cur_game_record = db.GqlQuery("SELECT * FROM GameRecord WHERE record_of_game_id = :1", str(game_id)).get()
        if not cur_game_record:
            self.error(301)
            return  
        cur_game = cur_game_record.unPack()
        opponent = db.GqlQuery("SELECT * FROM PlayerRecord WHERE record_of_uid = :1", cur_game.first_player_uid + cur_game.second_player_uid - player_id).get()
        if opponent.record_of_last_online < time.mktime(time.gmtime() - DIFF_TIME):
            self.response.out.write('opponent_offline') 
            return
        
        if cur_game.turn == 0 and cur_game.first_player_uid == player_id or\
           cur_game.turn == 1 and cur_game.second_player_uid == player_id:
                if cur_game.is_ended:
                    self.response.out.write('lose')
                else:
                    self.response.out.write('move')
        else: 
                if cur_game.is_ended:
                    self.response.out.write('win')
                else:
                    self.response.out.write('not_move')
                
application = webapp.WSGIApplication([('/', MainPage),
                                      (r'/[G,g]ame', GamePage),
                                      (r'/[T,t]est', TestPage),
                                      ('/onlinechecker', OnlineChecker),
                                      ('/gamestart', GameStart),
                                      ('/gameprocess', GameProcess),
                                      ('/gamerepaint', GameRepaint),
                                      ('/gamestatus', GameStatus)],
                                      debug=True)


def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()
