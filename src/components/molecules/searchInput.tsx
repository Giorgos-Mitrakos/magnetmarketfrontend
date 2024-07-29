"use client"

import { AiOutlineSearch } from "react-icons/ai";
import IconLink from "../atoms/iconLink";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import useSpeechRecognition from "@/hooks/useSpeechRecognition";

function SearchInput() {

    const { text, setText, isListening, startListening, stopListening, hasRecognitionSupport } = useSpeechRecognition()

    return (
        <div className="flex items-center">
            <form className="flex items-end border-b-2 bg-inherit border-siteColors-purple"
                aria-label="Αναζήτηση">
                {hasRecognitionSupport &&
                    <button onClick={isListening ? stopListening : startListening}
                        className="flex items-end text-siteColors-purple text-lg xs:text-xl md:text-2xl"
                        aria-label="Ενεργοποίηση φωνητικής αναζήτησης"
                    >
                        {isListening ?
                            <FaMicrophone
                            aria-label="Φωνητική αναζήτηση - Αναζητήστε ανά προϊόν, κατασκευαστή ή κατηγορία με φωνητικές εντολές!"                            
                                className='text-red-600 text-2xl mb-1 ' /> :
                            <FaMicrophoneSlash
                                className='text-siteColors-purple text-2xl mb-1' />}
                    </button>}
                <input type="search" placeholder="Αναζήτηση" value={text} onChange={(e) => setText(e.target.value)}
                    className="px-3 w-64 bg-inherit focus:outline-0" 
                    aria-label="Πεδίο αναζήτησης προϊόντων"/>
            </form>
            <IconLink icon={<AiOutlineSearch />}
                url="#"
                aria-label="Αναζήτηση - Αναζητήστε ανά προϊόν, κατασκευαστή ή κατηγορία"/>
        </div>
    )
}

export default SearchInput