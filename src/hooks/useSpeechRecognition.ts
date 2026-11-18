'use client'
import { sendGAEvent } from '@next/third-parties/google';
import { redirect, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react'

let recognition: any = null;

if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false
    recognition.lang = "el-GR"
}

const useSpeechRecognition = () => {
    const router = useRouter();
    const [text, setText] = useState("")
    const [isListening, setIsListening] = useState(false)
    // (2026-10-17) Αυτόματη μετάβαση στα αποτελέσματα ΜΟΝΟ για φωνητική αναζήτηση.
    // Όταν ο πελάτης πληκτρολογεί, βλέπει προτάσεις και πατά Enter ο ίδιος
    // (πριν, η σελίδα άλλαζε μόνη της 2″ μετά το τελευταίο πλήκτρο).
    const [voiceText, setVoiceText] = useState("")

    useEffect(() => {
        if (voiceText.trim().length > 2) {
            sendGAEvent('event', 'search', { text: voiceText })
            router.push(`/search?search=${encodeURIComponent(voiceText.trim())}`)
        }
    }, [voiceText, router])

    useEffect(() => {
        if (!recognition) return

        recognition.onresult = (event: SpeechRecognitionEvent) => {

            const transcript = event.results[0][0].transcript
            setText(transcript)
            setVoiceText(transcript)
            recognition.stop()
            setIsListening(false)
        }
    }, [])

    const startListening = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault()
        setText("")
        setIsListening(true)
        recognition.start()
    }

    const stopListening = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault()
        setIsListening(false)
        recognition.stop()
    }

    return {
        text,
        setText,
        isListening,
        startListening,
        stopListening,
        hasRecognitionSupport: !!recognition
    }
}

export default useSpeechRecognition