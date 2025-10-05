'use client'
import { memo, useEffect, useRef, useState } from 'react'
import { FaRotate, FaRegCreditCard, FaRegComments } from "react-icons/fa6"
import { AiOutlineSafety } from "react-icons/ai"
import SiteFeature from "../molecules/siteFeature"

interface FeatureData {
    id: string
    iconType: string
    ariaLabel: string
    ariaDescription: string
    header: string
    content: string
}

interface SiteFeaturesClientProps {
    features: FeatureData[]
}

// Icon mapping function
const getIcon = (iconType: string) => {
    const iconProps = {
        className: "text-siteColors-lightblue dark:text-blue-400",
        'aria-label': getIconAriaLabel(iconType)
    }

    switch (iconType) {
        case 'rotate':
            return <FaRotate {...iconProps} />
        case 'creditcard':
            return <FaRegCreditCard {...iconProps} />
        case 'comments':
            return <FaRegComments {...iconProps} />
        case 'safety':
            return <AiOutlineSafety {...iconProps} />
        default:
            return <FaRotate {...iconProps} />
    }
}

// Helper για aria labels
const getIconAriaLabel = (iconType: string) => {
    switch (iconType) {
        case 'rotate':
            return "Δύο βέλη που σχηματίζουν κύκλο και δείχνουν προς αντίθετες κατευθύνσεις"
        case 'creditcard':
            return "Πιστωτική κάρτα"
        case 'comments':
            return "Συνεφάκια ομιλίας"
        case 'safety':
            return "Ασπίδα"
        default:
            return ""
    }
}

const SiteFeaturesClient = memo(({ features }: SiteFeaturesClientProps) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const [isPaused, setIsPaused] = useState(false)
    const scrollSpeed = 50 // pixels per second

    // Auto-scroll effect - ΙΔΙΟ όπως πριν
    useEffect(() => {
        if (typeof window === 'undefined' || !scrollContainerRef.current) return

        const container = scrollContainerRef.current
        const content = container.firstChild as HTMLDivElement

        // Reset scroll position
        container.scrollLeft = 0

        let animationFrameId: number
        let lastTimestamp: number

        const animateScroll = (timestamp: number) => {
            if (!lastTimestamp) lastTimestamp = timestamp

            if (!isPaused && container && content) {
                const elapsed = timestamp - lastTimestamp
                const scrollAmount = (scrollSpeed * elapsed) / 1000

                if (container.scrollLeft >= content.scrollWidth - container.offsetWidth) {
                    // Reached the end, reset to start
                    container.scrollLeft = 0
                } else {
                    container.scrollLeft += scrollAmount
                }
            }

            lastTimestamp = timestamp
            animationFrameId = requestAnimationFrame(animateScroll)
        }

        animationFrameId = requestAnimationFrame(animateScroll)

        // Pause on hover
        const pause = () => setIsPaused(true)
        const resume = () => setIsPaused(false)

        container.addEventListener('mouseenter', pause)
        container.addEventListener('mouseleave', resume)
        container.addEventListener('touchstart', pause)
        container.addEventListener('touchend', resume)

        return () => {
            cancelAnimationFrame(animationFrameId)
            container.removeEventListener('mouseenter', pause)
            container.removeEventListener('mouseleave', resume)
            container.removeEventListener('touchstart', pause)
            container.removeEventListener('touchend', resume)
        }
    }, [isPaused])

    return (
        <section
            aria-label="Παροχές του καταστήματος"
            className="w-full py-6 dark:bg-slate-800 dark:border-slate-700"
        >
            <div className="container mx-auto px-4">
                {/* Desktop Layout - Grid - ΙΔΙΟ όπως πριν */}
                <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {features.map((feature, index) => (
                        <div
                            key={feature.id}
                            className="flex justify-center"
                        >
                            <SiteFeature
                                icon={getIcon(feature.iconType)}
                                aria-label={feature.ariaLabel}
                                header={feature.header}
                                content={feature.content}
                                isLast={index === features.length - 1}
                            />
                        </div>
                    ))}
                </div>

                {/* Mobile Layout - Auto-scrolling - ΙΔΙΟ όπως πριν */}
                <div
                    ref={scrollContainerRef}
                    className="md:hidden flex overflow-x-hidden pb-2 -mx-4 px-4 [scrollbar-width:none] [-ms-overflow-style:none]"
                >
                    <div className="flex space-x-4 min-w-max">
                        {features.map((feature, index) => (
                            <div
                                key={feature.id}
                                className="w-64 flex-shrink-0"
                            >
                                <SiteFeature
                                    icon={getIcon(feature.iconType)}
                                    aria-label={feature.ariaLabel}
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
                                key={`${feature.id}-dup`}
                                className="w-64 flex-shrink-0"
                            >
                                <SiteFeature
                                    icon={getIcon(feature.iconType)}
                                    aria-label={feature.ariaLabel}
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
})

SiteFeaturesClient.displayName = 'SiteFeaturesClient'

export default SiteFeaturesClient