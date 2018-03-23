class Value:
    NAME = '1'  # to submit name
    CLIENT = '2'  # single client joined broadcasted
    CLIENTS = '3'  # multiple clients joined broadcast
    MESSAGE = '4'  # unicast message
    BROADCAST = '4'  # message broadcast --> group chats
    NOTIFICATION = '5'  # notifications like, someone went offline
    SERVER = '__--__--'
    OK = '6'

    headers = ['from', 'to', 'type', 'body', 'id']
    types = [NAME, CLIENT, CLIENTS, BROADCAST, MESSAGE, OK, NOTIFICATION]

def parse(string):
    parsed = {}
    string = bytes_to_str(string)

    sections = right_format(string, 5, '|')
    if sections:
        for section in sections:
            header_values = right_format(section, 2, ':')
            if header_values:
                header, value = header_values
                # unknown headers must not be sent!
                if striplower(header) not in Value.headers:
                    return False
                parsed[header] = value.strip()
            else:
                return False
        type_ = parsed.get('type')
        if type_.strip() in Value.types:
            # id must come with NAME
            if parsed.get('type') == Value.NAME and (not parsed.get('id')):
                return False
            return parsed            
    return False

def stringify(parsed):
    stringified = ''
    for header in parsed.keys():
        value = parsed[header]
        stringified += header + ':' + value + '|'
    
    return str_to_bytes(stringified[:-1])

def right_format(str, count, token):
    split = str.split(token)
    if len(split) == count:
        for each in split:
            if not bool(each.strip()):  # empty strings mean no value
                return False
        return split
    return False

def bytes_to_str(byte_str):
    return str(byte_str)[2:-1]  #string comes in bytes form, exclude b' (2 chars) & ' (1)

def str_to_bytes(string):
    return bytes(string, encoding='utf-8')

def striplower(string):
    return string.strip().lower()