from router import Router
from routes import Routes
from admin import Admin
from user import User
from database import DataBase
from authentication import Authentication

if __name__ == "__main__":
    Router.init_default()
    user = User()
    admin = Admin()
    db = DataBase()
    auth = Authentication()