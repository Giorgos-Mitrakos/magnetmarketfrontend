import { useState, useEffect } from 'react'

let recognition: any = null;

if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false
    recognition.lang = "el-GR"
}

const useSpeechRecognition = () => {
    const [text, setText] = useState("")
    const [isListening, setIsListening] = useState(false)

    useEffect(() => {
        if (!recognition) return
        
        recognition.onresult = (event: SpeechRecognitionEvent) => {
            
            setText(event.results[0][0].transcript)
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