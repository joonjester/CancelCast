import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import LinearSVC
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    accuracy_score,
    roc_auc_score,
    f1_score,
)
from sklearn.ensemble import VotingClassifier


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
            'Avg VTAT', 'hour', 'weekday', 'month'
        ]
        #'Avg CTAT', 'Booking Value', 'Ride Distance', 'Payment Method',

        # Categorical features
        cat_cols = [
            'Vehicle Type', 'Pickup Location', 'Drop Location'
        ]

        # Keep only the columns that actually exist (robustness if schema changes)
        num_cols = [c for c in num_cols if c in df.columns]
        cat_cols = [c for c in cat_cols if c in df.columns]

        X = df[num_cols + cat_cols].copy()
        print(f'Number of features: {len(num_cols) + len(cat_cols)}')
        return X, y, num_cols, cat_cols

    def make_pipeline(self, num_cols, cat_cols, model: str = 'logreg'):
        """Create preprocessing + classifier pipeline. model in {'logreg','rf','svm','ensemble'}."""
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

        # Choose classifier
        model = (model or 'logreg').lower()
        if model == 'rf':
            clf = RandomForestClassifier(
                n_estimators=800,
                max_depth=16,
                min_samples_leaf=15,
                class_weight='balanced_subsample',
                random_state=42
            )
        elif model == 'svm':
            # Fast linear SVM for large/high-dimensional data; no probability fit (uses decision_function)
            clf = LinearSVC(
                class_weight='balanced',
                random_state=42
            )
        elif model == 'ensemble':
            # Weighted Soft Voting Ensemble combining Logistic Regression, Random Forest, and Linear SVM (approximation)
            logreg = LogisticRegression(max_iter=1000, class_weight='balanced')
            rf = RandomForestClassifier(
                n_estimators=400,
                max_depth=12,
                min_samples_leaf=20,
                class_weight='balanced_subsample',
                random_state=42
            )
            svm = LinearSVC(class_weight='balanced', dual='auto', random_state=42)
            # Wrap LinearSVC in CalibratedClassifierCV for probability support
            from sklearn.calibration import CalibratedClassifierCV
            svm_calibrated = CalibratedClassifierCV(svm, method='isotonic', cv=3)
            clf = VotingClassifier(
                estimators=[('logreg', logreg), ('rf', rf), ('svm', svm_calibrated)],
                voting='soft',
                weights=[3, 1, 2],
                n_jobs=-1
            )
        else:
            # default: logistic regression
            clf = LogisticRegression(max_iter=1000, class_weight='balanced', n_jobs=None)

        pipe = Pipeline(steps=[('preprocess', preprocessor), ('clf', clf)])
        return pipe

    def train_model(self, X, y, num_cols, cat_cols, model: str = 'logreg'):
        # Drop rows with missing target
        mask = y.notna()
        X, y = X[mask], y[mask]

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        print('Class balance (train):')
        print(y_train.value_counts(normalize=True).rename(lambda k: f'class_{k}'))

        print(f"Training model: {model}")
        self.pipeline = self.make_pipeline(num_cols, cat_cols, model=model)
        self.num_cols = list(num_cols)
        self.cat_cols = list(cat_cols)
        self.pipeline.fit(X_train, y_train)

        # Show feature importances for Random Forest
        if str(model).lower() == 'rf':
            self._rf_feature_importance(top_n=20)

        y_pred = self.pipeline.predict(X_test)
        y_proba = None
        y_scores = None
        try:
            y_proba = self.pipeline.predict_proba(X_test)[:, 1]
        except Exception:
            try:
                y_scores = self.pipeline.decision_function(X_test)
            except Exception:
                y_scores = None

        print('Accuracy:', round(accuracy_score(y_test, y_pred), 4))
        print('Confusion matrix:\n', confusion_matrix(y_test, y_pred))
        print('Classification report:\n', classification_report(y_test, y_pred, digits=4))
        if y_proba is not None:
            print('ROC-AUC:', round(roc_auc_score(y_test, y_proba), 4))
        elif y_scores is not None:
            # Use decision_function scores for AUC when no predict_proba is available (e.g., LinearSVC)
            print('ROC-AUC (decision_function):', round(roc_auc_score(y_test, y_scores), 4))
        # --- 3‑Zeilen F1‑Threshold (nur wenn Wahrscheinlichkeiten vorhanden sind) ---
        if y_proba is not None:
            thresholds = np.linspace(0.1, 0.9, 9)
            best_thr = max(thresholds, key=lambda t: f1_score(y_test, (y_proba >= t).astype(int)))
            print(f"Best threshold for F1: {best_thr:.2f}")

        return self.pipeline


    def _rf_feature_importance(self, top_n: int = 20):
        """Print top-n feature importances for the current Random Forest pipeline."""
        try:
            clf = self.pipeline.named_steps['clf']
            if not hasattr(clf, 'feature_importances_'):
                print("Feature importance: current classifier has no feature_importances_.")
                return
            pre = self.pipeline.named_steps['preprocess']
            feat_names = pre.get_feature_names_out()
            importances = clf.feature_importances_
            fi = pd.DataFrame({
                'feature': feat_names,
                'importance': importances
            }).sort_values('importance', ascending=False)
            print(f"\nTop {top_n} Feature Importances (Random Forest):")
            print(fi.head(top_n).to_string(index=False))
        except Exception as e:
            print(f"Could not compute feature importances: {e}")

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
        proba = None
        try:
            proba = self.pipeline.predict_proba(X_new)[:, 1]
        except Exception:
            # Fallback for models without predict_proba (e.g., LinearSVC): use decision_function and logistic mapping
            try:
                scores = self.pipeline.decision_function(X_new)
                proba = 1 / (1 + np.exp(-scores))
            except Exception:
                raise RuntimeError("Current model does not support probability or decision scores for inference.")
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
        # Logistic Regression
        print("\n=== Logistic Regression ===")
        self.train_model(X, y, num_cols, cat_cols, model='logreg')
        # Random Forest
        print("\n=== Random Forest ===")
        self.train_model(X, y, num_cols, cat_cols, model='rf')
        # Support Vector Machine (LinearSVC - fast)
        print("\n=== Support Vector Machine (LinearSVC) ===")
        self.train_model(X, y, num_cols, cat_cols, model='svm')
        # Weighted Soft Voting Ensemble
        print("\n=== Weighted Soft Voting Ensemble (LogReg + RF + SVM) ===")
        self.train_model(X, y, num_cols, cat_cols, model='ensemble')


if __name__ == "__main__":
    pred = Prediction()
    pred.main()
