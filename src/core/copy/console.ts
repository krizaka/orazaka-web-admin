/**
 * @file console.ts
 * @description The words of the console's shell, its sign-in and its supervision — one place, so a second language is
 * a second object of the same shape and not a hunt through components. The billing and Studio screens still carry
 * their (French) words inline: moving them here is the console's i18n follow-up.
 */

export const consoleCopy = {
  product: "Orazaka",
  console: "Operations",
  nav: {
    label: "Console",
    supervision: "Supervision",
    billing: "Billing & credits",
    studios: "Studios",
    open: "Open the menu",
    close: "Close the menu",
    signOut: "Sign out",
    theme: { dark: "Dark theme — switch to light", light: "Light theme — follow the system", system: "System theme — switch to dark" },
  },
  login: {
    title: "Operator sign-in",
    lead: "The console of your Orazaka platform. Only an account with the administrator role opens it.",
    email: "Email",
    password: "Password",
    submit: "Sign in",
    refused: "Those credentials do not open the console — wrong password, or an account without the administrator role.",
    unreachable: "The identity service did not answer. Is the platform running?",
  },
  supervision: {
    title: "Platform supervision",
    lead: "What the engine did in the last 30 days, read from the billing ledger and the job service.",
    loading: "Reading the platform's figures",
    slow: "Still reading — the ledger is large or a service is slow",
    error: "Some figures could not be read: the services may be starting. The rest is shown.",
    retry: "Retry",
    kpi: {
      requests: "Requests served",
      requestsHint: "Metered turns, 30 days",
      credits: "Credits charged",
      creditsHint: "Settled on the ledger",
      refusals: "Refusal rate",
      refusalsHint: "Including DRY_RUN refusals",
      live: "Live connections",
      liveHint: "Open job streams",
    },
    creditsByCapability: "Credits by capability",
    creditsByCapabilityDesc: "Where the credits went, last 30 days",
    capability: "Capability",
    credits: "Credits",
    requestsByCapability: "Requests and refusals",
    requestsByCapabilityDesc: "Per capability and model — a high refusal share means a price or a paywall to revisit",
    requests: "Requests",
    refusals: "Refusals",
    topConsumers: "Top consumers",
    topConsumersDesc: "Actors by credits charged",
    actor: "Actor",
    jobsPerDay: "Jobs per day",
    jobsPerDayDesc: "Every workspace, by outcome — last 14 days",
    day: "Day",
    completed: "Completed",
    failed: "Failed",
    running: "In progress",
    latency: "Time to a result",
    latencyDesc: "Median seconds per capability, from request to result",
    seconds: "Seconds",
  },
} as const;

export type ConsoleCopy = typeof consoleCopy;
