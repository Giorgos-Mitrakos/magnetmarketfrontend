/**
 * (2026-10-24) «Εγγύηση & service» στη σελίδα κατασκευαστή — από τον Product
 * Manager → Κατασκευαστές. Εμφανίζονται μόνο τα πεδία που έχουν συμπληρωθεί.
 */
import { FaShieldHalved, FaPhone, FaEnvelope, FaArrowUpRightFromSquare, FaScrewdriverWrench } from 'react-icons/fa6'

export interface BrandSupportInfo {
  warranty: string | null
  serviceName: string | null
  phone: string | null
  email: string | null
  serviceUrl: string | null
  officialUrl: string | null
  notes: string | null
}

const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`

export default function BrandSupport({ brandName, info }: { brandName: string; info: BrandSupportInfo }) {
  const link = 'inline-flex items-center gap-1.5 font-medium text-siteColors-blue hover:underline dark:text-siteColors-lightblue'
  return (
    <section aria-labelledby="brand-support-title" className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-700/40">
      <h2 id="brand-support-title" className="mb-2 flex items-center gap-2 text-base font-semibold text-slate-800 dark:text-slate-100">
        <FaShieldHalved className="text-emerald-600" aria-hidden /> Εγγύηση & service {brandName}
      </h2>
      <div className="flex flex-col gap-2 text-sm text-slate-700 dark:text-slate-200 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6">
        {info.warranty && <p className="font-medium">{info.warranty}</p>}
        {info.serviceName && (
          <p className="inline-flex items-center gap-1.5">
            <FaScrewdriverWrench className="text-slate-500" aria-hidden /> {info.serviceName}
          </p>
        )}
        {info.phone && (
          <a href={telHref(info.phone)} className={link}>
            <FaPhone aria-hidden /> {info.phone}
          </a>
        )}
        {info.email && (
          <a href={`mailto:${info.email}`} className={link}>
            <FaEnvelope aria-hidden /> {info.email}
          </a>
        )}
        {info.serviceUrl && (
          <a href={info.serviceUrl} target="_blank" rel="noopener noreferrer nofollow" className={link}>
            Υποστήριξη <FaArrowUpRightFromSquare className="h-3 w-3" aria-hidden />
          </a>
        )}
        {info.officialUrl && (
          <a href={info.officialUrl} target="_blank" rel="noopener noreferrer nofollow" className={link}>
            Επίσημο site <FaArrowUpRightFromSquare className="h-3 w-3" aria-hidden />
          </a>
        )}
      </div>
      {info.notes && <p className="mt-2 whitespace-pre-line text-sm text-slate-600 dark:text-slate-300">{info.notes}</p>}
    </section>
  )
}
