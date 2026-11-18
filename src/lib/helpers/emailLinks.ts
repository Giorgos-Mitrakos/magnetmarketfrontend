// lib/helpers/emailLinks.ts
// Οι ενέργειες των συνδέσμων email (/email/[action]). Κοινό αρχείο για server
// και client — ΟΧΙ μέσα σε 'use client' αρχείο, γιατί η σελίδα (server) το διαβάζει.
export const EMAIL_LINK_ACTIONS = ['unsubscribe', 'newsletter-confirm', 'alert-cancel', 'alert-renew'] as const
export type EmailLinkAction = (typeof EMAIL_LINK_ACTIONS)[number]
