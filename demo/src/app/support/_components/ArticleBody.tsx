import { getArticleBody } from '../_lib/data'

export default function ArticleBody({ slug }: { slug: string }) {
  const article = getArticleBody(slug)
  if (!article) return <p>Article not found.</p>
  return <div className="article-body" dangerouslySetInnerHTML={{ __html: article.body }} />
}
