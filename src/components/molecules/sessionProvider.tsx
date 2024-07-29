"use client"

import { SessionProvider } from "next-auth/react"
import { ReactNode } from "react"

interface Props {
    children: ReactNode,
    session: any
}

const SessionProviders = ({ children, session }: Props) => {
    return <SessionProvider session={session} >
        {children}
    </SessionProvider>
}

export default SessionProviders