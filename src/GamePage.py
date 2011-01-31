'''
Created on 27.01.2011

@author: Rodion
'''
import os
from google.appengine.ext import webapp
from google.appengine.ext import db
import player
from google.appengine.ext.webapp import template 

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
        
