'use client'
import SiteFeature from "../molecules/siteFeature";
import { FaRotate, FaRegCreditCard, FaRegComments } from "react-icons/fa6";
import { AiOutlineSafety } from "react-icons/ai";
import { useEffect, useRef, useState } from "react";

export interface SiteFeatureProps {
    siteFeatures: SiteFeatureProps[]
}

const features = [
    {
        icon: <FaRotate className="text-siteColors-lightblue dark:text-blue-400" aria-label="Δύο βέλη που σχηματίζουν κύκλο και δείχνουν προς αντίθετες κατευθύνσεις" />,
        "aria-label": "Δωρεάν επιστροφή",
        "aria-description": "Δωρεάν επιστροφή για ελαττωματικά προϊόντα",
        header: "Δωρεάν Επιστροφή",
        content: "Για ελαττωματικά προϊόντα",
    },
    {
        icon: <FaRegCreditCard className="text-siteColors-lightblue dark:text-blue-400" aria-label="Πιστωτική κάρτα" />,
        "aria-label": "Πληρωμές με κάρτα",
        "aria-description": "Ασφαλείς πληρωμές με κάρτα",
        header: "Πληρωμές με κάρτα",
        content: "Ασφαλείς πληρωμές",
    },
    {
        icon: <FaRegComments className="text-siteColors-lightblue dark:text-blue-400" aria-label="Συνεφάκια ομιλίας" />,
        "aria-label": "Τεχνική Υποστήριξη",
        "aria-description": "Τεχνική Υποστήριξη 10:00 - 18:00",
        header: "Τεχνική Υποστήριξη",
        content: "10:00 - 18:00",
    },
    {
        icon: <AiOutlineSafety className="text-siteColors-lightblue dark:text-blue-400" aria-label="Ασπίδα" />,
        "aria-label": "Εγγύηση",
        "aria-description": "Τα προϊόντα έρχονται με εγγύηση Ελληνικής Αντιπροσωπείας",
        header: "Εγγύηση",
        content: "Ελληνικής Αντιπροσωπείας",
    }
]

const SiteFeatures = () => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isPaused, setIsPaused] = useState(false);
    const scrollSpeed = 50; // pixels per second

    useEffect(() => {
        if (typeof window === 'undefined' || !scrollContainerRef.current) return;

        const container = scrollContainerRef.current;
        const content = container.firstChild as HTMLDivElement;
        
        // Reset scroll position
        container.scrollLeft = 0;
        
        let animationFrameId: number;
        let lastTimestamp: number;
        
        const animateScroll = (timestamp: number) => {
            if (!lastTimestamp) lastTimestamp = timestamp;
            
            if (!isPaused && container && content) {
                const elapsed = timestamp - lastTimestamp;
                const scrollAmount = (scrollSpeed * elapsed) / 1000;
                
                if (container.scrollLeft >= content.scrollWidth - container.offsetWidth) {
                    // Reached the end, reset to start
                    container.scrollLeft = 0;
                } else {
                    container.scrollLeft += scrollAmount;
                }
            }
            
            lastTimestamp = timestamp;
            animationFrameId = requestAnimationFrame(animateScroll);
        };
        
        animationFrameId = requestAnimationFrame(animateScroll);
        
        // Pause on hover
        const pause = () => setIsPaused(true);
        const resume = () => setIsPaused(false);
        
        container.addEventListener('mouseenter', pause);
        container.addEventListener('mouseleave', resume);
        container.addEventListener('touchstart', pause);
        container.addEventListener('touchend', resume);
        
        return () => {
            cancelAnimationFrame(animationFrameId);
            container.removeEventListener('mouseenter', pause);
            container.removeEventListener('mouseleave', resume);
            container.removeEventListener('touchstart', pause);
            container.removeEventListener('touchend', resume);
        };
    }, [isPaused]);

    return (
        <section 
            aria-label="Παροχές του καταστήματος" 
            className="w-full py-6 dark:bg-slate-800 dark:border-slate-700"
        >
            <div className="container mx-auto px-4">
                {/* Desktop Layout - Grid */}
                <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {features.map((feature, index) => (
                        <div 
                            key={feature.header}
                            className="flex justify-center"
                        >
                            <SiteFeature 
                                icon={feature.icon}
                                aria-label={feature["aria-label"]}
                                header={feature.header}
                                content={feature.content}
                                isLast={index === features.length - 1}
                            />
                        </div>
                    ))}
                </div>
                
                {/* Mobile Layout - Auto-scrolling */}
                <div 
                    ref={scrollContainerRef}
                    className="md:hidden flex overflow-x-hidden pb-2 -mx-4 px-4 [scrollbar-width:none] [-ms-overflow-style:none]"
                >
                    <div className="flex space-x-4 min-w-max">
                        {features.map((feature, index) => (
                            <div 
                                key={feature.header}
                                className="w-64 flex-shrink-0" 
                            >
                                <SiteFeature 
                                    icon={feature.icon}
                                    aria-label={feature["aria-label"]}
                                    header={feature.header}
                                    content={feature.content}
                                    isLast={index === features.length - 1}
                                    isMobile={true}
                                />
                            </div>
                        ))}
                        {/* Duplicate content for seamless looping */}
                        {features.map((feature, index) => (
                            <div 
                                key={`${feature.header}-dup`}
                                className="w-64 flex-shrink-0" 
                            >
                                <SiteFeature 
                                    icon={feature.icon}
                                    aria-label={feature["aria-label"]}
                                    header={feature.header}
                                    content={feature.content}
                                    isLast={index === features.length - 1}
                                    isMobile={true}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default SiteFeatures;