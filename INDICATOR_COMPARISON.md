# Indicator Comparison: Astroneum vs TradingView Pro

**Last Updated:** June 15, 2026  
**Astroneum Indicators:** 27  
**TradingView Pro Indicators:** 100+  

## Summary

This document compares the technical indicators available in Astroneum with those in TradingView Pro to help plan future implementations and feature parity improvements.

---

## Comprehensive Comparison Table

| Category | Indicator Name | Abbreviation | Astroneum | TradingView Pro | Priority |
|----------|---|---|:---:|:---:|---|
| **Moving Averages** | Simple Moving Average | SMA | ✅ | ✅ | - |
| | Exponential Moving Average | EMA | ✅ | ✅ | - |
| | Double Exponential Moving Average | DEMA | ❌ | ✅ | Medium |
| | Triple Exponential Moving Average | TEMA | ❌ | ✅ | Medium |
| | Weighted Moving Average | WMA | ❌ | ✅ | Medium |
| | Volume Weighted Moving Average | VWMA | ❌ | ✅ | Medium |
| | Adaptive Moving Average | AMA | ❌ | ✅ | Low |
| | Hull Moving Average | HMA | ❌ | ✅ | Low |
| **Trend Indicators** | Moving Average Convergence Divergence | MACD | ✅ | ✅ | - |
| | Average Directional Index | ADX | ❌ | ✅ | High |
| | Directional Movement Index | DMI/DI | ✅ | ✅ | - |
| | Parabolic SAR | SAR | ✅ | ✅ | - |
| | TRIX (Triple Exponential Moving Avg) | TRIX | ✅ | ✅ | - |
| | Ichimoku Cloud | Ichimoku | ❌ | ✅ | Medium |
| | Keltner Channels | KC | ❌ | ✅ | Medium |
| **Momentum Indicators** | Relative Strength Index | RSI | ✅ | ✅ | - |
| | Stochastic Oscillator | KDJ/STOCH | ✅ | ✅ | - |
| | Commodity Channel Index | CCI | ✅ | ✅ | - |
| | Momentum | MTM | ✅ | ✅ | - |
| | Rate of Change | ROC | ✅ | ✅ | - |
| | Williams %R | %R | ✅ | ✅ | - |
| | Awesome Oscillator | AO | ✅ | ✅ | - |
| | MACD Histogram | MACD | ✅ | ✅ | - |
| **Volatility Indicators** | Bollinger Bands | BOLL | ✅ | ✅ | - |
| | Average True Range | ATR | ❌ | ✅ | High |
| | Historical Volatility | HV | ❌ | ✅ | Medium |
| | Donchian Channels | DC | ❌ | ✅ | Medium |
| | Standard Deviation | STDDEV | ❌ | ✅ | Medium |
| **Volume Indicators** | Volume | VOL | ✅ | ✅ | - |
| | On Balance Volume | OBV | ✅ | ✅ | - |
| | Price and Volume Trend | PVT | ✅ | ✅ | - |
| | Chaikin Money Flow | CMF | ❌ | ✅ | High |
| | Money Flow Index | MFI | ❌ | ✅ | High |
| | Volume Rate of Change | VROC | ❌ | ✅ | Medium |
| | Accumulation/Distribution | A/D | ❌ | ✅ | High |
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
| **Market Profile** | VWAP (Volume Weighted Average Price) | VWAP | ❌ | ✅ | Medium |
| | Pivot Points | PP | ❌ | ✅ | Medium |
| **Advanced** | SuperTrend | ST | ❌ | ✅ | Medium |
| | ZigZag | ZZ | ❌ | ✅ | Low |

---

## Missing High-Priority Indicators

These are indicators that are available in TradingView Pro and frequently used by traders. **Recommended for implementation:**

### 1. **Average True Range (ATR)** - Volatility
- Measures market volatility
- Used for position sizing and stop loss placement
- Commonly used with SAR

### 2. **Average Directional Index (ADX)** - Trend Strength
- Measures trend strength (not direction)
- Often used alongside DMI
- Popular for trend-following strategies

### 3. **Accumulation/Distribution (A/D)** - Volume Analysis
- Combines price and volume to measure cumulative flow
- Divergence signals can indicate reversals

### 4. **Chaikin Money Flow (CMF)** - Volume
- Money flow indicator based on close location within range
- Better at detecting buying/selling pressure than OBV

### 5. **Money Flow Index (MFI)** - Volume Momentum
- Volume-weighted RSI
- Identifies overbought/oversold conditions with volume confirmation

---

## Medium-Priority Indicators

**Good to have for technical completeness:**

- DEMA, TEMA, WMA (Additional Moving Averages)
- Historical Volatility (Volatility Analysis)
- Ichimoku Cloud (Comprehensive Trend System)
- Keltner Channels (Bollinger Bands Alternative)
- Donchian Channels (Support/Resistance)
- VWAP (Intraday Trading)
- Pivot Points (Support/Resistance Levels)
- SuperTrend (Combined Trend + Volatility)
- Volume Rate of Change (Volume Momentum)

---

## Low-Priority Indicators

**Nice to have for advanced traders:**

- DEMA, TEMA, WMA variants
- Correlation Coefficient
- Linear Regression
- Adaptive Moving Average (AMA)
- Hull Moving Average (HMA)
- ZigZag (Pattern Recognition)

---

## Implementation Roadmap Suggestion

### Phase 1 (Critical - MVP)
- [ ] ATR (Average True Range)
- [ ] ADX (Average Directional Index)
- [ ] Accumulation/Distribution (A/D)

### Phase 2 (Important - Competitive Feature)
- [ ] Chaikin Money Flow (CMF)
- [ ] Money Flow Index (MFI)
- [ ] VWAP
- [ ] Ichimoku Cloud

### Phase 3 (Polish - Market Completeness)
- [ ] DEMA, TEMA, WMA, VWMA
- [ ] Historical Volatility
- [ ] Donchian Channels
- [ ] Keltner Channels
- [ ] SuperTrend

### Phase 4 (Advanced - Niche Features)
- [ ] Volume Rate of Change
- [ ] Pivot Points
- [ ] Correlation Coefficient
- [ ] Linear Regression
- [ ] ZigZag

---

## Notes

- Astroneum currently has **27 indicators** covering core technical analysis needs
- The project has strong coverage of **momentum, trend, and basic volume indicators**
- Key gaps are in **volatility analysis** (missing ATR) and **money flow analysis** (missing CMF, MFI)
- TradingView Pro has 100+ indicators; focusing on the top 10-15 missing would provide feature parity for most traders
- Many missing indicators can be built using existing building blocks (e.g., ATR can extend from existing volatility calculations)

---

## Strategy Notes

**For TradingView Parity:**
- Focus on the 5 high-priority indicators first (ATR, ADX, A/D, CMF, MFI)
- These will cover ~80% of trader needs for technical analysis

**Market Positioning:**
- Astroneum is already feature-rich compared to many charting libraries
- Adding the high-priority indicators would put it at competitive feature parity with TradingView for technical analysis

**Development Effort:**
- High-priority indicators: ~1-2 weeks (depending on testing and documentation)
- Full medium-priority set: ~4-6 weeks
- Complete coverage of all indicators: ~8-10 weeks
