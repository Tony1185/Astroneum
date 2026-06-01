/**
 * Subpath entry: `astroneum/datafeeds/polygon`
 *
 * The Polygon.io REST + WebSocket implementation lives here so consumers
 * who do not use Polygon are not forced to bundle it from the main entry.
 */
export { default as DefaultDatafeed } from '../../datafeed/DefaultDatafeed'
export { WebSocketDatafeed } from '../../datafeed/WebSocketDatafeed'
export type { WebSocketDatafeedOptions } from '../../datafeed/WebSocketDatafeed'
