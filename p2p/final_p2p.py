from socket import socket, AF_INET, SOCK_DGRAM
import string

s = socket(AF_INET, SOCK_DGRAM)
port = eval(input("enter your port number: "))
ip_other = input("enter the other guys ip: ").strip()
port_other = eval(input("enter the other guys port: "))
my_addr = ('127.0.0.1', port)
other = (ip_other, port_other)


def start_server_and_listen():
    s.bind(my_addr)
    while True:
        received = s.recvfrom(512)
        print("him/her: {0}".format(received[0]))

def send_msg():
    while True:
        msg = input("you: ")
        s.sendto(bytearray(msg, encoding='utf-8'), other)

if __name__ == "__main__":
    from threading import Thread
    t1 = Thread(target=start_server_and_listen)
    t1.start()
    send_msg()

    
    
