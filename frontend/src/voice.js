let isVoiceOn = false

export function setVoiceEnabled(enabled) {
  isVoiceOn = enabled
}

export function isVoiceEnabled() {
  return isVoiceOn
}

export function speak(text, priority = 'polite') {
  if (!isVoiceOn) return
  if (!text) return
  if (!window.speechSynthesis) return
  if (priority === 'assertive') window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(String(text))
  u.rate = 0.9
  u.pitch = 1.0
  u.volume = 1.0
  window.speechSynthesis.speak(u)
}

export function speakAlways(text) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(String(text))
  u.rate = 0.9
  u.volume = 1.0
  window.speechSynthesis.speak(u)
}