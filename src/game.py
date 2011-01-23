'''
Created on 21.01.2011

@author: Rodion
'''

from google.appengine.ext import db
import random

def calcGameId(first_player_uid, second_player_uid): 
    return int((first_player_uid + second_player_uid) * random.random())

SIZE_OF_BOARD = 5

class TheGame:
    '''
    Class realized game instance
    '''
    
    def __init__(self, first_player_uid, second_player_uid):
        self.first_player_uid = first_player_uid
        self.second_player_uid = second_player_uid
        self.game_id = calcGameId(first_player_uid, second_player_uid)
        self.turn = 0
        self.is_ended = False
        self.number_of_turns = 0
        self.board = [[None] * SIZE_OF_BOARD for i in range(0, SIZE_OF_BOARD)]
        self.winning_string = None
        self.last_move = None
        
    def checkForEnd(self):
        dx_list = [+1, +1,  0]
        dy_list = [ 0, +1, +1]
        for x in range(1, SIZE_OF_BOARD - 1):
            for y in range(1, SIZE_OF_BOARD - 1):
                for (dx, dy) in zip(dx_list, dy_list):
                    if self.board[x][y] == self.board[x + dx][y + dy] == self.board[x - dx][y - dy] != None:
                        self.winning_string = (str(x) + ' ' + str(y) + ' ' +
                                              str(x + dx) + ' ' + str(y + dy) + ' ' + 
                                              str(x - dx) + ' ' + str(y - dy))
                        self.is_ended = True
                        return True
        return False
                    
    def makeMove(self, x, y):
        if self.board[x][y] != None:
            return False
        self.last_move = (self.turn, x, y)
        self.number_of_turns += 1
        self.board[x][y] = self.turn
        self.turn = 1 - self.turn
        self.checkForEnd()
        return True
    
    def getWinningString(self):
        return None           
       
class GameRecord(db.Model):
    record_of_board = db.StringProperty(multiline=False)
    record_first_player_uid = db.StringProperty(multiline=False)
    record_second_player_uid = db.StringProperty(multiline=False)
    record_of_game_id = db.StringProperty(multiline=False)
    record_of_turn = db.StringProperty(multiline=False)
    record_of_is_ended = db.StringProperty(multiline=False)
    record_of_numner_of_turns = db.StringProperty(multiline=False)
    record_of_last_move = db.StringProperty(multiline=False)
    #def __init__(self, some_game):
        #db.Model.__init__(self)
    def pack(self, some_game):
        self.record_of_board = str(some_game.board)
        self.record_first_player_uid = str(some_game.first_player_uid)
        self.record_second_player_uid = str(some_game.second_player_uid)
        self.record_of_game_id = str(some_game.game_id)
        self.record_of_turn = str(some_game.turn)
        self.record_of_is_ended = str(some_game.is_ended)
        self.record_of_numner_of_turns = str(some_game.number_of_turns)
        self.record_of_last_move = str(some_game.last_move)
    def unPack(self):
        curent_game = TheGame(0, 0)
        curent_game.board = eval(self.record_of_board)
        curent_game.first_player_uid = eval(self.record_first_player_uid)
        curent_game.second_player_uid = eval(self.record_second_player_uid)
        curent_game.game_id = eval(self.record_of_game_id)
        curent_game.turn = eval(self.record_of_turn)
        curent_game.is_ended = eval(self.record_of_is_ended)
        curent_game.number_of_turns = eval(self.record_of_numner_of_turns)
        curent_game.last_move = eval(self.record_of_last_move)
        return curent_game
        
        
         