# Indicator Comparison: Astroneum vs TradingView Pro

**Last Updated:** June 15, 2026
**Astroneum Indicators:** 42 (+15 new)
**TradingView Pro Indicators:** 100+
**Coverage of comparison table:** 42/50 (84%)

---

## Comprehensive Comparison Table

| Category | Indicator Name | Abbreviation | Astroneum | TradingView Pro | Priority |
|----------|---|---|:---:|:---:|---|
| **Moving Averages** | Simple Moving Average | SMA | ✅ | ✅ | - |
| | Exponential Moving Average | EMA | ✅ | ✅ | - |
| | Double Exponential Moving Average | DEMA | ✅ | ✅ | Medium |
| | Triple Exponential Moving Average | TEMA | ✅ | ✅ | Medium |
| | Weighted Moving Average | WMA | ✅ | ✅ | Medium |
| | Volume Weighted Moving Average | VWMA | ✅ | ✅ | Medium |
| | Adaptive Moving Average | AMA | ❌ | ✅ | Low |
| | Hull Moving Average | HMA | ❌ | ✅ | Low |
| **Trend Indicators** | Moving Average Convergence Divergence | MACD | ✅ | ✅ | - |
| | Average Directional Index | ADX | ✅ | ✅ | High |
| | Directional Movement Index | DMI/DI | ✅ | ✅ | - |
| | Parabolic SAR | SAR | ✅ | ✅ | - |
| | TRIX (Triple Exponential Moving Avg) | TRIX | ✅ | ✅ | - |
| | Ichimoku Cloud | Ichimoku | ✅ | ✅ | Medium |
| | Keltner Channels | KC | ✅ | ✅ | Medium |
| **Momentum Indicators** | Relative Strength Index | RSI | ✅ | ✅ | - |
| | Stochastic Oscillator | KDJ/STOCH | ✅ | ✅ | - |
| | Commodity Channel Index | CCI | ✅ | ✅ | - |
| | Momentum | MTM | ✅ | ✅ | - |
| | Rate of Change | ROC | ✅ | ✅ | - |
| | Williams %R | %R | ✅ | ✅ | - |
| | Awesome Oscillator | AO | ✅ | ✅ | - |
| | MACD Histogram | MACD | ✅ | ✅ | - |
| **Volatility Indicators** | Bollinger Bands | BOLL | ✅ | ✅ | - |
| | Average True Range | ATR | ✅ | ✅ | High |
| | Historical Volatility | HV | ✅ | ✅ | Medium |
| | Donchian Channels | DC | ✅ | ✅ | Medium |
| | Standard Deviation | STDDEV | ❌ | ✅ | Medium |
| **Volume Indicators** | Volume | VOL | ✅ | ✅ | - |
| | On Balance Volume | OBV | ✅ | ✅ | - |
| | Price and Volume Trend | PVT | ✅ | ✅ | - |
| | Chaikin Money Flow | CMF | ✅ | ✅ | High |
| | Money Flow Index | MFI | ✅ | ✅ | High |
| | Volume Rate of Change | VROC | ❌ | ✅ | Medium |
| | Accumulation/Distribution | A/D | ✅ | ✅ | High |
| | Volume Ratio | VR | ✅ | ✅ | - |
| **Oscillators & Other** | Bollinger Bands | BOLL | ✅ | ✅ | - |
| | BRAR Indicator | BRAR | ✅ | ✅ | - |
| | Bull and Bear Index | BBI | ✅ | ✅ | - |
| | Psychological Line | PSY | ✅ | ✅ | - |
| | Bias Indicator | BIAS | ✅ | ✅ | - |
| | Average Price | AVP | ✅ | ✅ | - |
| | Current Ratio | CR | ✅ | ✅ | - |
| | Ease of Movement Value | EMV | ✅ | ✅ | - |
| | Difference of Moving Average | DMA | ✅ | ✅ | - |
| **Correlation & Distribution** | Correlation Coefficient | CORR | ❌ | ✅ | Low |
| | Linear Regression | LinReg | ❌ | ✅ | Low |
| **Market Profile** | VWAP (Volume Weighted Average Price) | VWAP | ✅ | ✅ | Medium |
| | Pivot Points | PP | ❌ | ✅ | Medium |
| **Advanced** | SuperTrend | ST | ✅ | ✅ | Medium |
| | ZigZag | ZZ | ❌ | ✅ | Low |

---

## Implementation Progress

All 5 **high-priority** indicators have been implemented (Phase 1 + Phase 2 CMF, MFI).
The remaining gaps are medium- and low-priority indicators.

### ✅ Completed (15 new indicators)

