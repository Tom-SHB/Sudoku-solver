

import sys
import typing
import doctest

sys.setrecursionlimit(10_000)

def update_clause(clause,assignments):
    new_clause=clause[:]
    k=0
    for literal in clause:
        if literal[0] in assignments:
            k+=1
            if literal[1]!=assignments[literal[0]]:
                new_clause.remove(literal)
            
            else:
                return 'satisfied'
  
    return new_clause

def update_formula(formula,assignments):
 new_assignments=0
 new_formula=[]
 for clause in formula:
     new_clause=update_clause(clause,assignments)
     if new_clause=='satisfied':
         continue 
     if len(new_clause)==1:
         assignments.update({new_clause[0][0]:new_clause[0][1]})
         new_assignments+=1
     
     new_formula.append(new_clause)
 return new_formula,new_assignments

def set_val(formula,assignments):
    new_assignments=1
    while new_assignments>0:  
       new=update_formula(formula,assignments)
       new_formula=new[0]
       new_assignments=new[1]
    m=satisfying_assignment(new_formula)
    if m!=None:
        assignments.update(m)
    else:
           return None 
      
    return assignments


                        
                


    

def satisfying_assignment(formula):
  
 
    if formula==[]: 
        return {}
    if [] in formula: 
        return None   
    rand_var=formula[0][0][0]
    try1=set_val(formula,{rand_var:True})
    if try1!=None:
        return try1
    else:
        try2=set_val(formula,{rand_var:False})
        if try2!=None:
         return try2
    return None 





def sudoku_board_to_sat_formula(sudoku_board):
    
    n=len(sudoku_board)
    sat=[]
    for i in range(n):
        for j in range(n):
            if sudoku_board[i][j]!=0:
                sat.append([(f"{str(i)}+{str(j)}+{str(sudoku_board[i][j])}",True)])
    sat.extend(cell(n)) 
    sat.extend(row(n,(0,n),(0,n)))
    sat.extend(column(n,(0,n),(0,n)))
    sat.extend(block(n)) 
    return sat 
  

def cell(n):
    new=[]
    for i in range(n):
        for j in range(n):
            new.append([(f"{str(i)}+{str(j)}+{str(k)}",True) for k in range(1,n+1)])
            for k in range(1,n+1):
                for l in range(k,n+1):
                    if l!=k:
                        new.append([(f"{str(i)}+{str(j)}+{str(k)}",False),(f"{str(i)}+{str(j)}+{str(l)}",False)])
    return new 
def row(n,start,end):
    new=[]
    a,b=start
    c,d=end
    for i in range(a,b):
        for k in range(1,n+1):
            new.append([(f"{str(i)}+{str(j)}+{str(k)}",True) for j in range(c,d)])
            for j1 in range(c,d):
                for j2 in range(j1,d):
                    if j2!=j1:
                        new.append([(f"{str(i)}+{str(j1)}+{str(k)}",False),(f"{str(i)}+{str(j2)}+{str(k)}",False)])
    return new
def column(n,start,end):
    new=[]
    a,b=start
    c,d=end
    for j in range(c,d):
        for k in range(1,n+1):
            new.append([(f"{str(i)}+{str(j)}+{str(k)}",True) for i in range(a,b)])
            for i1 in range(a,b):
                for i2 in range(i1,b):
                    if i2!=i1:
                        new.append([(f"{str(i1)}+{str(j)}+{str(k)}",False),(f"{str(i2)}+{str(j)}+{str(k)}",False)])
    return new

def combos(x,y):
    l=set()
    for i in range(x[0],x[1]):
        for j in range(y[0],y[1]):
            for i2 in range(x[0],x[1]):
                for j2 in range(y[0],y[1]):
                    if (i,j)!=(i2,j2):
                      m=frozenset(((i,j),(i2,j2)))
                      l.add(m)
    return l
def block(n):
    new=[]
    for i in range(0,n,int(n**(1/2))):
        for j in range(0,n,int(n**(1/2))):
                    for k in range(1,n+1):
                        new.append([(f"{str(m)}+{str(l)}+{str(k)}",True) for m in range(i,i+int(n**(1/2))) for l in range (j,j+int(n**(1/2))) ])  
                        comboss=combos((i,i+int(n**(1/2))),(j,j+int(n**(1/2))))
                        for combo in comboss:
                                    combo=list(combo)
                                    new.append([(f"{str(combo[0][0])}+{str(combo[0][1])}+{str(k)}",False),(f"{str(combo[1][0])}+{str(combo[1][1])}+{str(k)}",False)])

    return new


def assignments_to_sudoku_board(assignments, n):

    if assignments==None:
        return None
    board=[[0 for i in range(n)]for j in range(n)]
    for string in assignments.keys():
        if assignments[string]==True:
            digits=string.split('+')
            x=int(digits[0])
            y=int(digits[1])
            value=int(digits[2])
           
            board[x][y]=value
   
    
    return board


    

if __name__ == "__main__":
    import doctest

    
  