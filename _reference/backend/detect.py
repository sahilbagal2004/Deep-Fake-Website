import cv2
import numpy as np
import os

# Suppress AVX CPU Info message
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  
import tensorflow as tf
from tensorflow.keras.layers import InputLayer, Dense

# --- MONKEY PATCHING KERAS 3 to KERAS 2 ---
# Keras 3 saves models with properties Keras 2 doesn't understand. 
# We intercept the layer initialization to translate or delete these properties!

_original_input_init = InputLayer.__init__
def patched_input_init(self, **kwargs):
    kwargs.pop('optional', None) # Present in Keras 3, invalid in Keras 2
    if 'batch_shape' in kwargs:
        # Keras 3 uses batch_shape, Keras 2 strictly expects batch_input_shape
        kwargs['batch_input_shape'] = kwargs.pop('batch_shape')
    _original_input_init(self, **kwargs)
InputLayer.__init__ = patched_input_init

_original_dense_init = Dense.__init__
def patched_dense_init(self, **kwargs):
    kwargs.pop('quantization_config', None) # Present in Keras 3, invalid in Keras 2
    _original_dense_init(self, **kwargs)
Dense.__init__ = patched_dense_init
# ------------------------------------------

# Load trained model safely
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.h5")
model = tf.keras.models.load_model(MODEL_PATH, compile=False)


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
        return f"Fake Image (Confidence: {round(100 - confidence, 2)}%)"