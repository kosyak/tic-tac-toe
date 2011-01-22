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
    
    def checkForEnd(self):
        self.is_ended = self.number_of_turns == 2
    
    def makeMove(self, x, y):
        self.number_of_turns += 1
        self.board[x][y] = self.turn
        self.turn ^= 1
       
class GameRecord(db.Model):
    record_of_board = db.StringProperty(multiline=False)
    record_first_player_uid = db.StringProperty(multiline=False)
    record_second_player_uid = db.StringProperty(multiline=False)
    record_of_game_id = db.StringProperty(multiline=False)
    record_of_turn = db.StringProperty(multiline=False)
    record_of_is_ended = db.StringProperty(multiline=False)
    record_of_numner_of_turns = db.StringProperty(multiline=False)

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
    def unPack(self):
        curent_game = TheGame(0, 0)
        curent_game.board = eval(self.record_of_board)
        curent_game.first_player_uid = eval(self.record_first_player_uid)
        curent_game.second_player_uid = eval(self.record_second_player_uid)
        curent_game.game_id = eval(self.record_of_game_id)
        curent_game.turn = eval(self.record_of_turn)
        curent_game.is_ended = eval(self.record_of_is_ended)
        curent_game.number_of_turns = eval(self.record_of_numner_of_turns)
    
        
        
         