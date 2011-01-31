'''
Created on 21.01.2011

@author: Rodion
'''

from google.appengine.ext import db
import random
from gameConstants import SIZE_OF_BOARD
from gameConstants import DIFF_TIME
import pickle 
import time


def getGameIdByRequest(request):
    cur_uid = int(request.cookies.get('uid', None))
    cur_query = db.GqlQuery("SELECT * FROM PlayerRecord " + 
               "WHERE record_of_uid = :1", cur_uid)
    cur_player_record = cur_query.get()
    if not cur_player_record:
        return None 
        
    return int(cur_player_record.record_of_game_id)
            
def getUserIdByRequest(request):
    return int(request.cookies.get('uid', None))

def calcGameId(first_player_uid, second_player_uid): 
    return int((first_player_uid + second_player_uid) * random.random())

class GameInstanse:
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
        
    def getPlayerGameStatus(self, player_id):
        opponent = db.GqlQuery("SELECT * FROM PlayerRecord WHERE record_of_uid = :1", self.first_player_uid + self.second_player_uid - player_id).get()
        if opponent.record_of_last_online < time.mktime(time.gmtime()) - DIFF_TIME:
            return 'opponent_offline' 
            
        if self.is_ended:
            if self.last_move[0] == player_id:
                return "win " + self.getWinningString()
            else:
                return "lose " + self.getWinningString()
        else:
            if self.turn == player_id:
                return "moving " + self.getBoardString()
            else:
                return "waiting " + self.getBoardString()
            
    def isFirstPlayer(self, uid):
        return uid == self.first_player_uid
    def isSecondPlayer(self, uid):
        return uid == self.second_player_uid
    
    def getFirstPlayerGameStatus(self):
        return self.getPlayerGameStatus(0)
    
    def getSecondPlayerGameStatus(self):
        return self.getPlayerGameStatus(1)
            
    def __str__(self):
        return ("Game id is " + str(self.game_id) + "\n" +
                "First player id is " + str(self.first_player_uid) + "\n" +
                "Second player id is " + str(self.second_player_uid) +  "\n" +
                "Curent turn is " + str(self.turn) + "\n" + 
                "Game is ended " + str(self.is_ended) + "\n" + 
                "Winning string " + str(self.winning_string) + "\n" + 
                "Last move " + str(self.last_move) + "\n"
                )
        
    def toHtmlString(self):
        return ("Game id is " + str(self.game_id) + "<br>" +
                "First player id is " + str(self.first_player_uid) + "<br>" +
                "Second player id is " + str(self.second_player_uid) +  "<br>" +
                "Curent turn is " + str(self.turn) + "<br>" + 
                "Game is ended " + str(self.is_ended) + "<br>" + 
                "Winning string " + str(self.winning_string) + "<br>" + 
                "Last move " + str(self.last_move) + "<br>"
                )
        
    def checkForEnd(self):
        dx_list = [+1, +1,  0, -1]
        dy_list = [ 0, +1, +1, +1]
        for x in range(0, SIZE_OF_BOARD):
            for y in range(0, SIZE_OF_BOARD):
                for (dx, dy) in zip(dx_list, dy_list):
                    if (x + dx >= 0 and y + dy >= 0 and x - dx >= 0 and y - dy >= 0 and 
                        x + dx < SIZE_OF_BOARD and y + dy < SIZE_OF_BOARD and
                        x - dx < SIZE_OF_BOARD and y - dy < SIZE_OF_BOARD and
                        self.board[x][y] == self.board[x + dx][y + dy] == self.board[x - dx][y - dy] and self.board[x][y] != None):
                        self.winning_string = (str(x) + ' ' + str(y) + ' ' +
                                              str(x + dx) + ' ' + str(y + dy) + ' ' + 
                                              str(x - dx) + ' ' + str(y - dy))
                        self.is_ended = True
                        return True
        return False

    def getBoardString(self):
        board_string = ""
        for x in range(0, SIZE_OF_BOARD):
            for y in range(0, SIZE_OF_BOARD):
                if self.board[x][y] != None:
                    board_string += ('X' if self.board[x][y] == 0 else 'O') + ' ' + str(x) + ' ' + str(y) + ','
        if board_string[-1] == ',':
            board_string = board_string[:-1]
        return board_string
                    
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
        return self.winning_string      
       
class GameRecord(db.Model):
    #record_of_board = db.StringProperty(multiline=False)
    #record_first_player_uid = db.StringProperty(multiline=False)
    #record_second_player_uid = db.StringProperty(multiline=False)
    record_of_game_id = db.IntegerProperty()
    pickle_dump = db.StringProperty(multiline = True)
    #pickle_dump = db.TextProperty() 
    
    #record_of_turn = db.StringProperty(multiline=False)
    #record_of_is_ended = db.StringProperty(multiline=False)
    #record_of_numner_of_turns = db.StringProperty(multiline=False)
    #record_of_last_move = db.StringProperty(multiline=False)
    #record_of_winning_string = db.StringProperty(multiline=False)
    #def __init__(self, some_game):
    #    db.Model.__init__(self)
    def isFirstPlayer(self, uid):
        return uid == self.unPack().first_player_uid
    def isSecondPlayer(self, uid):
        return uid == self.unPack().second_player_uid
    def pack(self, some_game):
        #self.record_of_board = str(some_game.board)
        #self.record_first_player_uid = str(some_game.first_player_uid)
        #self.record_second_player_uid = str(some_game.second_player_uid)
        self.record_of_game_id = int(some_game.game_id)
        self.pickle_dump = pickle.dumps(some_game)
        #self.record_of_turn = str(some_game.turn)
        #self.record_of_is_ended = str(some_game.is_ended)
        #self.record_of_numner_of_turns = str(some_game.number_of_turns)
        #self.record_of_last_move = str(some_game.last_move)
        #self.record_of_winning_string = str(some_game.winning_string)
    def unPack(self):
        curent_game = pickle.loads(str(self.pickle_dump))
        #curent_game.board = eval(self.record_of_board)
        #curent_game.first_player_uid = eval(self.record_first_player_uid)
        #curent_game.second_player_uid = eval(self.record_second_player_uid)
        #curent_game.game_id = eval(self.record_of_game_id)
        #curent_game.turn = eval(self.record_of_turn)
        #curent_game.is_ended = eval(self.record_of_is_ended)
        #curent_game.number_of_turns = eval(self.record_of_numner_of_turns)
        #curent_game.last_move = eval(self.record_of_last_move)
        #curent_game.winning_string = self.record_of_winning_string
        return curent_game
        
        
