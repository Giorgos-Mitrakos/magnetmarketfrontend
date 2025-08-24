// components/CheckoutProgress.jsx
"use client";

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const CheckoutProgress = ({ currentStep }: { currentStep?: number }) => {
    const pathname = usePathname();
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Προσδιορισμός του τρέχοντος βήματος βάσει της τρέχουσας διαδρομής
    const determineCurrentStep = () => {
        if (currentStep !== undefined) return currentStep;

        if (pathname.includes('customer-informations')) return 1;
        if (pathname.includes('order-informations')) return 2;
        if (pathname.includes('order-summary')) return 3;
        return 1;
    };

    const activeStep = determineCurrentStep();

    const steps = [
        { number: 1, title: 'Στοιχεία', subtitle: 'Παράδοσης', path: '/checkout/customer-informations' },
        { number: 2, title: 'Αποστολή &', subtitle: 'Πληρωμή', path: '/checkout/order-informations' },
        { number: 3, title: 'Σύνοψη &', subtitle: 'Ολοκλήρωση', path: '/checkout/order-summary' },
    ];

    // Συνάρτηση για πλοήγηση στα βήματα (μόνο για προηγούμενα βήματα)
    const handleStepClick = (stepNumber: number, path: string) => {
        if (stepNumber < activeStep) {
            router.push(path);
        }
    };

    if (!isMounted) {
        return (
            <div className="mb-6 md:mb-8 text-center">
                <h1 className="text-2xl md:text-3xl font-bold text-siteColors-purple dark:text-white">Ολοκλήρωση Παραγγελίας</h1>
                <div className="mt-3 md:mt-4">
                    <div className="flex justify-center space-x-2 md:space-x-4">
                        {[1, 2, 3].map((num) => (
                            <div key={num} className="flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-6 md:mb-8 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-siteColors-purple dark:text-white">Ολοκλήρωση Παραγγελίας</h1>
            
            {/* Προοδοδείκτης για κινητά */}
            <div className="mt-3 md:mt-4 block md:hidden">
                <div className="flex justify-between items-start px-2">
                    {steps.map((step, index) => (
                        <div 
                            key={step.number} 
                            className={`flex flex-col items-center w-1/3 ${step.number < activeStep ? 'cursor-pointer' : 'cursor-default'}`}
                            onClick={() => handleStepClick(step.number, step.path)}
                        >
                            <div className="flex flex-col items-center">
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step.number <= activeStep
                                    ? 'bg-siteColors-purple dark:bg-siteColors-lightblue text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-300'}`}>
                                    {step.number <= activeStep ? (
                                        <span className="font-semibold">{step.number}</span>
                                    ) : (
                                        <span className="text-gray-300">{step.number}</span>
                                    )}
                                </div>
                                
                                <div className="mt-2 text-center">
                                    <div className={`text-xs font-medium ${step.number <= activeStep
                                        ? 'text-siteColors-purple dark:text-siteColors-lightblue'
                                        : 'text-gray-300'}`}>
                                        {step.title}
                                    </div>
                                    <div className={`text-xs ${step.number <= activeStep
                                        ? 'text-siteColors-purple dark:text-siteColors-lightblue'
                                        : 'text-gray-300'}`}>
                                        {step.subtitle}
                                    </div>
                                </div>
                            </div>
                            
                            {index < steps.length - 1 && (
                                <div className={`flex-1 h-1 mx-1 mt-5 ${step.number < activeStep ? 'bg-siteColors-purple dark:bg-siteColors-lightblue' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                            )}
                        </div>
                    ))}
                </div>
                
                <div className="mt-4 text-sm font-medium text-siteColors-purple dark:text-siteColors-lightblue">
                    Βήμα {activeStep} από {steps.length}: {steps[activeStep-1].title} {steps[activeStep-1].subtitle}
                </div>
            </div>
            
            {/* Προοδοδείκτης για desktop */}
            <div className="hidden md:flex items-center justify-center mt-4 text-sm text-gray-600 dark:text-gray-300">
                {steps.map((step, index) => (
                    <div key={step.number} className="flex items-center">
                        <div 
                            className={`flex items-center ${step.number <= activeStep
                                ? 'text-siteColors-purple dark:text-siteColors-lightblue font-semibold'
                                : 'text-gray-400 dark:text-gray-300'} ${step.number < activeStep ? 'cursor-pointer' : 'cursor-default'}`}
                            onClick={() => handleStepClick(step.number, step.path)}
                        >
                            <span
                                className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${step.number <= activeStep
                                    ? 'bg-siteColors-purple dark:bg-siteColors-lightblue text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-300'}`}
                            >
                                {step.number}
                            </span>
                            <span className="whitespace-nowrap">
                                {step.title} {step.subtitle}
                            </span>
                        </div>
                        {index < steps.length - 1 && (
                            <span className="mx-4 text-gray-300">›</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CheckoutProgress;