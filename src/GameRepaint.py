'''
Created on 27.01.2011

@author: Rodion
'''

from google.appengine.ext import webapp
from google.appengine.ext import db
from game import getGameIdByRequest
from game import getUserIdByRequest

class GameRepaint(webapp.RequestHandler):
    def post(self):
        game_id = getGameIdByRequest(self.request)
        player_id = getUserIdByRequest(self.request)
        cur_game_record = db.GqlQuery("SELECT * FROM GameRecord WHERE record_of_game_id = :1", (game_id)).get()
        if not cur_game_record:
            self.error(301)
            return  
        cur_game = cur_game_record.unPack()
        if cur_game.last_move != None and cur_game.last_move[0] == 1 and cur_game.first_player_uid == player_id or\
           cur_game.last_move != None and cur_game.last_move[0] == 0 and cur_game.second_player_uid == player_id:
            self.response.out.write(('X' if not cur_game.last_move[0] else 'O') + ' ' + str(cur_game.last_move[1]) + ' ' + str(cur_game.last_move[2]))
