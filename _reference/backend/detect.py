import cv2
import numpy as np
import os
import tempfile
import json
import h5py

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
import tensorflow as tf

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.h5")

def sanitize_h5(model_path):
    """
    Keras 3 saves massive nested objects inside the H5 file that crash Keras 2.
    This recursively scrubs the entire JSON tree to perfectly translate it backwards.
    """
    temp_fd, temp_path = tempfile.mkstemp(suffix=".h5")
    os.close(temp_fd)
    
    import shutil
    shutil.copy2(model_path, temp_path)
    
    with h5py.File(temp_path, 'r+') as f:
        model_config_raw = f.attrs.get('model_config')
        if model_config_raw:
            if isinstance(model_config_raw, bytes):
                model_config_raw = model_config_raw.decode('utf-8')
            
            config = json.loads(model_config_raw)
            
            def deep_clean(obj):
                if isinstance(obj, dict):
                    # Strip Keras 3 exclusive kwargs from every layer config
                    if 'quantization_config' in obj:
                        obj.pop('quantization_config')
                    if 'optional' in obj:
                        obj.pop('optional')
                    
                    # Convert complicated DTypePolicy back to simple string 'float32'
                    if 'dtype' in obj and isinstance(obj['dtype'], dict):
                        if obj['dtype'].get('class_name') == 'DTypePolicy':
                            obj['dtype'] = obj['dtype'].get('config', {}).get('name', 'float32')
                    
                    # Downgrade batch_shape -> batch_input_shape (Keras 2 strict requirement)
                    if 'batch_shape' in obj:
                        obj['batch_input_shape'] = obj.pop('batch_shape')
                        
                    for k, v in obj.items():
                        deep_clean(v)
                        
                elif isinstance(obj, list):
                    for item in obj:
                        deep_clean(item)
            
            # Execute infinite recursion cleanup on the entire JSON
            deep_clean(config)
            
            # Save the scrubbed, flawless JSON back into the HDF5!
            f.attrs['model_config'] = json.dumps(config).encode('utf-8')
            
    return temp_path

print("Sanitizing Core Model Definitions...")
clean_path = sanitize_h5(MODEL_PATH)

print("Loading Stabilized Model Engine...")
model = tf.keras.models.load_model(clean_path, compile=False)


def preprocess(frame):
    # CRITICAL FIX: OpenCV reads as BGR, but Neural Networks are trained on RGB!
    frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
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