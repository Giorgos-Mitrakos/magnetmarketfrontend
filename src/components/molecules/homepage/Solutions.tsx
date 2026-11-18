// «Λύσεις για το σπίτι σας»: πλακίδια ανά ανάγκη (Ασφάλεια, Φωτισμός, Ενέργεια…)
// που οδηγούν σε κατηγορία ή σελίδα. Server component — καθόλου JavaScript στον browser.
import Image from 'next/image'
import { TrackableLink } from '@/components/atoms/TrackableLink'
import { getStrapiMedia } from '@/repositories/medias'
import { ISolutionsBlock, TSolutionColor, TSolutionIcon } from '@/lib/queries/homepage'
import type { IconType } from 'react-icons'
import {
  MdHome, MdSecurity, MdVideocam, MdLightbulb, MdBolt, MdThermostat, MdKeyboardVoice, MdSensors,
  MdPower, MdWifi, MdWaterDrop, MdDoorFront, MdCleaningServices, MdYard, MdPets, MdChildFriendly,
} from 'react-icons/md'

const ICONS: Record<TSolutionIcon, IconType> = {
  home: MdHome,
  security: MdSecurity,
  camera: MdVideocam,
  lighting: MdLightbulb,
  energy: MdBolt,
  climate: MdThermostat,
  voice: MdKeyboardVoice,
  sensor: MdSensors,
  plug: MdPower,
  wifi: MdWifi,
  water: MdWaterDrop,
  door: MdDoorFront,
  robot: MdCleaningServices,
  garden: MdYard,
  pet: MdPets,
  baby: MdChildFriendly,
}

const COLORS: Record<TSolutionColor, string> = {
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  green: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  red: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  teal: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
  navy: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
  pink: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
}

export default function Solutions({ id, block }: { id: string; block: ISolutionsBlock }) {
  const items = block.items ?? []
  if (!items.length) return null

  return (
    <section id={id} aria-labelledby={`${id}-title`}>
      <div className="mb-5 text-center">
        <h2 id={`${id}-title`} className="text-2xl font-bold text-siteColors-purple dark:text-slate-200 md:text-3xl">
          {block.title}
        </h2>
        {block.subtitle && <p className="mx-auto mt-1 max-w-2xl text-gray-600 dark:text-gray-400">{block.subtitle}</p>}
      </div>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-6">
        {items.map((item, index) => {
          const Icon = ICONS[item.icon] ?? MdHome
          return (
            <li key={item.id}>
              <TrackableLink
                href={item.href}
                className="group flex h-full flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-siteColors-purple/40 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
                bannerId={`solution_${id}_${item.id}`}
                bannerName={item.title}
                bannerPosition={`homepage_${id}_${index}`}
                bannerType="solution"
              >
                {item.image ? (
                  <span className="relative h-16 w-16 overflow-hidden rounded-full">
                    <Image
                      src={getStrapiMedia(item.image.url)!}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </span>
                ) : (
                  <span className={`flex h-16 w-16 items-center justify-center rounded-full ${COLORS[item.color] ?? COLORS.purple}`}>
                    <Icon className="h-8 w-8" aria-hidden="true" />
                  </span>
                )}
                <span className="font-semibold text-slate-800 group-hover:text-siteColors-purple dark:text-slate-100">
                  {item.title}
                </span>
                {item.text && <span className="text-sm text-gray-600 dark:text-gray-400">{item.text}</span>}
              </TrackableLink>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
