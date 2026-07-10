'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { category, getFolderBySlug, getArticleMeta } from '../_lib/data'

export default function Breadcrumb() {
  const path = usePathname().replace(/\/$/, '')
  const parts = path.split('/').filter(Boolean)

  if (parts.length < 2 || parts[0] !== 'support') return null

  const crumbs: { label: string; href?: string }[] = [
    { label: category.title, href: `/support/categories/${category.slug}/` },
  ]

  if (parts[1] === 'folders' && parts[2]) {
    const folder = getFolderBySlug(parts[2])
    crumbs.push({ label: folder?.title ?? parts[2] })
  } else if (parts[1] === 'solutions' && parts[2]) {
    const article = getArticleMeta(parts[2])
    if (article) {
      const folder = getFolderBySlug(article.folderSlug)
      if (folder) {
        crumbs.push({ label: folder.title, href: `/support/folders/${folder.slug}/` })
      }
      crumbs.push({ label: article.title })
    }
  }

  return (
    <nav className="support-breadcrumb" aria-label="Breadcrumb">
      {crumbs.map((c, i) => (
        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {c.href ? <Link href={c.href}>{c.label}</Link> : <span className="current">{c.label}</span>}
          {i < crumbs.length - 1 && <span className="sep">/</span>}
        </span>
      ))}
    </nav>
  )
}
