from socket import socket, AF_INET, SOCK_STREAM


class Client:
    def __init__(self):
        self.sock = socket(AF_INET, SOCK_STREAM)
        self.sock.connect(('127.0.0.1', 8888))
        self.sock.send(bytes("add:1,2,3,4,5", encoding="utf-8"))
        self.await_result()
    
    def await_result(self):
        answer = self.sock.recv(256)
        print(answer)


if __name__ == "__main__":
    client = Client()