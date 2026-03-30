// lib/helpers/deliveryHelper.ts

/**
 * Υπολογίζει την εκτιμώμενη ημερομηνία παράδοσης
 * @param orderDate - Ημερομηνία παραγγελίας (default: σήμερα)
 * @param businessDays - Αριθμός εργάσιμων ημερών (default: 3-5)
 * @returns Formatted date string "YYYY-MM-DD"
 */
export function calculateEstimatedDeliveryDate(
  orderDate: Date = new Date(),
  businessDays: number = 5
): string {
  const deliveryDate = new Date(orderDate);
  let daysAdded = 0;

  // Πρόσθεσε εργάσιμες μέρες (χωρίς Σαββατοκύριακα)
  while (daysAdded < businessDays) {
    deliveryDate.setDate(deliveryDate.getDate() + 1);
    
    const dayOfWeek = deliveryDate.getDay();
    // 0 = Κυριακή, 6 = Σάββατο
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      daysAdded++;
    }
  }

  // Format: "YYYY-MM-DD"
  return deliveryDate.toISOString().split('T')[0];
}

/**
 * Υπολογίζει delivery date range για εμφάνιση στον χρήστη
 * @returns { min: "YYYY-MM-DD", max: "YYYY-MM-DD" }
 */
export function calculateDeliveryDateRange(
  minDays: number = 3,
  maxDays: number = 5
): { min: string; max: string } {
  return {
    min: calculateEstimatedDeliveryDate(new Date(), minDays),
    max: calculateEstimatedDeliveryDate(new Date(), maxDays),
  };
}

/**
 * Μετατρέπει ημερομηνία σε human-readable format
 * @param dateString - "YYYY-MM-DD"
 * @returns "Δευτέρα, 15 Απριλίου 2024"
 */
export function formatDeliveryDate(dateString: string, locale: string = 'el-GR'): string {
  const date = new Date(dateString);
  
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}