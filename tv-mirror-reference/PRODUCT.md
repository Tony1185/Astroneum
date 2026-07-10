# Product

## Register

product

## Users

Developers and coding agents rebuilding a faithful TradingView-style chart workspace. They need a trustworthy model of layout, necessary controls, nested surfaces, and state transitions without reverse-engineering every DOM snapshot.

## Product Purpose

Provide an implementation-ready reference for the chart interface at `tradingview.com/chart`. Success means an implementer can reproduce the primary chart workflows, responsive structure, popup and split-view behavior, and interaction states while clearly distinguishing observed behavior from inference.

## Brand Personality

Precise, dense, dependable.

The interface should feel familiar to active chart users: fast, information-rich, restrained, and optimized for repeated expert workflows.

## Anti-references

- Decorative trading dashboards that prioritize visual effects over chart legibility.
- Oversized cards, excessive whitespace, or mobile-first simplification on a professional desktop workspace.
- Unlabelled icon collections with inconsistent interaction rules.
- A superficial clone that copies pixels but omits keyboard, focus, loading, empty, and error states.

## Design Principles

1. The chart remains the primary surface; surrounding UI should support it without competing with it.
2. Preserve expert speed through stable placement, shortcuts, and compact controls.
3. Model one logical control across responsive variants and state changes.
4. Treat every popup, curtain, and split view as part of a coherent layering system.
5. Record uncertainty explicitly rather than inventing behavior.

## Accessibility & Inclusion

Document observed TradingView behavior faithfully, then specify WCAG 2.2 AA improvements separately. Required improvements include visible focus, complete accessible names and states, keyboard-operable menus/dialogs, non-color state cues, reduced motion, and accessible chart summaries where practical.
