import json
from pathlib import Path
from flask import Flask, render_template, jsonify

BASE_DIR = Path(__file__).resolve().parent
PROFILE_PATH = BASE_DIR / "data" / "profile.json"

app = Flask(__name__)

def load_profile() -> dict:
    with open(PROFILE_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

@app.get("/")
def home():
    profile = load_profile()
    return render_template("index.html", profile=profile)

@app.get("/releases")
def releases():
    profile = load_profile()
    return render_template("releases.html", profile=profile)

@app.get("/api/profile")
def api_profile():
    return jsonify(load_profile())

if __name__ == "__main__":
    app.run(debug=True)
