async function upload(){

const fileInput = document.getElementById("file")
const file = fileInput.files[0]
const resultBox = document.getElementById("result")
const button = document.querySelector("button")
const progressBar = document.getElementById("progressBar")

if(!file){
alert("Please select an image first")
return
}

// Loading UI
resultBox.innerText = "🔍 Analyzing image..."
resultBox.style.color = "#ffffff"

button.disabled = true
button.innerText = "Detecting..."

if(progressBar){
progressBar.style.width = "30%"
}

let formData = new FormData()
formData.append("file", file)

try{

let response = await fetch("http://127.0.0.1:5000/predict",{
method:"POST",
body:formData
})

let data = await response.json()

if(progressBar){
progressBar.style.width = "100%"
}

let resultText = data.result || "No result returned"

resultBox.innerText = "Prediction: " + resultText

// Result color logic
if(resultText.toLowerCase().includes("real")){
resultBox.style.color = "#00ff9d"
}
else if(resultText.toLowerCase().includes("fake")){
resultBox.style.color = "#ff4d4d"
}
else{
resultBox.style.color = "#ffffff"
}

}catch(error){

resultBox.innerText = "❌ Server error. Please check backend."
resultBox.style.color = "#ff4d4d"

}

// Reset button
button.disabled = false
button.innerText = "Detect"

}



// Image preview function
function previewImage(){

const fileInput = document.getElementById("file")
const file = fileInput.files[0]
const preview = document.getElementById("preview")

if(!file){
preview.src = ""
return
}

const reader = new FileReader()

reader.onload = function(e){
preview.src = e.target.result
}

reader.readAsDataURL(file)

}