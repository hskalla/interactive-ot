import sys
import argparse
from ot.consts import compile
#from consts import compile

def harmonic_sort(arr, depth):
    output_arr = {}
    max_depth = len(list(arr.values())[0])
    max_violations = 0
    for i in range(len(arr.keys())):
        max_violations = max(max_violations, list(arr.values())[i][depth])
    for v in range(max_violations+1):
        form_set = {}
        for i in range(len(arr.keys())):
            if list(arr.values())[i][depth] == v:
                form_set[list(arr.keys())[i]] = list(arr.values())[i]
        if len(form_set)<=1 or depth + 1 >= max_depth:
            output_arr.update(form_set)
        else:
            output_arr.update(harmonic_sort(form_set,depth+1))
    return output_arr

def format(tableau):
    formatted_tableau = {}
    keys = list(tableau.keys())
    formatted_tableau[keys[0]] = [""] * len(tableau[keys[0]])

    for k in range(1, len(keys)):
        formatted_violations = []
        exc = False
        for i in range(len(tableau[keys[k]])):
            if not exc and "!" in formatted_tableau[keys[k-1]][i]:
                ast_count = formatted_tableau[keys[k-1]][i].count("*")
                formatted_violations.append(formatted_tableau[keys[k-1]][i] + "*" * (tableau[keys[k]][i] - ast_count))
                exc = True
            elif not exc and tableau[keys[k]][i] > tableau[keys[k-1]][i]:
                dif = tableau[keys[k]][i] - tableau[keys[k-1]][i] - 1
                formatted_violations.append("*" * (tableau[keys[k-1]][i] + 1) + "!" + "*" * dif)
                exc = True
            else:
                formatted_violations.append("*" * tableau[keys[k]][i])
        formatted_tableau[keys[k]] = formatted_violations

    formatted_violations = []
    for i in range(len(tableau[keys[0]])):
        formatted_string = "*" * tableau[keys[0]][i]
        if "!" in formatted_tableau[keys[1]][i]:
            formatted_string += "?"
        formatted_violations.append(formatted_string)
    formatted_tableau[keys[0]] = formatted_violations

    return formatted_tableau

def const_list():
    consts = compile()
    for i in range(len(consts)):
        consts[i] = consts[i].name
    return consts

def main(args):
    # --- get forms from txt file ---

    file_path = "ot/forms/" + args.input_set + ".txt"
    #file_path = "forms/" + args.input_set + ".txt"
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        content = content.split("\n")
        input_and_forms = content[args.input].split(", ")
        input = input_and_forms[0]
        forms = input_and_forms[1:]
    except FileNotFoundError:
        print(f"Error: The file '{file_path}' was not found.")

    # --- compile the consts into a list ---

    consts = []
    available_consts = compile()

    for c in args.constraints:
        const_or_none = next((x for x in available_consts if x.name == c), None)
        if not const_or_none:
            raise Exception("Invalid constraint name.")
        consts.append(const_or_none)

    # --- run the ot analysis ---

    violations = {}

    for form in forms:
        v = []
        for c in consts:
            v.append(c.func(form,input))
        violations[form] = v

    tableau = harmonic_sort(violations,0)
    if args.format:
        return format(tableau)
    else:
        return tableau

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("input",type=int)
    parser.add_argument("input_set",type=str)
    parser.add_argument("constraints",type=str,nargs='+')
    parser.add_argument("-f","--format", action="store_true")

    args = parser.parse_args()
    sys.exit(main(args)) # Calls the main function and exits with its return value

def analysis(args):
    parser = argparse.ArgumentParser()
    parser.add_argument("input",type=int)
    parser.add_argument("input_set",type=str)
    parser.add_argument("constraints",type=str,nargs='+')
    parser.add_argument("-f","--format", action="store_true")

    args = parser.parse_args(args)
    return main(args)