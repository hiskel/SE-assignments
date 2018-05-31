from collections import defaultdict

class Serial:
    def __init__(self, name):
        self.name = name
        self.next = None
    
    def __repr__(self):
        return self.name

class Condition:
    def __init__(self, label):
        self.name = label
        self.true = None
        self.false = None
    
    def __repr__(self):
        return self.name


class Parser:
   
    def parse(self, filename):
        heirarchy = defaultdict(list)
        conditionals = ['if', 'elif', 'else:']

        base_indent = None
        last_indent = None

        with open(filename) as file_:
            for line in file_.readlines():
                trimmed = line.strip()
                indent_level = self.__indent_level(line)

                if last_indent is None:
                    last_indent = indent_level
                else:
                    if indent_level < last_indent:
                        while (last_indent > indent_level):
                            if last_indent > base_indent:
                                del heirarchy[last_indent]
                            last_indent -= 4
                    last_indent = indent_level
                
                if trimmed.startswith('def '):
                    heirarchy[indent_level].append(Serial('function'))    
                    base_indent = indent_level
                                    
                elif trimmed:  # if different from ''
                    first_word = trimmed.split()[0]
                    if first_word in conditionals:
                        if first_word == 'if':
                            condition = Condition('cond ' + trimmed[2:])
                            if_condition = Serial("if true")
                            condition.true = if_condition
                            
                            if heirarchy[indent_level]:  # if there's some other statement before me, i'm his next
                                heirarchy[indent_level][-1].next = condition
                            else:
                                parent = heirarchy[indent_level - 4][-1]  # one indent up, the last node is the parent
                                
                                if type(parent) is Condition:  # if this is a nested if
                                    if not parent.true:  # if true branch is not taken, take it
                                        parent.true = condition
                                    else:
                                        parent.false = condition
                                else:
                                    parent.next = condition

                            heirarchy[indent_level].append(condition)
                            heirarchy[indent_level].append(if_condition)

                        elif first_word == 'elif':
                            last_condition = self.__last_condition(heirarchy[indent_level])
                            else_condition = Serial("if false")
                            new_condition = Condition('cond ' + trimmed[4:])
                            if_condition = Serial("if true")

                            last_condition.false = else_condition
                            else_condition.next = new_condition
                            new_condition.true = if_condition

                            heirarchy[indent_level].append(else_condition)
                            heirarchy[indent_level].append(new_condition)
                            heirarchy[indent_level].append(if_condition)

                        elif first_word == 'else:':
                            last_condition = self.__last_condition(heirarchy[indent_level])
                            else_condition = Serial("if false")
                            last_condition.false = else_condition
                            heirarchy[indent_level].append(else_condition)

                    else:  # here, they are just statements
                        statement = Serial(trimmed)
                        
                        if not heirarchy[indent_level]:  # if i'm the first in my indent level
                            parent = heirarchy[indent_level - 4][-1]
                            parent.next = statement
                        else:
                            predecessor = heirarchy[indent_level][-1]
                            predecessor.next = statement

                        heirarchy[indent_level].append(statement)

        return heirarchy[0][0]
    
    def output_paths(self, entry):
        paths = []
        conditions = []
        def traverse(entry, path):
            path += ' -> ' + str(entry)           
            
            next_ = entry.next
            if next_ is None:
                paths.append(path)
                return

            if type(next_) is Condition:
                path += ' -> ' + str(next_)
                traverse(next_.true, path)
                traverse(next_.false, path)            
            else:
                traverse(next_, path)
        
        traverse(entry, '')
        for path in paths:
            print(path)
    
    def __last_condition(self, indent_lane):
        for i in reversed(range(len(indent_lane))):
            if type(indent_lane[i]) is Condition:
                return indent_lane[i]

    def __indent_level(self, line):
        indent_level = 0
        for char in line:
            if char != ' ':
                return indent_level
            indent_level += 1
        return indent_level


if __name__ == "__main__":
    parser = Parser()
    result = parser.parse('test-script.py')
    
    

