'use client'

import { useEffect } from 'react'

export default function ClearCartItems() {
    useEffect(() => {
        localStorage.setItem("cartItems", JSON.stringify([]));
    }, [])

    return null
}