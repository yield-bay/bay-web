import * as amplitude from "@amplitude/analytics-browser";
import { AMPLITUDE_CODE } from "./constants";

export function trackPageView() {
  if (typeof window != undefined) {
    amplitude
      .init(AMPLITUDE_CODE as string)
      .promise.then(() => amplitude.track("page-view"));
  }
}

export function trackEventWithProperty(event: string, properties?: any) {
  if (typeof window != undefined) {
    amplitude
      .init(AMPLITUDE_CODE as string)
      .promise.then(() => amplitude.track(event, properties));
  }
}