| # | Indicator | File | Phase |
|---|-----------|------|-------|
| 1 | **ATR** (Average True Range) | `averageTrueRange.ts` | Phase 1 |
| 2 | **ADX** (Average Directional Index) | `averageDirectionalIndex.ts` | Phase 1 |
| 3 | **A/D** (Accumulation/Distribution) | `accumulationDistribution.ts` | Phase 1 |
| 4 | **CMF** (Chaikin Money Flow) | `chaikinMoneyFlow.ts` | Phase 2 |
| 5 | **MFI** (Money Flow Index) | `moneyFlowIndex.ts` | Phase 2 |
| 6 | **VWAP** (Volume Weighted Average Price) | `volumeWeightedAveragePrice.ts` | Phase 2 |
| 7 | **Ichimoku Cloud** | `ichimokuCloud.ts` | Phase 2 |
| 8 | **DEMA** (Double Exponential MA) | `doubleExponentialMovingAverage.ts` | Phase 3 |
| 9 | **TEMA** (Triple Exponential MA) | `tripleExponentialMovingAverage.ts` | Phase 3 |
| 10 | **WMA** (Weighted Moving Average) | `weightedMovingAverage.ts` | Phase 3 |
| 11 | **VWMA** (Volume Weighted MA) | `volumeWeightedMovingAverage.ts` | Phase 3 |
| 12 | **HV** (Historical Volatility) | `historicalVolatility.ts` | Phase 3 |
| 13 | **DC** (Donchian Channels) | `donchianChannels.ts` | Phase 3 |
| 14 | **KC** (Keltner Channels) | `keltnerChannels.ts` | Phase 3 |
| 15 | **SuperTrend** | `superTrend.ts` | Phase 3 |

---

## Remaining Missing Indicators (8 left)

| Indicator | Priority | Notes |
|-----------|----------|-------|
| Standard Deviation (STDDEV) | Medium | Building block used by Bollinger Bands |
| Volume Rate of Change (VROC) | Medium | Volume momentum |
| Pivot Points (PP) | Medium | Support/resistance levels |
| Adaptive Moving Average (AMA) | Low | Kav |
| Hull Moving Average (HMA) | Low | Smoothing |
| Correlation Coefficient (CORR) | Low | Statistical |
| Linear Regression (LinReg) | Low | Statistical |
| ZigZag (ZZ) | Low | Pattern recognition |

---

## Progress Summary

**84% of the comparison table covered** (42 of 50 indicators).

| Category | Total | Done | Missing | Coverage |
|----------|:-----:|:----:|:-------:|:--------:|
| Moving Averages | 8 | 6 | 2 (AMA, HMA) | 75% |
| Trend Indicators | 7 | 7 | 0 | **100%** |
| Momentum Indicators | 8 | 8 | 0 | **100%** |
| Volatility Indicators | 5 | 4 | 1 (STDDEV) | 80% |
| Volume Indicators | 8 | 7 | 1 (VROC) | 88% |
| Oscillators & Other | 9 | 9 | 0 | **100%** |
| Correlation & Distribution | 2 | 0 | 2 (CORR, LinReg) | 0% |
| Market Profile | 2 | 1 | 1 (PP) | 50% |
| Advanced | 2 | 1 | 1 (ZZ) | 50% |
| **Total** | **50** | **42** | **8** | **84%** |

---

## Implementation Roadmap Update

### ✅ Phase 1 (Critical - MVP) — COMPLETE
- [x] ATR (Average True Range)
- [x] ADX (Average Directional Index)
- [x] Accumulation/Distribution (A/D)

### ✅ Phase 2 (Important - Competitive Feature) — COMPLETE
- [x] Chaikin Money Flow (CMF)
- [x] Money Flow Index (MFI)
- [x] VWAP
- [x] Ichimoku Cloud

### ✅ Phase 3 (Polish - Market Completeness) — COMPLETE
- [x] DEMA, TEMA, WMA, VWMA
- [x] Historical Volatility
- [x] Donchian Channels
- [x] Keltner Channels
- [x] SuperTrend

### ⬜ Phase 4 (Remaining - Niche Features)
- [ ] Standard Deviation (STDDEV)
- [ ] Volume Rate of Change (VROC)
- [ ] Pivot Points (PP)
- [ ] Correlation Coefficient (CORR)
- [ ] Linear Regression (LinReg)
- [ ] Adaptive Moving Average (AMA)
- [ ] Hull Moving Average (HMA)
- [ ] ZigZag (ZZ)

---

## Notes

- Astroneum now has **42 indicators** — up from 27, a **56% increase**
- All **high-priority** indicators from the original roadmap are now implemented
- **Trend** and **Momentum** categories are at 100% coverage
- The 8 remaining indicators are all **medium/low priority** niche features
- Many missing indicators can be built using existing building blocks (e.g., STDDEV is used internally by Bollinger Bands)
- TradingView Pro has 100+ indicators; Astroneum now covers the vast majority of commonly used ones

---

## Strategy Notes

**For TradingView Parity:**
- With 42 of the top ~50 most-used indicators implemented, Astroneum is now at strong competitive parity for technical analysis
- The 8 remaining indicators are niche features used by advanced traders

**Market Positioning:**
- Astroneum is now one of the most feature-complete open-source charting libraries
- All core technical analysis categories are covered: trend, momentum, volatility, volume, and moving averages

**Development Effort:**
- Phase 1-3 completed in a single development session
- Remaining 8 indicators: ~1-2 days for complete coverage
