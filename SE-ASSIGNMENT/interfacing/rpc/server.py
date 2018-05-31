from socket import socket, AF_INET, SOCK_STREAM


class Server:
    def __init__(self):
        self.sock = socket(AF_INET, SOCK_STREAM)
        self.sock.bind(('', 8888))
        self.sock.listen(10)
    
    def accept_connections(self):
        while True:
            sock, addr = self.sock.accept()
            command = sock.recv(256).strip()

            func, args = command.split(b':')
            if func == b'add':
                nums = []
                for num in args.split(b','):
                    try:
                        nums.append(int(num))
                    except:
                        sock.send(bytes("wrong command", encoding="utf-8"))
                        break
                result = self.add(*nums)
                print('result is: ' + str(result))
                sock.send(bytes(str(result), encoding="utf-8"))
            else:
                sock.send(bytes("wrong command", encoding="utf-8"))
            sock.close()
    
    def add(self, *args):
        return sum(args)

if __name__ == "__main__":
    server = Server()
    server.accept_connections()