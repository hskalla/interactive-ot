import re

SYL = "."
NUC = ["a","e","i","o","u","æ","ɒ","ɪ"]
NUC_RE = "[" + "".join(NUC) + "]"

def compile():
    consts = []
    # first compile the built-in constraints
    consts.append(Const("MAX",_max,"Prohibits deletion. From \"maximal.\""))
    consts.append(Const("DEP",_dep,"Prohibits epenthesis. From \"dependent.\""))
    consts.append(Const("NUC",_nuc,"Syllables must have nuclei. From \"nucleus.\""))
    consts.append(Const("*CODA",_not_coda,"Prohibits syllable codas."))
    consts.append(Const("ONS",_ons,"Syllables must have onsets. From \"onset.\""))
    consts.append(Const("*COMPLEX",_not_complex,"Syllables must not have more than one segment in onset, nucleus or coda."))
    # TODO: compile the custom constraints

    # then return
    return consts

class Const():
    def __init__(self, name, func, desc):
        self.name = name
        self.desc = desc
        self.func = func


# --- faithfulness constraints ---

def _max(form, input):
    dif = len(input.replace(SYL,"")) - len(form.replace(SYL,""))
    return max(dif, 0)

def _dep(form, input):
    dif = len(form.replace(SYL,"")) - len(input.replace(SYL,""))
    return max(dif, 0) 

# --- markedness constraints ---

def _nuc(form, input):
    violations = 0
    for s in form.split(SYL):
        if not any(n in s for n in NUC):
            violations += 1
    return violations

def _not_coda(form, input):
    violations = 0
    for s in form.split(SYL):
        if len(s) > 1 and not s[-1] in NUC:
            violations += 1
    return violations

def _ons(form, input):
    violations = 0
    for s in form.split(SYL):
        non_coda = re.split(NUC_RE, s)
        if len(non_coda) == 0 or len(non_coda[0]) == 0:
            violations += 1
    return violations

def _not_complex(form, input): #TODO: fix for complex nuclei and codas, not just onsets
    violations = 0
    for s in form.split(SYL):
        non_coda = re.split(NUC_RE, s)
        if len(non_coda) > 0 and len(non_coda[0]) > 1:
            violations += 1
    return violations