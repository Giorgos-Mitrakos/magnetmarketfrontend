import React from 'react';
import { getAvailabilityInfo, getAvailabilityClasses, getAvailabilityTextClasses, ProductStatus } from '@/lib/helpers/availabilityHelper';

export interface ProductAvailabilityProps {
    status: ProductStatus;
    inventory?: number;
    isInHouse?: boolean;
    variant?: 'badge' | 'text';
    className?: string;
}

/**
 * Component που εμφανίζει το availability message
 * Χρησιμοποιείται τόσο στο ProductCard όσο και στο ProductPage
 */
export const ProductAvailability: React.FC<ProductAvailabilityProps> = ({
    status,
    inventory = 0,
    isInHouse = false,
    variant = 'badge',
    className = ''
}) => {
    const availabilityInfo = getAvailabilityInfo(status, inventory, isInHouse);

    if (variant === 'badge') {
        const badgeClasses = getAvailabilityClasses(availabilityInfo.color);
        return (
            <p
                className={`text-sm font-medium px-2 py-1 rounded-full ${badgeClasses} ${className}`}
                aria-label="Διαθεσιμότητα"
            >
                {availabilityInfo.message}
            </p>
        );
    }

    // variant === 'text'
    const textClasses = getAvailabilityTextClasses(availabilityInfo.color);
    return (
        <span className={`text-sm ${textClasses} ${className}`}>
            {availabilityInfo.message}
        </span>
    );
};

export default ProductAvailability;