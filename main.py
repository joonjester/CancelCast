from ui.app import App
from core.predict_cancellation import Prediction

def main():
    prediction = Prediction()
    app = App(prediction)
    app.run()

if __name__ == "__main__":
    main()

