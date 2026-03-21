import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras import layers, models
from tensorflow.keras.applications import MobileNetV2

# Image parameters
IMG_SIZE = 224
BATCH_SIZE = 32
EPOCHS = 20

# Data generator with augmentation
train_gen = ImageDataGenerator(
    rescale=1./255,
    validation_split=0.2,
    horizontal_flip=True,
    rotation_range=20,
    zoom_range=0.2,
    shear_range=0.2
)

# Training dataset
train_data = train_gen.flow_from_directory(
    "../dataset",
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode="binary",
    subset="training"
)

# Validation dataset
val_data = train_gen.flow_from_directory(
    "../dataset",
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode="binary",
    subset="validation"
)

# Print class labels
print("Class labels:", train_data.class_indices)

# Load pretrained MobileNetV2
base_model = MobileNetV2(
    input_shape=(IMG_SIZE, IMG_SIZE, 3),
    include_top=False,
    weights="imagenet"
)

# Freeze base model layers
base_model.trainable = False

# Custom classification head
x = base_model.output
x = layers.GlobalAveragePooling2D()(x)
x = layers.BatchNormalization()(x)
x = layers.Dense(128, activation="relu")(x)
x = layers.Dropout(0.5)(x)
output = layers.Dense(1, activation="sigmoid")(x)

# Build final model
model = models.Model(inputs=base_model.input, outputs=output)

# Compile model
model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.0001),
    loss="binary_crossentropy",
    metrics=["accuracy"]
)

# Train model
model.fit(
    train_data,
    epochs=EPOCHS,
    validation_data=val_data
)

# Save trained model
model.save("../backend/model.h5")

print("Model training complete and saved as model.h5")