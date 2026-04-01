import git
from flask import Flask, request, jsonify
from flask import render_template
from ot.ot import analysis
import json

app = Flask(__name__)

@app.route("/")
def hello_world():
    input="mamasa"
    forms=["ma.ma.sas","ma.ma.sa.s","ma.ma.sa","ma.ma.sa.sa","ma.ma.sa.as","sma.ma.sas"]
    consts=["DEP","MAX","NUC"]
    return render_template('index.html', input=input, forms=forms, consts=consts)

@app.route("/ot-analysis", methods=["POST"])
def ot_analysis():
    data = request.get_json()
    constraints = data.get("constraints")
    print(constraints)
    args = [0,"syllables"] + constraints
    tableau = analysis(args)
    tableau_list = [[key, value] for key, value in tableau.items()]
    print(tableau_list)
    return {"tableau": tableau_list}

@app.route("/update", methods=["POST"])
def update():
    if request.method == "POST":
        repo = git.Repo("./")
        origin = repo.remotes.origin
        origin.pull()
        print("success")
        return "Updated PythonAnywhere successfully.", 200
    else:
        print("fail")
        return "Wrong event type.", 400

if __name__ == '__main__':
    app.run()