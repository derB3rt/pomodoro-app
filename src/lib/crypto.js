// AES-GCM Verschlüsselung via Web Crypto API (läuft im Browser, kein Server nötig)
// Der Schlüssel wird einmalig generiert und im localStorage gespeichert.
// Supabase speichert nur verschlüsselte Daten – ohne den lokalen Schlüssel nicht lesbar.

const KEY_STORAGE = 'pom_enc_key'

async function getKey() {
  const stored = localStorage.getItem(KEY_STORAGE)
  if (stored) {
    const raw = Uint8Array.from(atob(stored), c => c.charCodeAt(0))
    return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt'])
  }
  // Neuen Schlüssel generieren
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt'])
  const exported = await crypto.subtle.exportKey('raw', key)
  localStorage.setItem(KEY_STORAGE, btoa(String.fromCharCode(...new Uint8Array(exported))))
  return key
}

export async function encryptText(plaintext) {
  if (!plaintext) return null
  try {
    const key = await getKey()
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encoded = new TextEncoder().encode(plaintext)
    const cipherBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded)
    // IV + Ciphertext zusammen als Base64
    const combined = new Uint8Array(iv.byteLength + cipherBuf.byteLength)
    combined.set(iv, 0)
    combined.set(new Uint8Array(cipherBuf), iv.byteLength)
    return btoa(String.fromCharCode(...combined))
  } catch {
    return plaintext // Fallback: unverschlüsselt
  }
}

export async function decryptText(ciphertext) {
  if (!ciphertext) return null
  try {
    const key = await getKey()
    const combined = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0))
    const iv = combined.slice(0, 12)
    const data = combined.slice(12)
    const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data)
    return new TextDecoder().decode(plainBuf)
  } catch {
    return ciphertext // Fallback: Rohtext anzeigen (alte unverschlüsselte Einträge)
  }
}
