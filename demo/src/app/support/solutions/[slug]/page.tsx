import { notFound } from 'next/navigation'
import { articles, getArticleMeta, getArticleBody } from '../../_lib/data'
import ArticleBody from '../../_components/ArticleBody'

export function generateStaticParams() {
  return articles.map(a => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = getArticleMeta(slug)
  return { title: article?.title ?? 'Article' }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = getArticleBody(slug)
  if (!article) notFound()
  return (
    <article className="support-article">
      <h1>{article.title}</h1>
      <span className="source-link">
        Source: <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer">TradingView Help Center</a>
      </span>
      <ArticleBody slug={slug} />
    </article>
  )
}
