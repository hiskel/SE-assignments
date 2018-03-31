from urllib.request import urlopen
from threading import Thread

def attack(port):
    global stop
    waiting = False
    url = 'http://127.0.0.1:{0}'.format(port)
    while not stop:
        urlopen(url)

if __name__ == "__main__":
    stop = False
    port = eval(input('enter port number: '))
    for i in range(100):
        Thread(target=attack, args=(port, )).start()
    input('>> hit enter to stop: ')
    stop = True
     
