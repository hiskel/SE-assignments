from authentication import Authentication
from database import DataBase
from router import Router
from user import User

from routes import Routes
from constants import Keys
from utilities import dict_with_keys, build_frame


class Admin:
    def __init__(self, router=None):
        self.__router = router if router else Router.get_instance()        
        self.__can_receive_from = [DataBase, Authentication]
        self.__router.attach(self)

    def add_word(self, word, meanings):
        assert type(meanings) is list, 'meanings must be a list!'
        body = {'word': word, 'meanings': meanings}  
        frame = build_frame(self.__class__, DataBase, Routes.Db.add_word, body)  
        self.__router.forward(frame)

    def add_meanings(self, word, meanings):
        assert type(meanings) is list, 'meanings must be a list!'
        body = {'word': word, 'meanings': meanings}
        frame = build_frame(self.__class__, DataBase, Routes.Db.add_meanings, body)
        self.__router.forward(frame)
            
    def get_meanings(self, word):
        body = {'word': word}
        frame = build_frame(self.__class__, DataBase, Routes.Db.get_meanings, body)
        self.__router.forward(frame)
    
    def get_actors(self):
        ''' Returns a list of components from which this component can receive from'''
        return self.__can_receive_from
    
    def search(self, word):
        body = {'word': word}
        frame = build_frame(self.__class__, DataBase, Routes.Db.search, body)       
        self.__router.forward(frame)
    
    @dict_with_keys(Keys.FRAME_KEYS)
    def receive(self, frame):
        print('>>> frame received in admin')
        # print(frame)

        action = frame.get('action')

        if action == Routes.Db.add_meanings:
            print('>>> an add meaning action responded to!')
            print(frame.get('body'))
        
        elif action == Routes.Db.add_word:
            print('>>> an add word action responded to!')
            print(frame.get('body'))
        
        elif action == Routes.Db.get_meanings:
            print('>>> a get meaning action responded to!')
            print(frame.get('body'))
        
        elif action == Routes.Db.search:
            print('>>> a search action responded to!') 
            print(frame.get('body'))   

        else:
            print('><>< unknown action in admin')
