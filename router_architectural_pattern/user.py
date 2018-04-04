from router import Router
from routes import Routes
from database import DataBase
from utilities import dict_with_keys, build_frame
from constants import Keys

class User:
    def __init__(self, router=None):
        self.__router = router if router else Router.get_instance()
        self.__router.attach(self)

        self.__can_receive_from = [DataBase]
    
    def get_meanings(self, word):
        body = {'word': word}
        frame = build_frame(self.__class__, DataBase, Routes.Db.get_meanings, body)
        self.__router.forward(frame)
    
    def search(self, word):
        body = {'word': word}
        frame = build_frame(self.__class__, DataBase, Routes.Db.search, body)       
        self.__router.forward(frame)
    
    @dict_with_keys(Keys.FRAME_KEYS)
    def receive(self, frame):
        print('>>> frame received in user')
        # print(frame)

        action = frame.get('action')
        
        if action == Routes.Db.get_meanings:
            print('>>> a get meaning action responded to!')
            print(frame.get('body'))
        
        elif action == Routes.Db.search:
            print('>>> a search action responded to!')    
            print(frame.get('body'))

        else:
            print('><>< unknown action in user')
    
    def get_actors(self):
        return self.__can_receive_from