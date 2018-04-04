from router import Router
import admin
import user

from routes import Routes
from constants import Keys
from utilities import build_frame, dict_with_keys


class DataBase:
    def __init__(self, router=None):
        '''registered in default router, if none passed!'''
        self.__router = router if router else Router.get_instance()
        self.__routes = {
            Routes.Db.get_meanings: [admin.Admin, user.User],
            Routes.Db.search: [admin.Admin, user.User],
            Routes.Db.add_meanings: [admin.Admin],
            Routes.Db.add_word: [admin.Admin]
        }

        self.__router.attach(self, provider=True)  # component joining the router  as a provider 

        self.__words = {
            'loaded': [
                '[Gun] - ready to fire',
                '[Word] - a word with many meanings'
            ]
        }      
    
    def get_routes(self):
        ''' Returns a dictionary of routes(actions) vs actors'''
        return self.__routes
    
    def get_actors(self, action):
        ''' Returns a list of actors that can perform a specified action'''
        actors = self.__routes.get(action)
        return actors if actors else []  # if action doesn't exist return empty!
    
    @dict_with_keys(Keys.FRAME_KEYS)
    def receive(self, frame):
        print('>>> frame received in database')
        sender = frame.get('from')
        action = frame.get('action')
        body = frame.get('body')
        word = body.get('word')

        if action == Routes.Db.add_meanings:
            print('>>> an add meanings action requested!')
            meanings = body.get('meanings')
            self.__add_meanings(word, meanings)
        
        elif action == Routes.Db.add_word:
            print('>>> an add word action requested!')
            meanings = body.get('meanings')
            self.__add_word(word, meanings)

        elif action == Routes.Db.get_meanings:
            print('>>> a get meaning action requested!')
            body['meaning'] = self.__get_meaning(word)
            frame = build_frame(self.__class__, sender, Routes.Db.get_meanings, body)
            self.__router.forward(frame)
        
        elif action == Routes.Db.search:
            print('>>> a search action requested!')
            results = self.__search(word)
            body = {'word': word, 'results': results}
            frame = build_frame(self.__class__, sender, Routes.Db.search, body)
            self.__router.forward(frame)            
        
        else:
            # this should never happen
            print('><>< unrecognized action in Db')
    
    def __get_meaning(self, word):
        meaning = self.__words.get(word.strip())
        return meaning if meaning else []

    def __add_word(self, word, meanings):
        assert type(meanings) is list, 'meanings must be a list'
        if not self.__words.get(word):
            self.__words[word] = meanings
            print('>>> word {0} successfully added'.format(word))
        else:
            print('><>< word {0} already exists! can not add!'.format(word))
    
    def __add_meanings(self, word, meanings):
        assert type(meanings) is list, 'meanings must be a list'
        if self.__words.get(word):
            for meaning in meanings:
                self.__words[word].append(meaning)
            print('>>> successfully added meanings to word {0}'.format(word))
        else:
            print('><>< word {0} does not exist, add it first!'.format(word))

    def __search(self, word):
        result = []
        for key in self.__words.keys():
            if key.startswith(word):
                result.append(key)

        return result
            
