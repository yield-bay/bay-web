import {
  Chain,
  InjectedConnector,
  InjectedConnectorOptions,
} from "@wagmi/core";

export interface TalismanConnectorOptions extends InjectedConnectorOptions {}

type WagmiConstructorParams = {
  chains?: Chain[];
  options?: TalismanConnectorOptions;
};

export class TalismanConnector extends InjectedConnector {
  override readonly id = "talisman";
  override readonly ready =
    typeof window != "undefined" && !!window.talismanEth;

  constructor({ chains, options: _options }: WagmiConstructorParams = {}) {
    super({
      chains,
      options: {
        name: "Talisman",
        shimDisconnect: true,
        ..._options,
      },
    });
  }

  async getProvider() {
    if (typeof window === "undefined") return;
    return window.talismanEth;
  }
}
