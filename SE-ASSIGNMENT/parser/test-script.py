def hello():
    print('hello')
    if a > b:
        print('greater')
        a = 15 + 20
        if a > b:
            print('innerGreater')
        elif a == b:
            print('innerEqual')
        else:
            print('innerElse')
    elif c < d:
        print('less')
    else:
        print('somethingIsWrong')
    