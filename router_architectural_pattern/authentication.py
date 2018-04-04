import admin
import user
from router import Router
from routes import Routes

class Authentication:
    def __init__(self, router=None):
        self.__router = router if router else Router.get_instance()        
        self.__routes = {
            Routes.Auth.user_exists: [admin.Admin],
            Routes.Auth.logout: [admin.Admin],
            Routes.Auth.login: [admin.Admin],
        }

        self.__users = {
            'hiskel': 'password',
            'henok': 'passwerd',
            'kassu': 'passwerde'
        }

        self.__router.attach(self, provider=True)

    def user_exists(self, frame):
        pass
    
    def __respond(self, frame):
        pass
    
    def get_actors(self, action):
        actors = []
        if self.__routes.get(action):
            actors = self.__routes.get(action)
        return actors
    
    def receive(self, frame):
        print('>>> frame received in authentication')
        # print(frame)

        url = frame.get('url')
        
        if url == Routes.Auth.user_exists:
            print('>>> a user exists action requested!')            

        elif url == Routes.Auth.login:
            print('>>> a login action requested!')            
        
        elif url == Routes.Auth.logout:
            print('>>> a logout action requested!')            
        
        else:
            print('<> unknown route in auth!')
