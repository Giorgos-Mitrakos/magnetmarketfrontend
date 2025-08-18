'use client'

import { useCheckout } from '@/context/checkout';
import { useEffect } from 'react'

export default function ClearCartItems() {
    const { dispatch } = useCheckout()
    useEffect(() => {
        dispatch({ type: 'CLEAR_LOCALESTORAGE' })
        // localStorage.removeItem('checkout')
    },[])

    return null
}