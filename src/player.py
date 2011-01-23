'''
Created on 22.01.2011

@author: Rodion
'''
import random
import time
from google.appengine.ext import db

def getUid(name):
    res = 0
    for ch in name:
        res = res * 239 + ord(ch)
        while res > 10**9 + 9:
            res -= 10**9 + 9
    return int(random.random() * res) 

class Player:
    '''
    Player class
    '''

    def __init__(self, name):
        self.name = name
        self.uid = getUid(name)
        self.last_online = time.mktime(time.gmtime())
        self.game_id = None
       

class PlayerRecord(db.Model):
    record_of_name = db.StringProperty(multiline=False)
    record_of_uid = db.IntegerProperty()
    record_of_last_online = db.FloatProperty()
    record_of_game_id = db.IntegerProperty()
    def pack(self, some_player):
        self.record_of_name = str(some_player.name)
        self.record_of_uid = some_player.uid
        self.record_of_last_online = some_player.last_online
        self.record_of_game_id = some_player.game_id
    def unPack(self):
        return Player(None)


