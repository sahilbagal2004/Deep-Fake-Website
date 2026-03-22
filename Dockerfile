# Root Dockerfile for Hugging Face Spaces deployment
FROM python:3.10-slim

# Install system dependencies required by OpenCV and HDF5
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file from the backend folder and install dependencies
COPY _reference/backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the exact backend files over
COPY _reference/backend .

# HuggingFace Spaces run on port 7860 by default!
EXPOSE 7860
ENV PORT=7860

# Start up the native Flask app
CMD ["python", "app.py"]
