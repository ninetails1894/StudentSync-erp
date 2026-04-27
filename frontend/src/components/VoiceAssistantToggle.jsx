import { useState, useEffect } from 'react'
import { setVoiceEnabled, speakAlways, speak } from '../voice'

export default function VoiceAssistantToggle() {
  const [voiceOn, setVoiceOn] = useState(false)

  // Global focus listener — reads ANY element when focused
  useEffect(() => {
    if (!voiceOn) return

    const handleFocus = (e) => {
      const el = e.target
      const tag = el.tagName?.toLowerCase()
      const interactive = ['button','input','select','textarea','a']
      const isInteractive = (
        interactive.includes(tag) ||
        el.getAttribute('role') === 'button' ||
        el.getAttribute('role') === 'tab' ||
        el.getAttribute('role') === 'switch' ||
        (el.getAttribute('tabindex') &&
         el.getAttribute('tabindex') !== '-1')
      )
      if (!isInteractive) return

      const label = (
        el.getAttribute('aria-label') ||
        el.innerText?.trim() ||
        el.getAttribute('placeholder') ||
        el.getAttribute('title') ||
        tag
      )

      // Add type context
      let suffix = ''
      if (tag === 'select') {
        const selected = el.options?.[el.selectedIndex]?.text
        suffix = ` dropdown, currently ${selected}`
      } else if (tag === 'input') {
        if (el.type === 'password') suffix = ' password field'
        else if (el.type === 'text') suffix = ' text field'
        else if (el.type === 'number') suffix = ' number field'
        if (el.value && el.type !== 'password') suffix += `, value ${el.value}`
      } else if (tag === 'button') {
        suffix = ' button'
      }

      if (label && label.length < 300) {
        speak(label + suffix, 'assertive')
      }
    }

    const handleChange = (e) => {
      const el = e.target
      if (el.tagName?.toLowerCase() === 'select') {
        const selected = el.options?.[el.selectedIndex]?.text
        speak(selected, 'assertive')
      }
    }

    document.addEventListener('focusin', handleFocus, true)
    document.addEventListener('change', handleChange, true)

    return () => {
      document.removeEventListener('focusin', handleFocus, true)
      document.removeEventListener('change', handleChange, true)
    }
  }, [voiceOn])

  const toggle = () => {
    const newState = !voiceOn
    setVoiceOn(newState)
    setVoiceEnabled(newState)

    if (newState) {
      // Speak immediately even before state updates
      setTimeout(() => {
        speakAlways(
          'Voice assistant is now ON. ' +
          'I will read every element as you navigate. ' +
          'Press Tab to move between elements. ' +
          'Press Arrow keys to switch tabs. ' +
          'Press Escape to close popups.'
        )
      }, 100)
    } else {
      window.speechSynthesis?.cancel()
    }
  }

  // This focus handler speaks ALWAYS
  // so blind users can find the toggle
  const handleFocus = () => {
    window.speechSynthesis?.cancel()
    const msg = voiceOn
      ? 'Voice assistant toggle. Currently ON. Press Enter to turn off.'
      : 'Voice assistant toggle. Currently OFF. Press Enter to turn on.'
    const u = new SpeechSynthesisUtterance(msg)
    u.rate = 0.9
    u.volume = 1.0
    const voices = window.speechSynthesis?.getVoices() || []
    const v = voices.find(v => v.lang.startsWith('en'))
    if (v) u.voice = v
    window.speechSynthesis?.speak(u)
  }

  return (
    <button
      onClick={toggle}
      onFocus={handleFocus}
      tabIndex={0}
      role="switch"
      aria-checked={voiceOn}
      aria-label={
        voiceOn
          ? 'Voice assistant ON — press Enter to turn off'
          : 'Voice assistant OFF — press Enter to turn on'
      }
      style={{
        position: 'fixed',
        top: '0px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        padding: '8px 20px',
        background: voiceOn ? '#06d6a0' : '#4361ee',
        color: '#fff',
        border: 'none',
        borderRadius: '0 0 12px 12px',
        cursor: 'pointer',
        fontWeight: '700',
        fontSize: '13px',
        fontFamily: 'Segoe UI, sans-serif',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        minWidth: '160px',
        justifyContent: 'center'
      }}
    >
      {voiceOn ? '🔊 Voice ON' : '🔇 Voice OFF'}
    </button>
  )
}