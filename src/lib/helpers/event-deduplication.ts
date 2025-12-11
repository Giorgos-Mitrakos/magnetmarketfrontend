// lib/helpers/event-deduplication.ts

/**
 * Event Deduplication System
 * Prevents sending the same event multiple times within a time window
 */

const isDev = process.env.NODE_ENV === 'development';

interface EventKey {
  eventName: string;
  identifier: string; // e.g., product_id, cart_hash, etc.
}

class EventDeduplicator {
  private recentEvents: Map<string, number> = new Map();
  private readonly defaultWindow: number = 1000; // 1 second default

  /**
   * Generate a unique key for the event
   */
  private generateKey(eventName: string, identifier: string): string {
    return `${eventName}:${identifier}`;
  }

  /**
   * Check if event was recently sent
   */
  private wasRecentlySent(key: string, timeWindow: number): boolean {
    const lastSent = this.recentEvents.get(key);
    
    if (!lastSent) return false;
    
    const now = Date.now();
    const timeSinceLastSent = now - lastSent;
    
    return timeSinceLastSent < timeWindow;
  }

  /**
   * Mark event as sent
   */
  private markAsSent(key: string): void {
    this.recentEvents.set(key, Date.now());
    
    // Cleanup old entries after 10 seconds
    setTimeout(() => {
      this.recentEvents.delete(key);
    }, 10000);
  }

  /**
   * Check if event should be sent (not a duplicate)
   */
  shouldSendEvent(
    eventName: string, 
    identifier: string, 
    timeWindow: number = this.defaultWindow
  ): boolean {
    const key = this.generateKey(eventName, identifier);
    
    if (this.wasRecentlySent(key, timeWindow)) {
      if (isDev) console.warn(`[Analytics] ⚠️ Duplicate ${eventName} prevented for ${identifier}`);
      return false;
    }
    
    this.markAsSent(key);
    return true;
  }

  /**
   * Force clear a specific event (useful for testing)
   */
  clearEvent(eventName: string, identifier: string): void {
    const key = this.generateKey(eventName, identifier);
    this.recentEvents.delete(key);
  }

  /**
   * Clear all tracked events
   */
  clearAll(): void {
    this.recentEvents.clear();
  }
}

// Singleton instance
export const eventDeduplicator = new EventDeduplicator();

/**
 * Wrapper for sending events with deduplication
 */
export const sendDedupedEvent = (
  eventName: string,
  params: any,
  identifier: string,
  timeWindow?: number
): boolean => {
  // Check if we should send this event
  if (!eventDeduplicator.shouldSendEvent(eventName, identifier, timeWindow)) {
    return false;
  }

  // Send the event
  try {
    if (typeof window === 'undefined' || typeof window.gtag === 'undefined') {
      if (isDev) console.error('[Analytics] gtag not available');
      return false;
    }

    window.gtag('event', eventName, params);
    if (isDev) console.log(`[Analytics] ✅ Event sent: ${eventName}`, params);
    return true;
  } catch (error) {
    if (isDev) console.error('[Analytics] Error:', error);
    return false;
  }
};