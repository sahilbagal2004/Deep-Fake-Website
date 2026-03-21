import { useState, useRef } from 'react'
import './index.css'

function App() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (selected) {
      setFile(selected)
      setPreview(URL.createObjectURL(selected))
      setResult(null)
      setError('')
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select an image first')
      return
    }

    setLoading(true)
    setResult(null)
    setError('')

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        body: formData
      })
      
      const data = await response.json()
      setResult(data.result || "No result returned")
    } catch (err) {
      setError("Server error. Please check if backend is running.")
    } finally {
      setLoading(false)
    }
  }

  const isReal = result?.toLowerCase().includes("real")
  const isFake = result?.toLowerCase().includes("fake")

  return (
    <div className="app-container">
      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
      
      <main className="glass-panel">
        <header>
          <h1>Neural<span className="gradient-text">Guard</span></h1>
          <p className="subtitle">Advanced Deepfake Detection AI</p>
        </header>

        <div className="upload-section">
          <div 
            className={`drop-zone ${preview ? 'has-image' : ''}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange}
              accept="image/*,video/*" 
              className="hidden-input"
            />
            {preview ? (
              <img src={preview} alt="Preview" className="image-preview" />
            ) : (
              <div className="upload-placeholder">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <p>Click or drag & drop to upload</p>
                <span className="supported-formats">Supports JPG, PNG, MP4</span>
              </div>
            )}
          </div>
          
          <button 
            className={`analyze-btn ${loading ? 'loading' : ''}`}
            onClick={handleUpload}
            disabled={!file || loading}
          >
            {loading ? (
              <span className="loader">Analyzing...</span>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                Analyze Media
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="alert error">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            {error}
          </div>
        )}

        {result && (
          <div className={`result-card ${isReal ? 'real' : isFake ? 'fake' : ''}`}>
            <div className="result-icon">
              {isReal ? (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              ) : isFake ? (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
              ) : (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              )}
            </div>
            <div className="result-details">
              <span className="result-label">Analysis Complete</span>
              <h2 className="result-value">{result}</h2>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
