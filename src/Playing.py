# coding: utf-8

'''
Created on 27.01.2011

@author: Rodion
'''

from google.appengine.ext import webapp
from google.appengine.ext import db
from game import getGameIdByRequest
from game import getUserIdByRequest
import time
import game
from gameConstants import MAX_REQUEST_TIME
from gameConstants import DELAY_BETWEEN_PROCESSING

class Playing(webapp.RequestHandler):
    def post(self):
        # Update last online 
        cur_uid = int(self.request.cookies.get('uid', None))
        if cur_uid:
            cur_query = db.GqlQuery("SELECT * FROM PlayerRecord " + 
                "WHERE record_of_uid = :1", cur_uid)
            cur_player_record = cur_query.get()
            if not cur_player_record:
                return
            cur_player_record.record_of_last_online = time.mktime(time.gmtime())
            cur_player_record.put()
        # Last online updated
          
        mode = self.request.get('mode', None)
        if not mode:
            self.handle_exception('POST to playing: bad mode\n', True)
        game_id = getGameIdByRequest(self.request)
        if db.GqlQuery("SELECT * FROM GameRecord WHERE record_of_game_id = :1", game_id).get() == None:
            self.handle_exception("POST to playing: no game with such game_id", True)
        cur_game = db.GqlQuery("SELECT * FROM GameRecord WHERE record_of_game_id = :1", game_id).get().unPack()
        player_position = 0 if cur_game.isFirstPlayer(getUserIdByRequest(self.request)) else 1
        if mode == 'waiting':
            start_time = time.mktime(time.gmtime())
            while time.mktime(time.gmtime()) < start_time + MAX_REQUEST_TIME:
                cur_game = db.GqlQuery("SELECT * FROM GameRecord WHERE record_of_game_id =:1", game_id).get().unPack()
                if cur_game.turn == player_position:
                    self.response.out.write(cur_game.getPlayerGameStatus(player_position))
                    return
                time.sleep(DELAY_BETWEEN_PROCESSING)
            self.response.out.write(cur_game.getPlayerGameStatus(player_position))
        elif mode == 'moving':
            cur_game = db.GqlQuery("SELECT * FROM GameRecord WHERE record_of_game_id =:1", game_id).get().unPack()
            if not cur_game:
                return "game_error"
            if cur_game.turn != player_position:
                self.response.out.write(cur_game.getPlayerGameStatus(player_position))
                return
            x = int(self.request.get('x'))
            y = int(self.request.get('y'))
            query = db.GqlQuery("SELECT * FROM GameRecord WHERE record_of_game_id =:1", game_id)
            for q in query:
                q.delete()
            
            cur_game.makeMove(x, y)
            cur_game_record = game.GameRecord()
            cur_game_record.pack(cur_game)
            cur_game_record.put()
            self.response.out.write(cur_game.getPlayerGameStatus(player_position))
        elif mode == 'ask':
            self.response.out.write(cur_game.getPlayerGameStatus(player_position))
        else:
            self.response.out.write(cur_game.getPlayerGameStatus(player_position))
            
            


