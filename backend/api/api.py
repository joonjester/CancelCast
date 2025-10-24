from flask import Flask, request, jsonify
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from core.predict_cancellation import Prediction, process_data

app = Flask(__name__)

pred = Prediction()
df = process_data(pathToData='./data/ncr_ride_bookings.csv')
X, y, num_cols, cat_cols = pred.build_X_y(df)
pred.train_model(X, y, num_cols, cat_cols)

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Server is running!"})

@app.route("/api/predict", methods=["POST"])
def predict_cancellation():
    try:
        data = request.get_json()

        vehicle_type = data.get("vehicle_type")
        pickup_location = data.get("pickup_location")
        drop_location = data.get("drop_location")
        payment_method = data.get("payment_method")
        avg_vtat = data.get("avg_vtat")
        avg_ctat = data.get("avg_ctat")
        booking_value = data.get("booking_value")
        ride_distance = data.get("ride_distance")
        driver_ratings = data.get("driver_ratings")
        customer_rating = data.get("customer_rating")
        hour = data.get("hour")
        weekday = data.get("weekday")

        records = [
            {
                # Categorical Features
                'Vehicle Type': vehicle_type,
                'Pickup Location': pickup_location,
                'Drop Location': drop_location,
                'Payment Method': payment_method,

                # Numeric Features
                'Avg VTAT': avg_vtat,
                'Avg CTAT': avg_ctat,
                'Booking Value': booking_value,
                'Ride Distance': ride_distance,
                'Driver Ratings': driver_ratings,
                'Customer Rating': customer_rating,

                # time
                'hour': hour,
                'weekday': weekday,  # 0=Mo ... 6=So
            },
        ]

        result_df = pred.predict_from_records(records)
        prediction = float(result_df['p_cancel_by_customer'].iloc[0]) * 100
        rounded = round(prediction, 4) 

        return jsonify({
            'prediction': rounded
        }), 200
    
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
