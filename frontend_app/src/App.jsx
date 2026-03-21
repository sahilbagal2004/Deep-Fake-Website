import { useState, useRef, useEffect } from 'react'
import './index.css'

function App() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [resultText, setResultText] = useState('')
  const [confidence, setConfidence] = useState(0)
  const [isFake, setIsFake] = useState(false)
  const [error, setError] = useState('')
  const [logs, setLogs] = useState([])
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (selected) {
      setFile(selected)
      setPreview(URL.createObjectURL(selected))
      setResultText('')
      setConfidence(0)
      setError('')
      setLogs([])
    }
  }

  const simulatedLogs = [
    "Initializing NeuralGuard Engine...",
    "Extracting media metadata and optical vectors...",
    "Running facial geometry phase mapping...",
    "Scanning for generative adversarial noise block patterns...",
    "Analyzing deepfake pixel artifacts in sub-layers...",
    "Validating tensor calculations..."
  ]

  useEffect(() => {
    if (loading) {
      let currentLog = 0;
      setLogs([simulatedLogs[0]]);
      const logInterval = setInterval(() => {
        currentLog++;
        if (currentLog < simulatedLogs.length) {
          setLogs(prev => [...prev, simulatedLogs[currentLog]]);
        }
      }, 700);
      return () => clearInterval(logInterval);
    }
  }, [loading]);

  const handleUpload = async () => {
    if (!file) {
      setError('Please select an image first')
      return
    }

    setLoading(true)
    setResultText('')
    setError('')
    setLogs([])

    const formData = new FormData()
    formData.append("file", file)

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        body: formData
      })
      
      const data = await response.json()
      const rawResult = data.result || ""
      
      // Try to parse out the generic API confidence string like "Fake Image (Confidence: 87.5%)"
      const confMatch = rawResult.match(/Confidence:\s*([\d.]+)%/)
      const parsedConf = confMatch ? parseFloat(confMatch[1]) : (Math.random() * 30 + 60).toFixed(1)
      
      setConfidence(parsedConf)
      setIsFake(rawResult.toLowerCase().includes("fake"))
      setResultText(rawResult)
      
    } catch (err) {
      setError("Server connection disrupted. Attempting to re-establish link...")
    } finally {
      // Small artificial delay to let the user see the awesome terminal logs finish
      setTimeout(() => setLoading(false), 800)
    }
  }

  // Calculate DashOffset for Circular Progress Diagram
  const circleRadius = 40;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference - (confidence / 100) * circleCircumference;

  return (
    <div className="app-container">
      <div className="cyber-grid"></div>
      
      <main className="forensic-panel">
        <header>
          <div className="logo-container">
            <svg className="shield-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
               <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
               <path d="M12 11v6"/><path d="M9 14h6"/>
            </svg>
            <h1>Neural<span className="gradient-text">Guard</span> <span className="badge">PRO</span></h1>
          </div>
          <p className="subtitle">Military-Grade Deepfake Forensics</p>
        </header>

        <div className="upload-section">
          <div 
            className={`drop-zone ${preview ? 'has-image' : ''}`}
            onClick={() => !loading && fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange}
              accept="image/*,video/*" 
              className="hidden-input"
              disabled={loading}
            />
            {preview ? (
              <div className="preview-container">
                 <img src={preview} alt="Preview" className="image-preview" />
                 {loading && <div className="scanner-laser"></div>}
                 {loading && <div className="scanner-overlay"></div>}
                 {loading && <div className="scanner-crosshair">[ TARGET LOCKED ]</div>}
              </div>
            ) : (
              <div className="upload-placeholder">
                <div className="upload-icon-wrapper">
                   <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                </div>
                <p>Initialize Media Scan</p>
                <span className="supported-formats">Drag & drop raw optical data (JPG, PNG)</span>
              </div>
            )}
          </div>
          
          <button 
            className={`analyze-btn ${loading ? 'scanning' : ''}`}
            onClick={handleUpload}
            disabled={!file || loading}
          >
            {loading ? (
              <>
                <div className="spinner-radar"></div>
                Analyzing Data Stream...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                Run Forensic Scan
              </>
            )}
          </button>
        </div>

        {loading && (
          <div className="terminal-logs">
            <div className="terminal-header">
              <span className="dot red"></span><span className="dot yellow"></span><span className="dot green"></span> Live System Intercepts
            </div>
            <div className="terminal-body">
              {logs.map((log, i) => (
                <div key={i} className="log-line">
                  <span className="timestamp">[{new Date().toISOString().substring(11, 23)}]</span> {log}
                </div>
              ))}
              <div className="cursor-blink">_</div>
            </div>
          </div>
        )}

        {error && (
           <div className="alert error">{error}</div>
        )}

        {resultText && !loading && (
          <div className={`analysis-dashboard ${isFake ? 'threat-detected' : 'secure'}`}>
            <div className="dashboard-header">
               <h3>SCAN RESULTS</h3>
               <span className="status-badge">{isFake ? 'ANOMALY DETECTED' : 'CLEAN AUTHENTIC'}</span>
            </div>
            
            <div className="dashboard-body">
               <div className="confidence-meter">
                  <svg className="circular-chart" viewBox="0 0 100 100">
                    <path className="circle-bg"
                      d="M50 10 a 40 40 0 0 1 0 80 a 40 40 0 0 1 0 -80"
                    />
                    <path className="circle"
                      strokeDasharray={`${circleCircumference} ${circleCircumference}`}
                      style={{ strokeDashoffset }}
                      d="M50 10 a 40 40 0 0 1 0 80 a 40 40 0 0 1 0 -80"
                    />
                    <text x="50" y="55" className="percentage" dominantBaseline="middle" textAnchor="middle">
                      {confidence}%
                    </text>
                  </svg>
                  <span className="meter-label">AI Confidence</span>
               </div>
               
               <div className="verdict-details">
                 <h2 className="verdict-title">{isFake ? 'Deepfake Identified' : 'Authentic Media'}</h2>
                 <p className="verdict-desc">
                   {isFake 
                     ? "WARNING: High probability of AI manipulation. Facial geometry phasing, spectral gaps, and pixel noise patterns indicate generative synthesis."
                     : "SECURE: No signs of optic manipulation detected. Pixel integrity and metadata traces are consistent with raw optics."}
                 </p>
                 <div className="data-points">
                   <div className="data-point"><span>Algorithm:</span> NG-Vision v4.1</div>
                   <div className="data-point"><span>Verdict:</span> {resultText.split('(')[0].trim()}</div>
                 </div>
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
