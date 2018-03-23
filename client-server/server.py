from socket import socket, AF_INET, SOCK_STREAM
from threading import Thread
from custom_parser import *

class Server:
    def __init__(self):
        self.socket = socket(AF_INET, SOCK_STREAM)
        self.clients = {}
        self.temp_clients = {}
        self.name = Value.SERVER
        self.id = 0
    
    def listen(self, port=8000, num=20):
        self.socket.bind(('', port))
        self.socket.listen(num)

        while True:
            client, addr = self.socket.accept()
            print('client connected! addr: {0}'.format(str(addr)))
            self.__handle_first_timers(client)

    def send(self, parsed):
        client = self.clients.get(parsed['to'])
        if client:
            client.send(stringify(parsed))
        else:
            print('client doesnt exist')

    def broadcast(self):
        pass
    
    def notify_all(self):
        body = ''
        for client in self.clients:
            body += client + ','
        body = body[:-1]
        for client in self.clients:
            msg = parse(str_to_bytes('from:server|to:{0}|type:{1}|id:_|body:{2}'.format(client, Value.CLIENTS, body)))
            self.send(msg)
    
    def __handler(self, parsed):
        type_ = parsed['type']
        
        if type_ == Value.NAME:
            # register user to clients
            self.__register_client(parsed['id'], parsed['body'])
        elif type_ == Value.MESSAGE:
            # a sent message to forward
            self.send(parsed)
        elif type_ == Value.BROADCAST:
            # here, send to all
            print('broadcast requested')
        else:
            # un unauthorized header has been used by client
            print('unauthorized headers sent by client!')
    
    def __handle_first_timers(self, client):
        #  store the client temporarily
        self.temp_clients[str(self.id)] = client
        self.__send_reg_id(client, self.id, 'send name to register')
        self.id += 1
        #fire off listener in a separate thread
        Thread(target=self.__client_incoming, args=(client,)).start()
    
    def __client_incoming(self, client):
        # listens for messages from the client
        while True:
            try:
                message = client.recv(1024)
                print(bytes_to_str(message))
            except:
                #  client disconnected! oops.., should notify
                print('client disconnected')
                break

            #here parse the message and decide what to do
            parsed = parse(message)
            if parsed:  # contained the right headers
                self.__handler(parsed)
            else:
                print('parse error!')
    
    def __register_client(self, id_, name):
        # name must be unique!
        name, id_ = name.strip(), id_.strip()
        if not self.clients.get(name):
            if self.temp_clients.get(id_):
                self.clients[name] = self.temp_clients[id_]
                del self.temp_clients[id_]  # remove from temporary ...
                self.send(
                        {'from': 'server', 'to':name, 'type':Value.OK, 'id':'_', 'body':'_'}
                )
                self.notify_all()  # notify the updated user list
                print('name changed')
            else:
                # send name already changed
                print('name already sent')
                pass
        else:
            # resend id for re-registration
            self.__send_reg_id(self.temp_clients[id_], id_, 'name already exists')
    
    def __send_reg_id(self, client, id_, msg):
        init_msg = str_to_bytes(
            'from:server|to:_|type:1|id:{0}|body:{1}'.format(id_, msg)
        )
        try:
            client.send(init_msg)
        except:
            return

if __name__ == "__main__":
    server = Server()
    server.listen()