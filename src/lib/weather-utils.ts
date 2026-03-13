/**
 * VISTA Weather — subscription weather: Sunny (calm), Storm (price hikes/renewals), Fog (ghost/unclear).
 */

export type WeatherState = "sunny" | "partly-cloudy" | "storm" | "fog";

export interface WeatherInput {
  priceHikesCount: number;
  ghostCount: number;
  totalSubscriptions: number;
  hasRenewalsSoon?: boolean;
}

export interface WeatherResult {
  state: WeatherState;
  label: string;
  description: string;
  tip: string;
  /** Per-category or per-concern "forecast" for feature-rich UI */
  details: { label: string; state: WeatherState; reason: string }[];
}

export function computeWeather(input: WeatherInput): WeatherResult {
  const { priceHikesCount, ghostCount, totalSubscriptions, hasRenewalsSoon } = input;

  if (totalSubscriptions === 0) {
    return {
      state: "sunny",
      label: "Clear skies",
      description: "No subscriptions detected. Connect Gmail to see your subscription weather.",
      tip: "Your financial weather updates as you connect and track subscriptions.",
      details: [],
    };
  }

  const details: { label: string; state: WeatherState; reason: string }[] = [];

  if (priceHikesCount > 0) {
    details.push({
      label: "Price hikes",
      state: "storm",
      reason: `${priceHikesCount} service(s) raised prices recently.`,
    });
  }
  if (ghostCount > 0) {
    details.push({
      label: "Ghost subscriptions",
      state: "fog",
      reason: `${ghostCount} subscription(s) look inactive or unclear.`,
    });
  }
  if (hasRenewalsSoon) {
    details.push({
      label: "Renewals",
      state: "storm",
      reason: "Charges or renewals coming soon.",
    });
  }
  if (priceHikesCount === 0 && ghostCount === 0 && !hasRenewalsSoon) {
    details.push({
      label: "Subscriptions",
      state: "sunny",
      reason: "No major alerts. All clear.",
    });
  }

  const hasStorm = priceHikesCount > 0 || hasRenewalsSoon;
  const hasFog = ghostCount > 0;
  const hasCloud = details.some((d) => d.state === "partly-cloudy");

  let state: WeatherState;
  let label: string;
  let description: string;
  let tip: string;

  if (hasStorm && hasFog) {
    state = "storm";
    label = "Storm & fog";
    description = "Price hikes or renewals are coming, and some subscriptions look like ghosts. Time to cancel and trim.";
    tip = "Check VISTA Ghost to hunt ghost subs and VISTA Aura for cancellation links.";
  } else if (hasStorm) {
    state = "storm";
    label = "Storm";
    description = "Price hikes or renewals are on the horizon. Review before you're charged.";
    tip = "Ask VISTA Aura to find cancellation links for any service you want to drop.";
  } else if (hasFog) {
    state = "fog";
    label = "Fog";
    description = "Some subscriptions are unclear or look inactive. Clear the fog by cancelling what you don't use.";
    tip = "Use VISTA Ghost to see and hunt ghost subscriptions.";
  } else if (details.length > 1) {
    state = "partly-cloudy";
    label = "Partly cloudy";
    description = "Mostly calm, with a few things to watch.";
    tip = "A quick monthly ritual keeps your subscription weather clear.";
  } else {
    state = "sunny";
    label = "Sunny";
    description = "All clear. No price hikes, no ghost subs — your subscription sky is calm.";
    tip = "Keep it that way with a monthly VISTA Ritual.";
  }

  return { state, label, description, tip, details };
}
