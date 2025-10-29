import os
import joblib
from core.predict_cancellation import Prediction, process_data

def train_and_save_models():
    """Train both models and save them to disk"""
    # Train first model
    pred1 = Prediction()
    df1 = process_data(pathToData='./data/ncr_ride_bookings.csv')
    X1, y1, num_cols1, cat_cols1 = pred1.build_X_y(df1)
    pred1.train_model(X1, y1, num_cols1, cat_cols1, model='logreg')
    
    # Train second model
    pred2 = Prediction()
    df2 = process_data(pathToData='./data/ncr_ride_bookings.csv')
    X2, y2, num_cols2, cat_cols2 = pred2.build_X_y(df2)
    pred2.train_model(X2, y2, num_cols2, cat_cols2, model='rf')

    # Train third model
    pred3 = Prediction()
    df3 = process_data(pathToData='./data/ncr_ride_bookings.csv')
    X3, y3, num_cols3, cat_cols3 = pred3.build_X_y(df3)
    pred3.train_model(X3, y3, num_cols3, cat_cols3, model='svm')

    
    # Save both models
    joblib.dump(pred1, 'logreg.joblib')
    joblib.dump(pred2, 'rf.joblib')
    joblib.dump(pred3, 'svm.joblib')
    
    print("models trained and saved!")

def load_and_predict():
    """Load both models and make predictions"""
    # Load both models
    pred1 = joblib.load('logreg.joblib')
    pred2 = joblib.load('rf.joblib')
    pred3 = joblib.load('svm.joblib')
    
    records = [
        {
            'Vehicle Type': 'Sedan',
            'Pickup Location': 'Connaught Place',
            'Drop Location': 'Airport',
            'Payment Method': 'UPI',
            'Avg VTAT': 12,
            'Avg CTAT': 20,
            'Booking Value': 200,
            'Ride Distance': 8.5,
            'Driver Ratings': 4.7,
            'Customer Rating': 4.6,
            'hour': 18,
            'weekday': 5,
        },
    ]
    
    probas1 = pred1.predict_from_records(records)
    probas2 = pred2.predict_from_records(records)
    probas3 = pred3.predict_from_records(records)
    
    print("Logistic Regression predictions:", probas1)
    print("Random Forest predictions:", probas2)
    print("SVM predictions:", probas3)

def main():
    # Train if models don't exist
    if not os.path.exists('logreg.joblib') or not os.path.exists('rf.joblib') or not os.path.exists('svm.joblib'):
        print("Training models...")
        train_and_save_models()
    
    print("Making predictions...")
    load_and_predict()

if __name__ == "__main__":
    main()

