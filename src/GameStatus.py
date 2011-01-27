'''
Created on 27.01.2011

@author: Rodion
'''

from google.appengine.ext import webapp
from google.appengine.ext import db
from game import getGameIdByRequest
from game import getUserIdByRequest
import time
from gameConstants import DIFF_TIME 

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
                            
        if opponent.record_of_last_online < time.mktime(time.gmtime()) - DIFF_TIME:
            self.response.out.write('opponent_offline') 
            return
        
        if cur_game.turn == 0 and cur_game.first_player_uid == player_id or\
           cur_game.turn == 1 and cur_game.second_player_uid == player_id:
                if cur_game.is_ended:
                    self.response.out.write('lose ' + cur_game.getWinningString())
                else:
                    self.response.out.write('move')
        else: 
                if cur_game.is_ended:
                    self.response.out.write('win ' + cur_game.getWinningString())
                else:
                    self.response.out.write('not_move')
