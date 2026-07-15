import arrow from './arrow'
import circle from './circle'
import rect from './rect'
import parallelogram from './parallelogram'
import triangle from './triangle'
import fibonacciCircle from './fibonacciCircle'
import fibonacciSegment from './fibonacciSegment'
import fibonacciSpiral from './fibonacciSpiral'
import fibonacciSpeedResistanceFan from './fibonacciSpeedResistanceFan'
import fibonacciExtension from './fibonacciExtension'
import fibonacciChannel from './fibonacciChannel'
import fibonacciWedge from './fibonacciWedge'
import fibonacciTimeZones from './fibonacciTimeZones'
import fibonacciArcs from './fibonacciArcs'
import fibonacciFan from './fibonacciFan'
import gannBox from './gannBox'
import gannFan from './gannFan'
import pitchfork from './pitchfork'
import { threeWaves, fiveWaves, eightWaves, anyWaves } from './waves'
import abcd from './abcd'
import xabcd from './xabcd'
import measure from './measure'
import longPosition from './longPosition'
import shortPosition from './shortPosition'
import positionForecast from './positionForecast'
import barsPattern from './barsPattern'
import ghostFeed from './ghostFeed'
import sector from './sector'
import anchoredVwap from './anchoredVwap'
import fixedRangeVolumeProfile from './fixedRangeVolumeProfile'
import anchoredVolumeProfile from './anchoredVolumeProfile'
import priceRange from './priceRange'
import dateRange from './dateRange'
import dateAndPriceRange from './dateAndPriceRange'

export default [
  arrow,
  circle, rect, triangle, parallelogram,
  fibonacciCircle, fibonacciSegment, fibonacciSpiral,
  fibonacciSpeedResistanceFan, fibonacciExtension,
  fibonacciChannel, fibonacciWedge, fibonacciTimeZones, fibonacciArcs, fibonacciFan,
  gannBox, gannFan, pitchfork,
  threeWaves, fiveWaves, eightWaves, anyWaves, abcd, xabcd,
  measure,
  longPosition, shortPosition, positionForecast, barsPattern, ghostFeed, sector,
  anchoredVwap, fixedRangeVolumeProfile, anchoredVolumeProfile,
  priceRange, dateRange, dateAndPriceRange
]
