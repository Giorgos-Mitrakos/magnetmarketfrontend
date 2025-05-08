"use client"

import { AiOutlineSearch } from "react-icons/ai";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import useSpeechRecognition from "@/hooks/useSpeechRecognition";
import { useRouter } from "next/navigation";
import { sendGAEvent } from "@next/third-parties/google";

function SearchInput() {
    const router = useRouter();

    const { text, setText, isListening, startListening, stopListening, hasRecognitionSupport } = useSpeechRecognition()
    
    const handleClick = () => {
        isListening ? stopListening : startListening
      };
    
      const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
        if (event.key === "Enter") {
          event.preventDefault(); // Prevents the button from triggering on Enter
        }
      };

    return (
        <div className="flex place-self-center w-full lg:w-1/2 dark:text-slate-800">
            <form onSubmit={(e) => {
                sendGAEvent('event', 'search', {
                    text
                });
                e.preventDefault()
                router.push(`/search?search=${text}`)
            }}
                className="flex w-full justify-between border-b-2 p-2 rounded-sm bg-inherit dark:bg-slate-800 border-siteColors-purple"
                aria-label="Αναζήτηση">
                {hasRecognitionSupport &&
                    <button onClick={isListening ? stopListening : startListening} onKeyDown={handleKeyDown}
                        className="flex text-siteColors-purple dark:text-slate-200 text-lg xs:text-xl md:text-2xl"
                        aria-label="Ενεργοποίηση φωνητικής αναζήτησης"
                    >
                        {isListening ?
                            <FaMicrophone
                                aria-label="Φωνητική αναζήτηση - Αναζητήστε ανά προϊόν, κατασκευαστή ή κατηγορία με φωνητικές εντολές!"
                                className='text-red-600 text-2xl mb-1 ' /> :
                            <FaMicrophoneSlash
                                className='text-siteColors-purple dark:text-slate-800 text-2xl mb-1' />}
                    </button>}
                <input type="search" tabIndex={0} placeholder="Αναζήτηση" value={text} onChange={(e) => setText(e.target.value)}
                    className="pl-2 bg-inherit  dark:text-slate-100 outline-none border-none flex-grow"
                    aria-label="Πεδίο αναζήτησης προϊόντων" />
                <button type="submit"
                    aria-label="Αναζήτηση - Αναζητήστε ανά προϊόν, κατασκευαστή ή κατηγορία">
                    <AiOutlineSearch
                        aria-label="Κουμπί αναζήτησης"
                        className="text-3xl text-siteColors-purple dark:text-slate-200" />
                </button>
            </form>
        </div>
    )
}

export default SearchInput