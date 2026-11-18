'use server'
import { cookies } from 'next/headers'

export async function saveCookies({ name, value }: { name: string, value: object }) {

    const cookieStore = await cookies()
    cookieStore.set({
        name: name,
        value: JSON.stringify(value),
        secure: true,
        expires: new Date(Date.now() + 60 * 60 * 24 * 30 * 1000),
        sameSite: 'lax',
        httpOnly: true,
        path: '/',
    })
}

export async function getCookies({ name }: { name: string }) {

    const cookieStore = await cookies()
    const cookie = cookieStore.get(name)
    return cookie
    // cookies().set(name, JSON.stringify(value), { secure: true })
}