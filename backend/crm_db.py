import json
import os

DB_FILE = "/workspaces/saas-demo-portal/backend/db.json"

def get_db():
    if not os.path.exists(DB_FILE):
        return {}
    try:
        with open(DB_FILE, "r") as f:
            return json.load(f)
    except:
        return {}

def save_db(data):
    with open(DB_FILE, "w") as f:
        json.dump(data, f, indent=4)

def update_section(section, data):
    db = get_db()
    db[section] = data
    save_db(db)

def get_section(section):
    db = get_db()
    return db.get(section, None)
