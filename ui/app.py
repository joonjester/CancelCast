import tkinter as tk

class App:
    def __init__(self, prediction):
        self.prediction = prediction
        self.root = tk.Tk()
        self.setup_ui()

    def setup_ui(self):
        self.root.title("CancelCast")

    def run(self):
        self.root.mainloop()

