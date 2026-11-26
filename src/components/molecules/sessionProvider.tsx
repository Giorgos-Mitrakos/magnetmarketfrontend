"use client"

import type { Session } from "next-auth"
import { SessionProvider } from "next-auth/react"

interface Props {
    /** (2026-11-26) Προαιρετικό: χωρίς αυτό το SessionProvider ζητά το session από τον browser
     *  (/api/auth/session). ΜΗΝ περάσεις null — σημαίνει «αποσυνδεδεμένος». */
    session?: Session | null
    children: React.ReactNode,
}

export default function SessionProviders({ session, children }: Props) {
    return <SessionProvider session={session} >
        {children}
    </SessionProvider>
}

// export default SessionProviders