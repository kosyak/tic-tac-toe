'''
Created on 27.01.2011

@author: Rodion
'''
from google.appengine.ext import webapp
from google.appengine.ext import db
import time

class OnlineChecker(webapp.RequestHandler):
    def post(self):
        if int(self.request.get('online')) != 1:
            #self.error(300)
            return
        
        cur_uid = int(self.request.cookies.get('uid', None))
        if cur_uid:
            #self.request.error(404)
            cur_query = db.GqlQuery("SELECT * FROM PlayerRecord " + 
                "WHERE record_of_uid = :1", cur_uid)
            cur_player_record = cur_query.get()
            if not cur_player_record:
                #self.error(301)
                return
            cur_player_record.record_of_last_online = time.mktime(time.gmtime())
            cur_player_record.put()
        else:
            #self.error(300)
            pass
            