import API_BASE from '../config'
import { useEffect, useRef, useState, useContext } from 'react'
import * as faceapi from 'face-api.js'
import { AuthContext } from '../context/AuthContext'
import axios from 'axios'

// Helper to speak without needing AuthContext
function speakText(text) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.rate = 0.92
  u.pitch = 1.0
  u.volume = 1.0
  const voices = window.speechSynthesis.getVoices()
  const v = (
    voices.find(v => v.name.includes('Google UK English Female')) ||
    voices.find(v => v.name.includes('Microsoft Zira')) ||
    voices.find(v => v.lang === 'en-IN') ||
    voices.find(v => v.lang.startsWith('en'))
  )
  if (v) u.voice = v
  window.speechSynthesis.speak(u)
}

export default function FaceAuth({
  mode,
  role,
  targetUser,
  onSuccess,
  onClose
}) {
  const { darkMode } = useContext(AuthContext)
  const videoRef = useRef()
  const canvasRef = useRef()
  const streamRef = useRef()

  const [status, setStatus] = useState('Loading face recognition models...')
  const [isReady, setIsReady] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [countdown, setCountdown] = useState(null)
  const [faceDetected, setFaceDetected] = useState(false)

  const token = JSON.parse(localStorage.getItem('studentsync_user'))?.token

  // ─── All functions defined BEFORE useEffect ───

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
  }

  const performFaceLogin = async (descriptor) => {
    setIsProcessing(true)
    speakText('Face detected. Verifying identity.')
    try {
      const response = await axios.post(
        `${API_BASE}/api/students/face/login`,
        { descriptor: Array.from(descriptor), role }
      )
      speakText(`Identity confirmed. Welcome ${response.data.name}! Loading your dashboard.`)
      stopCamera()
      setTimeout(() => onSuccess(response.data), 2500)
    } catch (err) {
      const msg = err.response?.data?.message || 'Face not recognized. Please try again.'
      setStatus(`${msg}. Retrying...`)
      speakText(`${msg}. Scanning again. Please look at the camera.`)
      setIsProcessing(false)
      setFaceDetected(false)
      setTimeout(startAutoDetect, 2000)
    }
  }

  const startAutoDetect = () => {
    let attempts = 0
    const maxAttempts = 40
    const detect = async () => {
      if (!videoRef.current || isProcessing) return
      if (attempts >= maxAttempts) {
        setStatus('Could not detect face. Ensure good lighting and look directly at camera.')
        speakText('Face not detected. Please check lighting and try again.')
        return
      }
      attempts++
      try {
        const detection = await faceapi
          .detectSingleFace(videoRef.current)
          .withFaceLandmarks()
          .withFaceDescriptor()
        if (detection) {
          setFaceDetected(true)
          setStatus('Face detected! Verifying identity...')
          await performFaceLogin(detection.descriptor)
        } else {
          setFaceDetected(false)
          setStatus(`Scanning for face... (${attempts}/${maxAttempts}) Look directly at the camera`)
          setTimeout(detect, 800)
        }
      } catch {
        setTimeout(detect, 800)
      }
    }
    setTimeout(detect, 1500)
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          setIsReady(true)
          if (mode === 'login') {
            const msg = [
              'Camera is open.',
              'Please look directly at the camera.',
              'Keep your face centered.',
              'Recognition is automatic.',
              'Please hold still.'
            ].join(' ')
            setStatus('Camera is open. Please look directly at the camera.')
            speakText(msg)
            startAutoDetect()
          } else {
            const name = mode === 'admin-register' ? targetUser?.name : 'your'
            setStatus(
              `Camera ready. Position ${name === 'your' ? 'your' : `${name}'s`} face in the center and click Capture Face.`
            )
            speakText('Camera ready. Position the face in the center and press capture.')
          }
        }
      }
    } catch {
      setStatus('Camera access denied. Please allow camera permission and try again.')
      speakText('Camera access was denied. Please allow camera permission.')
    }
  }

  const loadModels = async () => {
    try {
      setStatus('Loading AI models... please wait')
      speakText('Loading face recognition. Please wait.')
      await faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models')
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models')
      setStatus('Models loaded. Starting camera...')
      await startCamera()
    } catch {
      setStatus('Error loading models. Please refresh the page.')
      speakText('Error loading face recognition models. Please refresh.')
    }
  }

  const handleCapture = async () => {
    if (!videoRef.current || isProcessing) return
    setIsProcessing(true)
    for (let i = 3; i >= 1; i--) {
      setCountdown(i)
      speakText(`${i}`)
      await new Promise(r => setTimeout(r, 1000))
    }
    setCountdown(null)
    try {
      setStatus('Scanning face...')
      speakText('Scanning face now.')
      const detection = await faceapi
        .detectSingleFace(videoRef.current)
        .withFaceLandmarks()
        .withFaceDescriptor()
      if (!detection) {
        setStatus('No face detected. Make sure the face is clearly visible and try again.')
        speakText('No face detected. Please try again.')
        setIsProcessing(false)
        return
      }
      const descriptor = Array.from(detection.descriptor)
      if (mode === 'admin-register') {
        await axios.post(
          `${API_BASE}/api/students/face/admin-register`,
          {
            descriptor,
            targetUsername: targetUser.username || targetUser.studentId
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      } else {
        await axios.post(
          `${API_BASE}/api/students/face/register`,
          { descriptor },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      }
      speakText('Face registered successfully!')
      setStatus('Face registered successfully!')
      stopCamera()
      setTimeout(() => onSuccess(), 1500)
    } catch {
      setStatus('Registration failed. Please try again.')
      speakText('Face registration failed. Please try again.')
      setIsProcessing(false)
    }
  }

  // ─── useEffect comes AFTER all functions ───
  useEffect(() => {
    const init = async () => {
      await loadModels()
    }
    init()
    return () => stopCamera()
    // eslint-disable-next-line
  }, [])

  const getTitle = () => {
    if (mode === 'login') return '👁️ Face Login'
    if (mode === 'admin-register') return `📸 Register Face — ${targetUser?.name}`
    return '📸 Register Your Face'
  }

  const getHint = () => {
    if (mode === 'login') return 'Look directly at camera • Ensure good lighting • Remove sunglasses'
    return 'Ensure good lighting • Face camera directly • Remove glasses if possible'
  }

  const styles = {
    overlay: {
      position: 'fixed', top: 0, left: 0,
      width: '100%', height: '100%',
      background: 'rgba(0,0,0,0.88)',
      zIndex: 300,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Segoe UI, sans-serif'
    },
    modal: {
      background: darkMode ? '#16213e' : '#fff',
      borderRadius: '20px',
      padding: '32px',
      width: '90%',
      maxWidth: '560px',
      textAlign: 'center',
      color: darkMode ? '#e0e0e0' : '#1a1a2e'
    },
    title: { fontSize: '20px', fontWeight: '700', marginBottom: '8px' },
    status: {
      fontSize: '14px',
      color: darkMode ? '#a0a0b0' : '#666',
      marginBottom: '20px',
      minHeight: '42px',
      lineHeight: '1.6'
    },
    videoContainer: {
      position: 'relative',
      width: '100%',
      maxWidth: '480px',
      margin: '0 auto 20px',
      borderRadius: '12px',
      overflow: 'hidden',
      border: faceDetected ? '3px solid #06d6a0' : '3px solid #4361ee',
      transition: 'border-color 0.3s'
    },
    video: { width: '100%', display: 'block', transform: 'scaleX(-1)' },
    countdown: {
      position: 'absolute',
      top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      fontSize: '80px', fontWeight: '700',
      color: '#fff', textShadow: '0 0 20px rgba(0,0,0,0.8)'
    },
    faceIndicator: {
      position: 'absolute',
      bottom: '10px', left: '50%',
      transform: 'translateX(-50%)',
      background: faceDetected ? '#06d6a0' : '#e63946',
      color: '#fff', padding: '4px 14px',
      borderRadius: '12px', fontSize: '12px',
      fontWeight: '600', transition: 'background 0.3s'
    },
    captureBtn: {
      padding: '13px 28px',
      background: isProcessing ? '#888' : '#4361ee',
      color: '#fff', border: 'none',
      borderRadius: '10px', fontSize: '15px',
      fontWeight: '600',
      cursor: isProcessing ? 'not-allowed' : 'pointer',
      marginRight: '10px'
    },
    closeBtn: {
      padding: '13px 22px',
      background: 'transparent',
      color: darkMode ? '#a0a0b0' : '#888',
      border: `1px solid ${darkMode ? '#a0a0b0' : '#ddd'}`,
      borderRadius: '10px', fontSize: '15px',
      cursor: 'pointer'
    },
    hint: {
      marginTop: '16px', fontSize: '12px',
      color: darkMode ? '#7070a0' : '#aaa',
      lineHeight: '1.7'
    }
  }

  return (
    <div style={styles.overlay} role="dialog" aria-modal="true" aria-label={getTitle()}>
      <div style={styles.modal}>
        <div style={styles.title}>{getTitle()}</div>
        <div style={styles.status} role="status" aria-live="polite" aria-atomic="true">
          {status}
        </div>
        <div style={styles.videoContainer}>
          <video
            ref={videoRef} autoPlay muted playsInline
            style={styles.video}
            aria-label="Camera feed for face recognition"
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          {countdown && (
            <div style={styles.countdown} aria-hidden="true">{countdown}</div>
          )}
          {isReady && (
            <div style={styles.faceIndicator} aria-hidden="true">
              {faceDetected ? '✓ Face detected' : '○ Searching...'}
            </div>
          )}
        </div>
        <div>
          {(mode === 'register' || mode === 'admin-register') && (
            <button
              style={styles.captureBtn}
              onClick={handleCapture}
              disabled={isProcessing || !isReady}
              aria-label="Capture and save face"
            >
              {isProcessing ? 'Processing...' : '📸 Capture Face'}
            </button>
          )}
          <button
            style={styles.closeBtn}
            onClick={() => { stopCamera(); onClose() }}
            aria-label="Cancel and close camera"
          >
            Cancel
          </button>
        </div>
        <div style={styles.hint} aria-hidden="true">{getHint()}</div>
      </div>
    </div>
  )
}