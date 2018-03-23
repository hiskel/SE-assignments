from socket import socket, AF_INET, SOCK_STREAM
from threading import Thread
from os import system
from custom_parser import *


class Client:
    ip_pool_address = ('127.0.0.1', 8000)
    def __init__(self):
        self.peers = None
        self.sock = socket(AF_INET, SOCK_STREAM)
        self.name = None
        self.selected_name = None
        self.name_set = False
        self.messages = {}
        self.online = []
        self.unseen = []

    def menu(self):
        menu = '''
            ---main menu---
            1- who's online
            2- change the other guy
            3- unseen messages from
                {}
            any- return to chat
        '''.format(self.unseen)
        print(menu)
        while True:
            cmd = input('command number: ').strip().lower()
            if cmd == '1':
                if len(self.online) == 0:
                    print('no users online!')
                else:
                    for each in self.online:
                        print('\t{0}'.format(each))
                    break
            elif cmd == '2' or not self.selected_name:
                name = input('enter chatee\'s name: ').strip()
                if name not in self.online:
                    print('incorrect name entered!')
                else:
                    self.selected_name = name
                    break
            elif cmd == '3':
                for msg in self.unseen:
                    print('\t{0}'.format(msg))
            
        if self.selected_name in self.unseen:
            self.unseen.remove(self.selected_name)
        msgs = self.messages.get(self.selected_name)
        if msgs:
            self.display_msgs(msgs)
            
    def listen(self):
        self.sock.connect(Client.ip_pool_address)        
        while True:
            try:
                incoming = self.sock.recv(1024)
            except:
                print('disconnected!')
                break
            parsed = parse(incoming)
            if parsed:
                Thread(target=self.__handle, args=(parsed,)).start()
            else:
                print('incorrect format!')

    def send_msg(self):
        msg = {'from':self.name, 'type': Value.MESSAGE, 'id':'_',
        }
        while True:
            body = input().strip()
            if body.lower() == 'menu':
                self.menu()
                continue
            msg['body'] = body
            msg['to'] = self.selected_name
            try:
                if self.__is_online(msg['to']):
                    self.handle_msg(msg['to'], self.msg_pretty(msg))
                    self.sock.send(stringify(msg))
                else:
                    print('client is not online!')
            except:
                print('could not send!')

    def handle_msg(self, name, msg):
        if not self.messages.get(name):
            self.messages[name] = []
        if name != self.selected_name:
            if name not in self.unseen:
                self.unseen.append(name)
                print('\a')

        self.messages[name].append(msg)

        if name == self.selected_name:
            self.display_msgs(self.messages[name])
    
    def msg_pretty(self, parsed):
        return '{0}: {1}'.format(parsed['from'], parsed['body'])
    
    def display_msgs(self, messages):
        system('cls')
        print('-----------------------------{0} with {1} -------------------------'.format(self.name.upper(), self.selected_name.upper()))
        for msg in messages:
            print('\t{0}'.format(msg))

    def __is_online(self, name):
        return name in self.online

    def __handle_online(self, parsed):
        self.online = []
        for each in parsed['body'].split(','):
            self.online.append(each.strip())

    def __handle_name(self, parsed):
        print('---------------------\n{0}\n-----------------'.format(parsed['body']))
        self.name = input('enter your name: ').strip()
        self.sock.send(str_to_bytes('from:_|to:server|type:1|id:{0}|body:{1}'.format(
                parsed['id'], self.name
        )))

    def __handle(self, parsed):
        type_ = parsed['type']

        #check and start messaging
        if not self.name_set and type_ == Value.OK:
            self.name_set = True
            self.menu()
            Thread(target=self.send_msg).start()
            return
        
        if type_ == Value.NAME:
            self.__handle_name(parsed)

        elif type_ == Value.MESSAGE:
            self.handle_msg(parsed['from'], self.msg_pretty(parsed))

        elif type_ == Value.CLIENTS:
            self.__handle_online(parsed)

        else:
            print('other kind of message')


if __name__ == "__main__":
    client = Client()
    client.listen() 