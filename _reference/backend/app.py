from flask import Flask, request, jsonify
from detect import detect_video
import os
import tempfile
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = tempfile.gettempdir()

@app.route("/predict", methods=["POST"])
def predict():

    file = request.files.get("file")

    if not file:
        return jsonify({"error":"No file uploaded"})

    path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(path)

    try:
        result = detect_video(path)
    finally:
        if os.path.exists(path):
            os.remove(path)

    return jsonify({"result": result})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)