'''
Created on 27.01.2011

@author: Rodion
'''
from google.appengine.ext import webapp
from google.appengine.ext import db
from game import getGameIdByRequest
from game import getUserIdByRequest

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
        