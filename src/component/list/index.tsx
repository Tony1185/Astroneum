import { Children, Fragment, type ReactNode } from 'react'

import { resolveCompatKey, type ParentComponent, type ParentProps, type JSX } from '@/react-shared'

import Loading from '../loading'
import Empty from '../empty'

export interface ListProps<T = unknown> extends ParentProps {
  className?: string
  style?: JSX.CSSProperties | string
  loading?: boolean
  dataSource?: T[]
  renderItem?: (data: T, index: number) => JSX.Element
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const List: ParentComponent<ListProps<any>> = props => {
  const hasChildren = Boolean(props.children)
  const children: ReactNode[] = []

  if (props.loading) {
    children.push(<Fragment key="list-loading"><Loading/></Fragment>)
  }

  if (!props.loading && !hasChildren && !props.dataSource?.length) {
    children.push(<Fragment key="list-empty"><Empty/></Fragment>)
  }

  if (hasChildren) {
    children.push(...Children.toArray(props.children))
  }

  if (!hasChildren) {
    props.dataSource?.forEach((data, index) => {
      const key = resolveCompatKey(data, index)
      const rendered = props.renderItem?.(data, index)
      if (rendered !== undefined && rendered !== null) {
        children.push(<Fragment key={key}>{rendered}</Fragment>)
        return
      }
      children.push(<li key={key}>{`${data ?? ''}`}</li>)
    })
  }

  return (
    <ul
      style={props.style}
      className={`astroneum-list ${props.className ?? ''}`}>
      {children}
    </ul>
  )
}

export default List
