import Link from 'next/link'
import { category, folders } from '../../_lib/data'

export const metadata = {
  title: category.title,
  description: category.description,
}

export default function CategoryPage() {
  const total = folders.reduce((s, f) => s + f.articleCount, 0)
  return (
    <div className="support-category">
      <h1>{category.title}</h1>
      <p className="cat-desc">{total} articles across {folders.length} sub-categories</p>
      <div className="folder-grid">
        {folders.map(f => (
          <Link key={f.slug} href={`/support/folders/${f.slug}/`} className="folder-card">
            <h2>{f.title}</h2>
            <span className="count">{f.articleCount} articles</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
