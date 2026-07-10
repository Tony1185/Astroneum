import Link from 'next/link'
import { notFound } from 'next/navigation'
import { folders, getFolderBySlug, getArticlesByFolder } from '../../_lib/data'

export function generateStaticParams() {
  return folders.map(f => ({ folder: f.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ folder: string }> }) {
  const { folder } = await params
  const f = getFolderBySlug(folder)
  return { title: f?.title ?? 'Folder' }
}

export default async function FolderPage({ params }: { params: Promise<{ folder: string }> }) {
  const { folder: folderSlug } = await params
  const folder = getFolderBySlug(folderSlug)
  if (!folder) notFound()
  const articleList = getArticlesByFolder(folder.slug)
  return (
    <div className="support-folder">
      <h1>{folder.title}</h1>
      <p className="folder-count">{articleList.length} articles</p>
      <ul className="article-list">
        {articleList.map(a => (
          <li key={a.slug}>
            <Link href={`/support/solutions/${a.slug}/`}>{a.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
