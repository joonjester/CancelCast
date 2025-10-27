from flask import Flask, request, jsonify
import sys
import joblib
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))
from core.predict_cancellation import Prediction, process_data
from flask_cors import CORS

predLogReg = joblib.load('../logreg.joblib')
predRf = joblib.load('../rf.joblib')

app = Flask(__name__)

CORS(app, resources={r"/predict": {"origins": ["http://localhost:5173", "http://localhost:3000"]}}, supports_credentials=True)


pred = Prediction()
df = process_data(pathToData='../data/ncr_ride_bookings.csv')
X, y, num_cols, cat_cols = pred.build_X_y(df)
pred.train_model(X, y, num_cols, cat_cols)

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
                'Payment Method': data.get("payment_method"),

                # Numeric Features
                'Avg VTAT': data.get("avg_vtat"),
                'Avg CTAT': data.get("avg_ctat"),
                'Booking Value': data.get("booking_value"),
                'Ride Distance': data.get("ride_distance"),
                'Driver Ratings': data.get("driver_ratings"),
                'Customer Rating': data.get("customer_rating"),

                # time
                'hour': data.get("hour"),
                'weekday': data.get("weekday"),  # 0=Mo ... 6=So
            },
        ]

        result_logreg = predLogReg.predict_from_records(records)
        predictionLogReg = float(result_logreg['p_cancel_by_customer'].iloc[0]) * 100
        roundedLogReg = round(predictionLogReg, 2) 

        result_rf = predRf.predict_from_records(records)
        predictionRf = float(result_rf['p_cancel_by_customer'].iloc[0]) * 100
        roundedRf = round(predictionRf, 2) 


        return jsonify({
            'prediction_logreg': roundedLogReg,
            'prediction_rf': roundedRf
        }), 200
    
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
