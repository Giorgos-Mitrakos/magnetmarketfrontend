'use client'
// (2026-10-26) «Αλλαγή κωδικού» στο «Το προφίλ μου»
import { useState } from "react"
import { AiOutlineLock } from "react-icons/ai"

const inputCls =
    "w-full p-3 border-2 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-siteColors-purple focus:border-siteColors-purple"

export default function ChangePassword() {
    const [open, setOpen] = useState(false)
    const [currentPassword, setCurrent] = useState('')
    const [password, setPassword] = useState('')
    const [passwordConfirmation, setConfirm] = useState('')
    const [busy, setBusy] = useState(false)
    const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        setMsg(null)
        if (password !== passwordConfirmation) {
            setMsg({ ok: false, text: 'Ο νέος κωδικός και η επιβεβαίωση δεν ταιριάζουν.' })
            return
        }
        setBusy(true)
        try {
            const res = await fetch('/api/account/password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, password, passwordConfirmation }),
            })
            const json = await res.json().catch(() => null)
            if (!res.ok) throw new Error(json?.message || 'Ο κωδικός δεν άλλαξε. Δοκιμάστε ξανά.')
            setCurrent('')
            setPassword('')
            setConfirm('')
            setMsg({ ok: true, text: 'Ο κωδικός άλλαξε. Την επόμενη φορά συνδεθείτε με τον νέο κωδικό.' })
        } catch (err) {
            setMsg({ ok: false, text: err instanceof Error ? err.message : 'Ο κωδικός δεν άλλαξε. Δοκιμάστε ξανά.' })
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="rounded-2xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8 bg-white dark:bg-gray-800">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <AiOutlineLock className="text-2xl text-siteColors-purple" />
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Κωδικός πρόσβασης</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Αλλάξτε τον κωδικό με τον οποίο συνδέεστε.</p>
                    </div>
                </div>
                {!open && (
                    <button type="button" onClick={() => setOpen(true)}
                        className="px-4 py-2 rounded-lg border-2 border-siteColors-purple text-siteColors-purple font-semibold hover:bg-siteColors-purple hover:text-white transition-colors">
                        Αλλαγή κωδικού
                    </button>
                )}
            </div>

            {open && (
                <form onSubmit={submit} className="mt-6 grid gap-4 max-w-md">
                    <div>
                        <label htmlFor="currentPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Τωρινός κωδικός</label>
                        <input id="currentPassword" type="password" autoComplete="current-password" required
                            value={currentPassword} onChange={(e) => setCurrent(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Νέος κωδικός</label>
                        <input id="newPassword" type="password" autoComplete="new-password" required minLength={8}
                            value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Τουλάχιστον 8 χαρακτήρες, με κεφαλαίο, μικρό, αριθμό και σύμβολο.</p>
                    </div>
                    <div>
                        <label htmlFor="newPasswordConfirmation" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Επιβεβαίωση νέου κωδικού</label>
                        <input id="newPasswordConfirmation" type="password" autoComplete="new-password" required
                            value={passwordConfirmation} onChange={(e) => setConfirm(e.target.value)} className={inputCls} />
                    </div>
                    {msg && (
                        <p role="status" className={`text-sm font-medium ${msg.ok ? 'text-green-700 dark:text-green-300' : 'text-red-600 dark:text-red-400'}`}>
                            {msg.text}
                        </p>
                    )}
                    <div className="flex gap-3">
                        <button type="submit" disabled={busy}
                            className="px-5 py-2.5 rounded-lg bg-siteColors-purple text-white font-semibold disabled:opacity-60">
                            {busy ? 'Αλλαγή…' : 'Αποθήκευση κωδικού'}
                        </button>
                        <button type="button" onClick={() => { setOpen(false); setMsg(null) }}
                            className="px-5 py-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                            Άκυρο
                        </button>
                    </div>
                </form>
            )}
        </div>
    )
}
