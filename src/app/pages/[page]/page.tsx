// app/pages/[page]/page.tsx — σελίδες περιεχομένου (όροι, απόρρητο, landing pages)
// (2026-10-26) Markdown ή HTML από το admin (lib/helpers/contentHtml), ορατά breadcrumbs,
// «Τελευταία ενημέρωση», αναγνώσιμο πλάτος κειμένου, σωστή meta description.

import { Metadata } from 'next'
import {
  organizationStructuredData,
  storeStructuredData
} from '@/lib/helpers/structureData'
import { notFound } from 'next/navigation'
import { getPage } from '@/lib/queries/pagesQuery'
import BlockManager from '@/components/molecules/homepage/blockManager'
import Breadcrumb from '@/components/molecules/breadcrumb'
import type {
  BreadcrumbList,
  WebPage,
  WebSite
} from 'schema-dts'
import { jsonLd } from '@/lib/helpers/jsonLd'
import { contentHtml, contentText } from '@/lib/helpers/contentHtml'
import { getStrapiMedia } from '@/repositories/medias'

const BASE_URL = process.env.NEXT_URL || 'https://magnetmarket.gr'

type Props = {
  params: Promise<{ page: string }>
}

const fmtDate = (s?: string | null) =>
  s ? new Intl.DateTimeFormat('el-GR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Athens' }).format(new Date(s)) : ''

function generatePageStructuredData(title: string, slug: string, updatedAt?: string | null) {
  const websiteNode: WebSite = {
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    url: BASE_URL,
    name: 'Magnet Market',
    publisher: { '@id': `${BASE_URL}/#organization` },
  }

  const breadcrumbList: BreadcrumbList = {
    '@type': 'BreadcrumbList',
    '@id': `${BASE_URL}/pages/${slug}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Αρχική', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: title, item: `${BASE_URL}/pages/${slug}` },
    ],
  }

  const webPage: WebPage = {
    '@type': 'WebPage',
    '@id': `${BASE_URL}/pages/${slug}#webpage`,
    url: `${BASE_URL}/pages/${slug}`,
    name: title,
    isPartOf: { '@id': `${BASE_URL}/#website` },
    about: { '@id': `${BASE_URL}/#organization` },
    breadcrumb: { '@id': `${BASE_URL}/pages/${slug}#breadcrumb` },
    inLanguage: 'el-GR',
    ...(updatedAt ? { dateModified: updatedAt } : {}),
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [organizationStructuredData, storeStructuredData, websiteNode, breadcrumbList, webPage],
  }
}

export default async function CustomPage(props: Props) {
  const params = await props.params;
  const pageData = await getPage(params.page)
  if (!pageData) notFound()
  const structuredData = generatePageStructuredData(pageData.title, params.page, pageData.updatedAt)
  const html = contentHtml(pageData.content)
  const hasBlocks = (pageData.body?.length ?? 0) > 0

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }}
        suppressHydrationWarning
      />
      <div className="mx-4">
        <Breadcrumb breadcrumbs={[{ title: 'Home', slug: '/' }, { title: pageData.title, slug: `/pages/${params.page}` }]} />
      </div>
      {html ? (
        <article className="mx-4 py-8 sm:py-12 px-4 bg-slate-50 dark:bg-slate-700 rounded">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-bold text-2xl sm:text-3xl text-gray-900 dark:text-white mb-2">{pageData.title}</h1>
            {pageData.updatedAt && !hasBlocks && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Τελευταία ενημέρωση: {fmtDate(pageData.updatedAt)}</p>
            )}
            <div className="prose-content mt-6" dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </article>
      ) : (
        // Landing page μόνο με blocks: ο τίτλος για Google / αναγνώστες οθόνης
        <h1 className="sr-only">{pageData.title}</h1>
      )}
      {hasBlocks && (
        <div className="mx-4 mt-8">
          <BlockManager blocks={pageData.body} />
        </div>
      )}
    </>
  )
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const pageData = await getPage(params.page)
  if (!pageData) return { title: 'Η σελίδα δεν βρέθηκε | Magnet Market', robots: { index: false, follow: true } }

  // «Χωρίς ευρετηρίαση» ορίζεται από το admin (πεδίο noindex της σελίδας)
  const shouldIndex = !pageData.noindex

  const description = (pageData.seo?.metaDescription?.trim() || contentText(pageData.content, 160) || pageData.title).slice(0, 160)
  const title = pageData.seo?.metaTitle?.trim() || `${pageData.title} | Magnet Market`
  const url = `${BASE_URL}/pages/${params.page}`
  const image = pageData.seo?.metaImage?.url ? getStrapiMedia(pageData.seo.metaImage.url) : null

  return {
    title,
    description,
    robots: shouldIndex ? { index: true, follow: true } : { index: false, follow: true },
    alternates: { canonical: pageData.seo?.canonicalURL?.trim() || url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Magnet Market',
      type: 'website',
      locale: 'el_GR',
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  }
}
