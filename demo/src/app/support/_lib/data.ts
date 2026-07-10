import articlesDataRaw from './articles-data.json'

const articlesData: Record<string, { title: string; folder: string; sourceUrl: string; body: string }> = articlesDataRaw as Record<string, { title: string; folder: string; sourceUrl: string; body: string }>

export interface Folder {
  slug: string
  title: string
  articleCount: number
  sourceUrl: string
}

export interface ArticleMeta {
  slug: string
  title: string
  folderSlug: string
  sourceUrl: string
}

export const category = {
  slug: 'alerts',
  title: 'Alerts',
  description: 'TradingView alerts help center — mirrored from tradingview.com/support/categories/alerts/',
  sourceUrl: 'https://www.tradingview.com/support/categories/alerts/',
}

export const folders: Folder[] = [
  {
    "slug": "43000547663-alerts-settings",
    "title": "Alerts settings",
    "articleCount": 34,
    "sourceUrl": "https://www.tradingview.com/support/folders/43000547663-alerts-settings/"
  },
  {
    "slug": "43000547712-alerts-notifications",
    "title": "Alerts notifications",
    "articleCount": 6,
    "sourceUrl": "https://www.tradingview.com/support/folders/43000547712-alerts-notifications/"
  },
  {
    "slug": "43000560150-webhooks-usage",
    "title": "Webhooks usage",
    "articleCount": 8,
    "sourceUrl": "https://www.tradingview.com/support/folders/43000560150-webhooks-usage/"
  },
  {
    "slug": "43000548797-alerts-are-being-triggered-incorrectly-not-being-triggered",
    "title": "Alerts are being triggered incorrectly/not being triggered",
    "articleCount": 12,
    "sourceUrl": "https://www.tradingview.com/support/folders/43000548797-alerts-are-being-triggered-incorrectly-not-being-triggered/"
  }
]

