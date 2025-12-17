'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { trackScrollDepth } from '@/lib/helpers/advanced-analytics'

export default function ScrollTracker() {
  const pathname = usePathname()
  const tracked = useRef(new Set<string>())

  const getPageType = (path: string): string => {
    if (path === '/') return 'homepage'
    if (path.startsWith('/product/')) return 'product_detail'
    if (path.startsWith('/category/')) return 'category_page'
    if (path.startsWith('/blog/')) return 'article'
    return 'other'
  }

  useEffect(() => {
    tracked.current.clear()
    const pageType = getPageType(pathname)
    const milestones = [25, 50, 75, 100] as const

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const m = Number(entry.target.getAttribute('data-milestone')) as 25 | 50 | 75 | 100
          const milestoneKey = `${pathname}-${m}`

          if (!tracked.current.has(milestoneKey)) {
            trackScrollDepth(m, pageType)
            tracked.current.add(milestoneKey)
            console.log(`🎯 [Scroll] ${m}% reached on ${pathname}`)
          }
        }
      })
    }, { threshold: 0.1 })

    // Δημιουργία των αόρατων "sentinels"
    const main = document.querySelector('main') || document.body
    if (main) {
      const sentinels: HTMLDivElement[] = []

      milestones.forEach((m) => {
        const el = document.createElement('div')
        el.setAttribute('data-milestone', m.toString())
        // Τοποθέτηση του sentinel στο σωστό ύψος
        Object.assign(el.style, {
          position: 'absolute',
          top: `${m}%`,
          left: '0',
          width: '1px',
          height: '1px',
          pointerEvents: 'none',
          visibility: 'hidden'
        })
        main.style.position = 'relative' // Σιγουρευόμαστε ότι το main είναι relative
        main.appendChild(el)
        observer.observe(el)
        sentinels.push(el)
      })


      return () => {
        observer.disconnect()
        sentinels.forEach(el => el.remove())
      }
    }
  }, [pathname])

  return null
}