from core.predict_cancellation import Prediction, process_data

def main():
    pred = Prediction()
    df = process_data(pathToData='./data/ncr_ride_bookings.csv')
    X,y, num_cols, cat_cols = pred.build_X_y(df)
    pred.train_model(X, y, num_cols, cat_cols)

    records = [
        {
            # Categorical Features
            'Vehicle Type': 'Sedan',
            'Pickup Location': 'Connaught Place',
            'Drop Location': 'Airport',
            'Payment Method': 'UPI',

            # Numeric Features
            'Avg VTAT': 12,
            'Avg CTAT': 20,
            'Booking Value': 200,
            'Ride Distance': 8.5,
            'Driver Ratings': 4.7,
            'Customer Rating': 4.6,

            # time
            'hour': 18,
            'weekday': 5,  # 0=Mo ... 6=So
        },
        {
            'Vehicle Type': 'Go Mini',
            'Pickup Location': 'Palam Vihar',
            'Drop Location': 'Jhilmil',
            'Payment Method': 'Uber Wallet',

            'Avg VTAT': 5,
            'Avg CTAT': 25,
            'Booking Value': 237,
            'Ride Distance': 13.58,
            'Driver Ratings': 4.9,
            'Customer Rating': 2.3,

            'hour': 10,
            'weekday': 6,  # 0=Mo ... 6=So
        },
    ]

    probas_df = pred.predict_from_records(records)
    print(probas_df)

if __name__ == "__main__":
    main()

