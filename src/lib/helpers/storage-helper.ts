'use client';

import { ICheckoutState } from "../interfaces/shipping";


// Retrieves a value from local storage and parses it as JSON.
export function getLocalStorage(key: string, defaultValue: any) {

  // Get the value from local storage
  const stickyValue = localStorage.getItem(key);

  // Check if stickyValue is not null or undefined
  if (stickyValue !== null && stickyValue !== undefined) {
    try {
      return JSON.parse(stickyValue);
    } catch (error) {

      return defaultValue;
    }
  } else {
    return defaultValue;
  }
}

// Stores a value in local storage after serializing it to JSON.
export function setLocalStorage(key: string, value: any) {
  localStorage.setItem(key, JSON.stringify(value));
}

const CHECKOUT_KEY = 'checkout';

export const saveCheckoutToLocalStorage = (cart: ICheckoutState | null) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CHECKOUT_KEY, JSON.stringify(cart));
  }
};

export const loadCheckoutFromLocalStorage = (): ICheckoutState | null => {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(CHECKOUT_KEY);
    return data ? JSON.parse(data) : null;
  }
  return null;
};