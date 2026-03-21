from flask import Flask, request, jsonify
from detect import detect_video
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "../uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/predict", methods=["POST"])
def predict():

    file = request.files.get("file")

    if not file:
        return jsonify({"error":"No file uploaded"})

    path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(path)

    result = detect_video(path)

    return jsonify({"result": result})

if __name__ == "__main__":
    app.run(debug=True)