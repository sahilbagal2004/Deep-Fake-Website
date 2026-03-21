import cv2
import numpy as np
import tensorflow as tf
import os

# Load trained model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.h5")
model = tf.keras.models.load_model(MODEL_PATH)


def preprocess(frame):
    frame = cv2.resize(frame, (224, 224))
    frame = frame / 255.0
    frame = np.expand_dims(frame, axis=0)
    return frame


def detect_video(path):

    # Read uploaded image
    frame = cv2.imread(path)

    if frame is None:
        return "Error: Could not read image"

    # Preprocess image
    frame = preprocess(frame)

    # Model prediction
    prediction = model.predict(frame)[0][0]

    print("Prediction Score:", prediction)

    # Confidence calculation
    confidence = round(prediction * 100, 2)

    # Classification
    if prediction >= 0.5:
        return f"Real Image (Confidence: {confidence}%)"
    else:
        return f"Fake Image (Confidence: {round(100-confidence,2)}%)"