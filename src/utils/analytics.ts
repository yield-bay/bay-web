import * as amplitude from "@amplitude/analytics-browser";

export function trackPageView() {
  if (typeof window != undefined) {
    amplitude
      .init(process.env.NEXT_PUBLIC_AMPLITUDE_CODE as string)
      .promise.then(() => amplitude.track("page-view"));
  }
}

export function trackEventWithProperty(event: string, properties?: any) {
  if (typeof window != undefined) {
    amplitude
      .init(process.env.NEXT_PUBLIC_AMPLITUDE_CODE as string)
      .promise.then(() => amplitude.track(event, properties));
  }
}
