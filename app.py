import git
from flask import Flask, request, jsonify
from flask import render_template
from ot.ot import analysis
import json
import hmac
import hashlib

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
    x_hub_signature = request.headers.get("X-Hub-Signature")
    w_secret = os.environ["WEBHOOK_SECRET"]
    if not is_valid_signature(x_hub_signature, request.data, w_secret):
        return "Invalid credentials.", 401
    if request.method == "POST":
        repo = git.Repo("./")
        origin = repo.remotes.origin
        origin.pull()
        print("success")
        return "Updated PythonAnywhere successfully.", 200
    else:
        print("fail")
        return "Wrong event type.", 400

def is_valid_signature(x_hub_signature, data, private_key):
    # x_hub_signature and data are from the webhook payload
    # private key is your webhook secret
    hash_algorithm, github_signature = x_hub_signature.split('=', 1)
    algorithm = hashlib.__dict__.get(hash_algorithm)
    encoded_key = bytes(private_key, 'latin-1')
    mac = hmac.new(encoded_key, msg=data, digestmod=algorithm)
    return hmac.compare_digest(mac.hexdigest(), github_signature)

if __name__ == '__main__':
    app.run()