import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    accuracy_score,
    roc_auc_score,
)


def process_data(pathToData: str):
    """Load CSV and create target + basic time features."""
    df = pd.read_csv(pathToData)

    # --- Target: cancelled by customer (binary) ---
    # Use the provided indicator column; treat missing as 0
    df['is_cancelled'] = (
        pd.to_numeric(df['Cancelled Rides by Customer'], errors='coerce')
        .fillna(0)
        .astype(int)
    )

    # --- Parse time features ---
    # Some rows might have inconsistent/missing time values; coerce errors to NaT
    date = pd.to_datetime(df['Date'], errors='coerce')
    time = pd.to_datetime(df['Time'], format='%H:%M:%S', errors='coerce')

    # hour from Time; weekday from Date
    df['hour'] = time.dt.hour
    df['weekday'] = date.dt.weekday  # Monday=0
    df['month'] = date.dt.month
    df['day'] = date.dt.day
    df['is_weekend'] = df['weekday'].isin([5, 6]).astype(int)

    return df


class Prediction:
    def __init__(self):
        self.data = {}
        self.model = None
        self.pipeline = None
        self.feature_names_ = None
        self.num_cols = None
        self.cat_cols = None

    def build_X_y(self, df: pd.DataFrame):
        """Select features and split X / y. Avoid obvious leakage columns."""
        y = df['is_cancelled']

        # Numeric features
        num_cols = [
            'Avg VTAT', 'Avg CTAT', 'Booking Value', 'Ride Distance',
            'Driver Ratings', 'Customer Rating', 'hour', 'weekday'
        ]

        # Categorical features
        cat_cols = [
            'Vehicle Type', 'Pickup Location', 'Drop Location', 'Payment Method'
        ]

        # Keep only the columns that actually exist (robustness if schema changes)
        num_cols = [c for c in num_cols if c in df.columns]
        cat_cols = [c for c in cat_cols if c in df.columns]

        X = df[num_cols + cat_cols].copy()
        return X, y, num_cols, cat_cols

    def make_pipeline(self, num_cols, cat_cols):
        """Create preprocessing + logistic regression pipeline."""
        numeric_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='median')),
            ('scaler', StandardScaler())
        ])

        categorical_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='most_frequent')),
            ('onehot', OneHotEncoder(handle_unknown='ignore'))
        ])

        preprocessor = ColumnTransformer(
            transformers=[
                ('num', numeric_transformer, num_cols),
                ('cat', categorical_transformer, cat_cols),
            ]
        )

        # class_weight='balanced' helps if cancellations are rare
        clf = LogisticRegression(max_iter=1000, class_weight='balanced', n_jobs=None)

        pipe = Pipeline(steps=[('preprocess', preprocessor), ('clf', clf)])
        return pipe

    def train_model(self, X, y, num_cols, cat_cols):
        # Drop rows with missing target
        mask = y.notna()
        X, y = X[mask], y[mask]

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        print('Class balance (train):')
        print(y_train.value_counts(normalize=True).rename(lambda k: f'class_{k}'))

        self.pipeline = self.make_pipeline(num_cols, cat_cols)
        self.num_cols = list(num_cols)
        self.cat_cols = list(cat_cols)
        self.pipeline.fit(X_train, y_train)

        y_pred = self.pipeline.predict(X_test)
        y_proba = None
        try:
            y_proba = self.pipeline.predict_proba(X_test)[:, 1]
        except Exception:
            pass

        print('Accuracy:', round(accuracy_score(y_test, y_pred), 4))
        print('Confusion matrix:\n', confusion_matrix(y_test, y_pred))
        print('Classification report:\n', classification_report(y_test, y_pred, digits=4))
        if y_proba is not None:
            print('ROC-AUC:', round(roc_auc_score(y_test, y_proba), 4))

        return self.pipeline


    def _prepare_X_for_inference(self, df_new: pd.DataFrame) -> pd.DataFrame:
        """Ensure df_new has the same columns as training. If a column is missing, create it as NA/None.
        Numeric columns -> NaN, Categorical -> None. Extra columns are ignored.
        """
        assert self.num_cols is not None and self.cat_cols is not None, "Train the model before inference."

        df_new = df_new.copy()
        # create missing numeric columns as NaN
        for c in self.num_cols:
            if c not in df_new.columns:
                df_new[c] = np.nan
        # create missing categorical columns as None
        for c in self.cat_cols:
            if c not in df_new.columns:
                df_new[c] = None
        # keep only the training columns (order matters for ColumnTransformer)
        X_new = df_new[self.num_cols + self.cat_cols]
        return X_new

    def predict_from_records(self, records: list[dict]) -> pd.DataFrame:
        """Accept a list of python dicts (one per ride), return a DataFrame with probabilities for customer cancellation."""
        assert self.pipeline is not None, "Model not trained. Call train_model() first."
        df_new = pd.DataFrame.from_records(records)
        X_new = self._prepare_X_for_inference(df_new)
        proba = self.pipeline.predict_proba(X_new)[:, 1]
        return pd.DataFrame({
            'p_cancel_by_customer': proba
        })

    def main(self):
        df = process_data(pathToData='../data/ncr_ride_bookings.csv')
        print('erste Zeilen:')
        print(df.head())

        print(f"Spalten des Datensatzes:  {list(df.columns)}")
        print(f"Info zum Datensatz: {df.info()}")
        print(df.describe(include='all'))

        X, y, num_cols, cat_cols = self.build_X_y(df)
        self.train_model(X, y, num_cols, cat_cols)


if __name__ == "__main__":
    pred = Prediction()
    pred.main()
