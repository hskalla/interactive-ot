import sys
import argparse
from consts import compile

def main(args):
    # --- get forms from txt file ---

    file_path = "forms/" + args.input_set + ".txt"
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

    return violations

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("input",type=int)
    parser.add_argument("input_set",type=str)
    parser.add_argument("constraints",type=str,nargs='+')

    args = parser.parse_args()
    sys.exit(main(args)) # Calls the main function and exits with its return value