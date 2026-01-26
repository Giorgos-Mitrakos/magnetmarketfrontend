/**
 * Υπολογίζει το availability message με βάση το status του προϊόντος
 * Συμβαδίζει με τη λογική του backend (BestPrice XML generation)
 */
export type ProductStatus =
    | 'InStock'
    | 'MediumStock'
    | 'LowStock'
    | 'Backorder'
    | 'IsExpected'
    | 'AskForPrice'
    | 'OutOfStock'
    | 'Discontinued';

export interface AvailabilityInfo {
    message: string;
    color: 'green' | 'blue' | 'amber' | 'orange' | 'red' | 'gray';
    isAvailable: boolean;
}

/**
 * Παίρνει το availability message και το χρώμα με βάση το status
 */
export function getAvailabilityInfo(
    status: ProductStatus,
    inventory: number = 0,
    isInHouse: boolean = false
): AvailabilityInfo {

    // 1. InStock με inventory > 0 και in_house
    if (inventory > 0 && isInHouse) {
        return {
            message: 'Άμεσα διαθέσιμο',
            color: 'green',
            isAvailable: true
        };
    }

    // 2. InStock χωρίς inventory ή χωρίς in_house
    if (status === 'InStock') {
        return {
            message: 'Παράδοση σε 1-3 ημέρες',
            color: 'blue',
            isAvailable: true
        };
    }

    // 3. MediumStock
    if (status === 'MediumStock') {
        return {
            message: 'Παράδοση σε 1-3 ημέρες',
            color: 'blue',
            isAvailable: true
        };
    }

    // 4. LowStock
    if (status === 'LowStock') {
        return {
            message: 'Παράδοση σε 1-3 ημέρες',
            color: 'blue',
            isAvailable: true
        };
    }

    // 5. Backorder
    if (status === 'Backorder') {
        return {
            message: 'Κατόπιν Παραγγελίας',
            color: 'orange',
            isAvailable: true
        };
    }

    // 6. IsExpected
    if (status === 'IsExpected') {
        return {
            message: 'Αναμένεται',
            color: 'amber',
            isAvailable: true
        };
    }

    // 7. AskForPrice
    if (status === 'AskForPrice') {
        return {
            message: 'Ζητήστε τιμή',
            color: 'gray',
            isAvailable: false
        };
    }

    // 8. OutOfStock
    if (status === 'OutOfStock') {
        return {
            message: 'Εξαντλήθηκε',
            color: 'red',
            isAvailable: false
        };
    }

    // 9. Discontinued
    if (status === 'Discontinued') {
        return {
            message: 'Μη διαθέσιμο',
            color: 'gray',
            isAvailable: false
        };
    }

    // Default fallback
    return {
        message: 'Παράδοση σε 1-3 ημέρες',
        color: 'blue',
        isAvailable: true
    };
}

/**
 * Επιστρέφει τις κατάλληλες Tailwind classes για το availability badge
 */
export function getAvailabilityClasses(color: AvailabilityInfo['color']): string {
    const colorMap = {
        green: 'text-green-800 dark:text-green-300 bg-green-100 dark:bg-green-900/30',
        blue: 'text-blue-800 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30',
        amber: 'text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30',
        orange: 'text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-900/30',
        red: 'text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30',
        gray: 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900/30'
    };

    return colorMap[color];
}

/**
 * Επιστρέφει τις κατάλληλες text classes για inline text (χωρίς background)
 */
export function getAvailabilityTextClasses(color: AvailabilityInfo['color']): string {
    const colorMap = {
        green: 'text-green-600 dark:text-green-400',
        blue: 'text-blue-600 dark:text-blue-400',
        amber: 'text-amber-600 dark:text-amber-400',
        orange: 'text-orange-600 dark:text-orange-400',
        red: 'text-red-600 dark:text-red-400',
        gray: 'text-gray-600 dark:text-gray-400'
    };

    return colorMap[color];
}