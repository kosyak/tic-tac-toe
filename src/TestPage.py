'''
Created on 27.01.2011

@author: Rodion
'''
from google.appengine.ext import webapp
from google.appengine.ext import db
import time
from gameConstants import DIFF_TIME

class TestPage(webapp.RequestHandler):
    def get(self):
        self.response.headers['Content-Type'] = 'text/html'
        self.response.out.write('number ' + str(db.GqlQuery("SELECT * FROM PlayerRecord").count()) + '<br>')

        for q in db.GqlQuery("SELECT * FROM PlayerRecord " + 
                                "WHERE record_of_last_online > :1", time.mktime(time.gmtime()) - DIFF_TIME):
            self.response.out.write('Name is ' + str(q.record_of_name) + '<br>')
            self.response.out.write('Uid is ' + str(q.record_of_uid) + '<br>')
            self.response.out.write('Last online is ' + str(q.record_of_last_online) + '<br>')
            self.response.out.write('Game id is ' + str(q.record_of_game_id) + '<br>')
            
        self.response.out.write("=" * 90 + "<br>")
        cur_uid = int(self.request.cookies.get('uid', None))
        self.response.out.write('Cur user in cookies is ' + str(cur_uid) + '<br>')
        if cur_uid:
            cur_query = db.GqlQuery("SELECT * FROM PlayerRecord " + 
                "WHERE record_of_uid = :1", cur_uid)
            cur_player_record = cur_query.get()
            self.response.out.write('Name is ' + str(cur_player_record.record_of_name) + '<br>')
            self.response.out.write('Uid is ' + str(cur_player_record.record_of_uid) + '<br>')
            self.response.out.write('Last online is ' + str(cur_player_record.record_of_last_online) + '<br>')
            q = db.GqlQuery("SELECT * FROM GameRecord WHERE record_of_game_id = :1", cur_player_record.record_of_game_id).get()
            '''   self.response.out.write('GameId is '+ str(q.record_of_game_id) + '<br>')
            self.response.out.write('First player uid is '+ str(q.record_first_player_uid) + '<br>')
            self.response.out.write('Second player uid is '+ str(q.record_second_player_uid) + '<br>')
            self.response.out.write('Curent turn is '+ str(q.record_of_turn) + '<br>')
            self.response.out.write('Last move is '+ str(q.record_of_last_move) + '<br>')
            self.response.out.write('Is_ended is '+ str(q.record_of_is_ended) + '<br>')
            self.response.out.write('Winning string ' + str(q.unPack().getWinningString()) + '<br>')
            self.response.out.write('<br>')'''
            if q:
                self.response.out.write(str(q.unPack().toHtmlString()))
        else:
            self.response.out.write("No such user")
        self.response.out.write("=" * 90 + "<br>")
        for q in db.GqlQuery("SELECT * FROM GameRecord"):
            self.response.out.write(q.unPack().toHtmlString())
            self.response.out.write('<br>')
            
       
    def post(self):
        self.response.headers['Content-Type'] = 'text/plain'
        self.response.out.write(self.request.get('data'))
        #path = os.path.join(os.path.dirname(__file__), 'html/game.html')
        #self.response.out.write(template.render(path, {}))
        #print 'POST'
