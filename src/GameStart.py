'''
Created on 27.01.2011

@author: Rodion
'''

from google.appengine.ext import webapp
from google.appengine.ext import db
import time
import game
from gameConstants import DIFF_TIME 

def buildGame(players_ids):
        curent_game = game.GameInstanse(players_ids[0], players_ids[1])
        curent_game_record = game.GameRecord()
        curent_game_record.pack(curent_game)
        curent_game_record.put()
        if not db.GqlQuery("SELECT * FROM GameRecord WHERE record_of_game_id = :1", curent_game.game_id).get():
            return None
        return curent_game.game_id

class GameStart(webapp.RequestHandler):
    def get(self):
        cur_uid = int(self.request.cookies.get('uid', None))
        cur_query = db.GqlQuery("SELECT * FROM PlayerRecord " + 
                "WHERE record_of_uid = :1", cur_uid)
        cur_player_record = cur_query.get()
        if not cur_player_record:
            self.handle_exception('GET request to gamestart no such user', True)
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
                    cur_player_record.record_of_game_id = None
                    player.record_of_game_id = None
                    cur_player_record.put()
                    player.put()
                    cur_game = buildGame(list((cur_player_record.record_of_uid, player.record_of_uid)))
                    #cur_player_record.delete()
                    if cur_game == None:
                        self.handle_exception("GET request to gamestart: error in gamecreating", True)
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
        