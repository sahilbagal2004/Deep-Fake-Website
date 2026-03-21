import cv2
import numpy as np
import tensorflow as tf
import os

import h5py
import json
import shutil

# Load trained model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.h5")

def strip_invalid_kwargs(model_path):
    clean_path = model_path + ".clean.h5"
    if os.path.exists(clean_path):
        return clean_path
    
    shutil.copy2(model_path, clean_path)
    try:
        f = h5py.File(clean_path, mode='r+')
        model_config = json.loads(f.attrs.get('model_config', '{}').decode('utf-8'))
        
        def clean_layer(config):
            if 'config' in config:
                config['config'].pop('quantization_config', None)
                config['config'].pop('optional', None)
            if 'layers' in config.get('config', {}):
                for layer in config['config']['layers']:
                    clean_layer(layer)
                    
        if 'config' in model_config and 'layers' in model_config['config']:
            for layer in model_config['config']['layers']:
                clean_layer(layer)
                
        f.attrs['model_config'] = json.dumps(model_config).encode('utf-8')
        f.close()
    except Exception as e:
        print("H5 sanitization failed:", e)
    return clean_path

clean_model_path = strip_invalid_kwargs(MODEL_PATH)
try:
    model = tf.keras.models.load_model(clean_model_path, compile=False)
except Exception:
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
        return f"Fake Image (Confidence: {round(100-confidence,2)}%)"