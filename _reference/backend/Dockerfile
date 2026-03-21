# Use a specialized, lightweight Python 3.10 image
FROM python:3.10-slim

# Install system dependencies required by OpenCV and HDF5
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all the remaining backend files
COPY . .

# HuggingFace Spaces run on port 7860 by default!
EXPOSE 7860
ENV PORT=7860

# Start up the native Flask app
CMD ["python", "app.py"]
