from flask import Flask, request, jsonify
import sys
import joblib
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))
from core.predict_cancellation import Prediction, process_data
from flask_cors import CORS

pred = joblib.load('../ensemble.joblib')

app = Flask(__name__)

CORS(app, resources={r"/predict": {"origins": ["http://localhost:5173", "http://localhost:3000"]}}, supports_credentials=True)


@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Server is running!"})

@app.route("/predict", methods=["POST"])
def predict_cancellation():
    try:
        data = request.get_json()

        records = [
            {
                # Categorical Features
                'Vehicle Type': data.get("vehicle_type"),
                'Pickup Location': data.get("pickup_location"),
                'Drop Location': data.get("drop_location"),

                # Numeric Features
                'Avg VTAT': data.get("avg_vtat"),

                # time
                'hour': data.get("hour"),
                'month': data.get("month"),
                'weekday': data.get("weekday"),  # 0=Mo ... 6=So
            },
        ]

        result = pred.predict_from_records(records)
        prediction = float(result['p_cancel_by_customer'].iloc[0]) * 100
        rounded = round(prediction, 2) 


        return jsonify({
            'prediction': rounded
        }), 200
    
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