export const articles: ArticleMeta[] = [
  {
    "slug": "43000520149-introduction-to-tradingview-alerts",
    "title": "Introduction to TradingView alerts",
    "folderSlug": "43000547663-alerts-settings",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000520149-introduction-to-tradingview-alerts/"
  },
  {
    "slug": "43000763313-how-to-use-price-alerts",
    "title": "How to use price alerts",
    "folderSlug": "43000547663-alerts-settings",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000763313-how-to-use-price-alerts/"
  },
  {
    "slug": "43000763315-getting-started-with-technical-alerts",
    "title": "Getting started with technical alerts",
    "folderSlug": "43000547663-alerts-settings",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000763315-getting-started-with-technical-alerts/"
  },
  {
    "slug": "43000739708-watchlist-alerts-your-trading-edge",
    "title": "Watchlist alerts: your trading edge",
    "folderSlug": "43000547663-alerts-settings",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000739708-watchlist-alerts-your-trading-edge/"
  },
  {
    "slug": "43000761492-multi-condition-alerts",
    "title": "Multi-condition alerts",
    "folderSlug": "43000547663-alerts-settings",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000761492-multi-condition-alerts/"
  },
  {
    "slug": "43000763312-learn-how-to-configure-alerts",
    "title": "Learn how to configure alerts",
    "folderSlug": "43000547663-alerts-settings",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000763312-learn-how-to-configure-alerts/"
  },
  {
    "slug": "43000595315-how-to-set-up-alerts",
    "title": "How to set up alerts",
    "folderSlug": "43000547663-alerts-settings",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000595315-how-to-set-up-alerts/"
  },
  {
    "slug": "43000595311-manage-alerts",
    "title": "Manage alerts",
    "folderSlug": "43000547663-alerts-settings",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000595311-manage-alerts/"
  },
  {
    "slug": "43000474415-differences-between-alert-frequencies",
    "title": "Differences between alert frequencies",
    "folderSlug": "43000547663-alerts-settings",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000474415-differences-between-alert-frequencies/"
  },
  {
    "slug": "43000481368-strategy-alerts",
    "title": "Strategy Alerts",
    "folderSlug": "43000547663-alerts-settings",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000481368-strategy-alerts/"
  },
  {
    "slug": "43000478392-i-m-unable-to-find-an-alert-condition-function-that-meets-my-needs",
    "title": "I'm unable to find an alert condition function that meets my needs",
    "folderSlug": "43000547663-alerts-settings",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000478392-i-m-unable-to-find-an-alert-condition-function-that-meets-my-needs/"
  },
  {
    "slug": "43000531021-how-to-use-a-variable-value-in-alert",
    "title": "How to use a variable value in alert",
    "folderSlug": "43000547663-alerts-settings",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000531021-how-to-use-a-variable-value-in-alert/"
  },
  {
    "slug": "43000542963-why-the-close-variable-value-in-an-alert-description-may-not-work",
    "title": "Why the {{close}} variable value in an alert description may not work",
    "folderSlug": "43000547663-alerts-settings",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000542963-why-the-close-variable-value-in-an-alert-description-may-not-work/"
  },
  {
    "slug": "43000597494-alerts-on-alert-function",
    "title": "Alerts on alert() function",
    "folderSlug": "43000547663-alerts-settings",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000597494-alerts-on-alert-function/"
  },
  {
    "slug": "43000653371-i-cannot-create-new-alerts-even-though-i-have-not-exceeded-the-alert-limit-of-my-subscription",
    "title": "I cannot create new alerts even though I have not exceeded the alert limit of my subscription",
    "folderSlug": "43000547663-alerts-settings",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000653371-i-cannot-create-new-alerts-even-though-i-have-not-exceeded-the-alert-limit-of-my-subscription/"
  },
  {
    "slug": "43000688759-i-upgraded-to-the-premium-plan-but-my-alerts-still-expiring-in-2-months",
    "title": "I upgraded to the Premium plan but my alerts still expiring in 2 months",
    "folderSlug": "43000547663-alerts-settings",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000688759-i-upgraded-to-the-premium-plan-but-my-alerts-still-expiring-in-2-months/"
  },
  {
    "slug": "43000690908-why-is-the-once-per-bar-option-missing",
    "title": "Why is the Once Per Bar option missing?",
    "folderSlug": "43000547663-alerts-settings",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000690908-why-is-the-once-per-bar-option-missing/"
  },
  {
    "slug": "43000690941-how-to-get-more-active-alerts-per-subscription",
    "title": "How to get more active alerts per subscription",
    "folderSlug": "43000547663-alerts-settings",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000690941-how-to-get-more-active-alerts-per-subscription/"
  },
  {
    "slug": "43000690942-i-cannot-set-alerts-with-log-scale-enabled",
    "title": "I cannot set alerts with Log Scale enabled",
    "folderSlug": "43000547663-alerts-settings",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000690942-i-cannot-set-alerts-with-log-scale-enabled/"
  },
  {
    "slug": "43000691967-what-timezone-is-displayed-in-alerts",
    "title": "What timezone is displayed in alerts?",
    "folderSlug": "43000547663-alerts-settings",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000691967-what-timezone-is-displayed-in-alerts/"
  },
  {
    "slug": "43000696403-alerts-separation-by-type",
    "title": "Alerts separation by type",
    "folderSlug": "43000547663-alerts-settings",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000696403-alerts-separation-by-type/"
  },
  {
    "slug": "43000698958-alerts-based-on-real-time-and-non-real-time-symbols",
    "title": "Alerts based on real-time and non-real-time symbols",
    "folderSlug": "43000547663-alerts-settings",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000698958-alerts-based-on-real-time-and-non-real-time-symbols/"
  },
  {
    "slug": "43000698959-how-do-i-set-an-alert-at-a-preset-time",
    "title": "How do I set an alert at a preset time?",
    "folderSlug": "43000547663-alerts-settings",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000698959-how-do-i-set-an-alert-at-a-preset-time/"
  },
  {
    "slug": "43000707656-how-can-i-change-the-color-of-the-alert-price-line",
    "title": "How can I change the color of the alert price line?",
    "folderSlug": "43000547663-alerts-settings",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000707656-how-can-i-change-the-color-of-the-alert-price-line/"
  },
  {
    "slug": "43000732768-errors-when-creating-loading-alerts",
    "title": "Errors when creating/loading alerts",
    "folderSlug": "43000547663-alerts-settings",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000732768-errors-when-creating-loading-alerts/"
  },
  {
    "slug": "43000737982-i-want-my-toasts-to-stay-visible-what-should-i-do",
    "title": "I want my toasts to stay visible. What should I do?",
    "folderSlug": "43000547663-alerts-settings",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000737982-i-want-my-toasts-to-stay-visible-what-should-i-do/"
  },
  {
    "slug": "43000740625-how-to-adjust-alert-volume",
    "title": "How to Adjust Alert Volume",
    "folderSlug": "43000547663-alerts-settings",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000740625-how-to-adjust-alert-volume/"
  },
  {
    "slug": "43000754635-error-when-creating-alert-on-script",
    "title": "Error when creating alert on script",
    "folderSlug": "43000547663-alerts-settings",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000754635-error-when-creating-alert-on-script/"
  },
  {
    "slug": "43000766059-stopping-alerts-when-downgrading-your-plan",
    "title": "Stopping alerts when downgrading your plan",
    "folderSlug": "43000547663-alerts-settings",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000766059-stopping-alerts-when-downgrading-your-plan/"
  },
  {
    "slug": "43000766116-automatic-deletion-of-old-alert-triggers-from-the-log",
    "title": "Automatic deletion of old alert triggers from the Log",
    "folderSlug": "43000547663-alerts-settings",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000766116-automatic-deletion-of-old-alert-triggers-from-the-log/"
  },
  {
    "slug": "43000773947-alert-name-and-message-size-limits",
    "title": "Alert name and message size limits",
    "folderSlug": "43000547663-alerts-settings",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000773947-alert-name-and-message-size-limits/"
  },
  {
    "slug": "43000774194-alert-presets",
    "title": "Alert presets",
    "folderSlug": "43000547663-alerts-settings",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000774194-alert-presets/"
  },
  {
    "slug": "43000786831-alerts-on-fundamentals",
    "title": "Alerts on fundamentals",
    "folderSlug": "43000547663-alerts-settings",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000786831-alerts-on-fundamentals/"
  },
  {
    "slug": "43000787196-notification-schedule-for-alerts",
    "title": "Notification schedule for alerts",
    "folderSlug": "43000547663-alerts-settings",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000787196-notification-schedule-for-alerts/"
  },
  {
    "slug": "43000474389-how-to-receive-phone-notifications-for-alerts",
    "title": "How to receive phone notifications for alerts",
    "folderSlug": "43000547712-alerts-notifications",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000474389-how-to-receive-phone-notifications-for-alerts/"
  },
  {
    "slug": "43000474394-i-d-like-to-use-an-alternative-email-address-for-alert-notifications",
    "title": "I'd like to use an alternative email address for alert notifications",
    "folderSlug": "43000547712-alerts-notifications",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000474394-i-d-like-to-use-an-alternative-email-address-for-alert-notifications/"
  },
  {
    "slug": "43000474398-how-to-set-up-alternative-email-address-used-for-alert-notifications",
    "title": "How to set up alternative email address used for alert notifications",
    "folderSlug": "43000547712-alerts-notifications",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000474398-how-to-set-up-alternative-email-address-used-for-alert-notifications/"
  },
  {
    "slug": "43000548327-will-alerts-work-if-tradingview-is-not-open-on-the-computer",
    "title": "Will alerts work if TradingView is not open on the computer?",
    "folderSlug": "43000547712-alerts-notifications",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000548327-will-alerts-work-if-tradingview-is-not-open-on-the-computer/"
  },
  {
    "slug": "43000474409-i-cannot-hear-sound-notifications-of-my-alerts",
    "title": "I cannot hear sound notifications of my alerts",
    "folderSlug": "43000547712-alerts-notifications",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000474409-i-cannot-hear-sound-notifications-of-my-alerts/"
  },
  {
    "slug": "43000739521-limited-functionality-state-in-watchlist-alerts",
    "title": "Limited functionality state in Watchlist Alerts",
    "folderSlug": "43000547712-alerts-notifications",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000739521-limited-functionality-state-in-watchlist-alerts/"
  },
  {
    "slug": "43000529348-how-to-configure-webhook-alerts",
    "title": "How to configure webhook alerts",
    "folderSlug": "43000560150-webhooks-usage",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000529348-how-to-configure-webhook-alerts/"
  },
  {
    "slug": "43000529314-i-cannot-send-webhook-to-a-url-with-a-port-number",
    "title": "I cannot send webhook to a URL with a port number",
    "folderSlug": "43000560150-webhooks-usage",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000529314-i-cannot-send-webhook-to-a-url-with-a-port-number/"
  },
  {
    "slug": "43000529313-i-cannot-send-webhooks-to-slack",
    "title": "I cannot send webhooks to Slack",
    "folderSlug": "43000560150-webhooks-usage",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000529313-i-cannot-send-webhooks-to-slack/"
  },
  {
    "slug": "43000529625-i-cannot-send-webhooks-to-discord",
    "title": "I cannot send webhooks to Discord",
    "folderSlug": "43000560150-webhooks-usage",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000529625-i-cannot-send-webhooks-to-discord/"
  },
  {
    "slug": "43000680459-webhook-authentication",
    "title": "Webhook authentication",
    "folderSlug": "43000560150-webhooks-usage",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000680459-webhook-authentication/"
  },
  {
    "slug": "43000722015-using-credentials-for-webhooks",
    "title": "Using credentials for webhooks",
    "folderSlug": "43000560150-webhooks-usage",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000722015-using-credentials-for-webhooks/"
  },
  {
    "slug": "43000735201-webhook-resubmission",
    "title": "Webhook resubmission",
    "folderSlug": "43000560150-webhooks-usage",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000735201-webhook-resubmission/"
  },
  {
    "slug": "43000776894-what-do-errors-mean-when-sending-webhooks",
    "title": "What do errors mean when sending webhooks ?",
    "folderSlug": "43000560150-webhooks-usage",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000776894-what-do-errors-mean-when-sending-webhooks/"
  },
  {
    "slug": "43000478406-issue-with-alert-on-a-spread-symbol",
    "title": "Issue with alert on a spread symbol",
    "folderSlug": "43000548797-alerts-are-being-triggered-incorrectly-not-being-triggered",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000478406-issue-with-alert-on-a-spread-symbol/"
  },
  {
    "slug": "43000478415-issue-with-alert-on-a-custom-script",
    "title": "Issue with alert on a custom script",
    "folderSlug": "43000548797-alerts-are-being-triggered-incorrectly-not-being-triggered",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000478415-issue-with-alert-on-a-custom-script/"
  },
  {
    "slug": "43000480296-issue-with-alert-created-using-alertcondition-function",
    "title": "Issue with alert created using 'alertcondition' function",
    "folderSlug": "43000548797-alerts-are-being-triggered-incorrectly-not-being-triggered",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000480296-issue-with-alert-created-using-alertcondition-function/"
  },
  {
    "slug": "43000690939-alert-was-triggered-too-often-and-stopped",
    "title": "Alert was triggered too often and stopped",
    "folderSlug": "43000548797-alerts-are-being-triggered-incorrectly-not-being-triggered",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000690939-alert-was-triggered-too-often-and-stopped/"
  },
  {
    "slug": "43000741171-issue-with-once-per-bar-alert",
    "title": "Issue with \"Once Per Bar\" alert",
    "folderSlug": "43000548797-alerts-are-being-triggered-incorrectly-not-being-triggered",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000741171-issue-with-once-per-bar-alert/"
  },
  {
    "slug": "43000744212-the-issue-with-crossing-alerts-on-the-volume-indicator",
    "title": "The issue with crossing alerts on the Volume indicator",
    "folderSlug": "43000548797-alerts-are-being-triggered-incorrectly-not-being-triggered",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000744212-the-issue-with-crossing-alerts-on-the-volume-indicator/"
  },
  {
    "slug": "43000744279-issue-with-alerts-on-indicators-that-use-offsets",
    "title": "Issue with alerts on indicators that use offsets",
    "folderSlug": "43000548797-alerts-are-being-triggered-incorrectly-not-being-triggered",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000744279-issue-with-alerts-on-indicators-that-use-offsets/"
  },
  {
    "slug": "43000771511-the-trigger-time-of-a-strategy-alert-differs-from-the-order-execution-time-in-the-strategy-tester",
    "title": "The trigger time of a strategy alert differs from the order execution time in the strategy tester",
    "folderSlug": "43000548797-alerts-are-being-triggered-incorrectly-not-being-triggered",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000771511-the-trigger-time-of-a-strategy-alert-differs-from-the-order-execution-time-in-the-strategy-tester/"
  },
  {
    "slug": "43000773948-delays-in-onceperbarclose-alerts",
    "title": "Delays in OncePerBarClose alerts",
    "folderSlug": "43000548797-alerts-are-being-triggered-incorrectly-not-being-triggered",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000773948-delays-in-onceperbarclose-alerts/"
  },
  {
    "slug": "43000773984-the-impact-of-data-repainting-on-alert-calculation",
    "title": "The impact of data repainting on alert calculation",
    "folderSlug": "43000548797-alerts-are-being-triggered-incorrectly-not-being-triggered",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000773984-the-impact-of-data-repainting-on-alert-calculation/"
  },
  {
    "slug": "43000774016-common-reasons-for-mismatches-between-strategy-alert-triggers-and-strategy-orders-on-the-chart",
    "title": "Common reasons for mismatches between strategy alert triggers and strategy orders on the chart",
    "folderSlug": "43000548797-alerts-are-being-triggered-incorrectly-not-being-triggered",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000774016-common-reasons-for-mismatches-between-strategy-alert-triggers-and-strategy-orders-on-the-chart/"
  },
  {
    "slug": "43000780117-rsi-indicator-alerts-with-the-regular-bullish-bearish-divergence-condition-are-not-triggered",
    "title": "RSI indicator alerts with the Regular Bullish/Bearish Divergence condition are not triggered",
    "folderSlug": "43000548797-alerts-are-being-triggered-incorrectly-not-being-triggered",
    "sourceUrl": "https://www.tradingview.com/support/solutions/43000780117-rsi-indicator-alerts-with-the-regular-bullish-bearish-divergence-condition-are-not-triggered/"
  }
]

export function getFolderBySlug(slug: string): Folder | undefined {
  return folders.find(f => f.slug === slug)
}

export function getArticlesByFolder(folderSlug: string): ArticleMeta[] {
  return articles.filter(a => a.folderSlug === folderSlug)
}

export function getArticleMeta(slug: string): ArticleMeta | undefined {
  return articles.find(a => a.slug === slug)
}

export function getArticleBody(slug: string): { title: string; folder: string; sourceUrl: string; body: string } | undefined {
  return articlesData[slug]
}
