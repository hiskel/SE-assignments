from utilities import dict_with_keys
from constants import Keys

class Router: 
    router = None
    
    def __init__(self):
        self.__providers = {}
        self.__components = {}
    
    def attach(self, component, provider=False):
        name = component.__class__
        if provider:
            self.__register(self.__providers, name, component, 'provider')
        else:
            self.__register(self.__components, name, component, 'component')                
    
    def detach(self, comp_name, provider=False):
        pass

    @dict_with_keys(Keys.FRAME_KEYS)
    def forward(self, frame):
        sender = frame.get('from')
        receiver = frame.get('to')

        if self.__is_a_provider(receiver):
            action = frame.get('action')
            receiver = self.__get_provider(receiver)

            if sender in receiver.get_actors(action):
                receiver.receive(frame)
            else:
                print('><>< authorization error on {0}'.format(sender))
        else:
            receiver = self.__get_component(receiver)
            if sender in receiver.get_actors():
                receiver.receive(frame)           
            else:
                print('><>< authorization error on {0}'.format(sender))               
    
    def __register(self, add_to, name, component, type_):
        if not add_to.get(name):
            add_to[name] = component
        else:
            print('><>< {0} already registered'.format(type_))    
    
    def __is_a_provider(self, comp_name):
        return self.__get_provider(comp_name) is not None
    
    def __is_a_component(self, comp_name):
        return self.__get_component(comp_name) is not None
    
    def __get_provider(self, comp_name):
        return self.__providers.get(comp_name)
    
    def __get_component(self, comp_name):
        return self.__components.get(comp_name)    
    
    @staticmethod
    def init_default():
        ''' Initializes a default router that can be used by components by default if none passed'''
        if Router.router is None:
            Router.router = Router()
    
    @staticmethod
    def get_instance():
        ''' Returns a default instance of the router'''
        Router.init_default()
        return Router.router
