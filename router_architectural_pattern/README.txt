This is a minimal prototype application for the proposed 'Router architectural design pattern'

steps:
    1. run the bootstrap.py file in interactive mode in the python interpretor (python -i bootstrap.py)
       -> upon doing so, four components will be initialized: the User, Admin, DataBase and Authentication.
       -> this exposes two global variables to the program user, the 'user' and the 'admin'
    2. by using the globally exposed 'user' and 'admin' variables, the following operations can be performed.
       
       'user':
            1. 'get_meanings(word)': returns the meanings of a word
            2. 'search(word)': returns a list words that start with the given word
            3. 'get_actors()': returns a list of components that can the user can receive communications from.
        
        'admin':
            1. 'get_meanings(word: str)': same as the user
            2. 'search(word: str)': same as the user
            3. 'get_actors()': same as the user
            4. 'add_word(word:str, meanings: list[str]): adds a given word and its meanings to the dictionary
            5. 'add_meanings(word: str, meanings: list[str]) appends the list of meanings to an already existing list of meanings for word