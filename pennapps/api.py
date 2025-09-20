from rate import get_rating
from flask import Flask, request, jsonify
import pandas as pd

app = Flask(__name__)

df = pd.read_csv("crime_2025.csv")



@app.route("/", methods=["GET"])
def home():
    return "Crime in Philly sucks dude"



@app.route("/api/insert", methods=["POST"])
def insert():
    try:
        data = request.json
        new_row = {}
        for col in df.columns:
            new_row[col] = str(data.get(col)) #Could be None

        df.append(new_row, ignore_index = True)
        df.to_csv("crime_2025.csv")
        
        return {"success" : True}
    
    except Exception as e:
        print(f"Recieved error {e}") 
        return {"error" : str(e)}
    


@app.route("/api/score", methods=["POST"])
def score():
    try:
        data = request.json
        return get_rating(data['lat'], data['lon'], data['time'])
    
    except Exception as e:
        print(f"Recieved error {e}")
        return {"error" : str(e)}


if __name__ == "__main__":
    app.run(debug=True)
