// Server component: οι παροχές όπως ορίστηκαν στο block «Παροχές καταστήματος»
// της αρχικής (ίδιο fetch με την αρχική → δεν γίνεται δεύτερη κλήση).
// Σε client components χρησιμοποίησε απευθείας το <SiteFeatures /> (προεπιλογές).
import SiteFeatures from './siteFeatures'
import { getHomepageData, ISiteFeaturesBlock } from '@/lib/queries/homepage'

export default async function SiteFeaturesFromAdmin() {
    const data = await getHomepageData()
    const block = data.body.find(b => b.__component === 'blocks.site-features') as ISiteFeaturesBlock | undefined
    return <SiteFeatures items={block?.items} />
}
