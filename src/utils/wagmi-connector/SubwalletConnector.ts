// Copyright 2017-2022 @subwallet/wagmi-connect authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {
  Chain,
  InjectedConnector,
  InjectedConnectorOptions,
} from "@wagmi/core";

export interface SubwalletConnectorOptions extends InjectedConnectorOptions {}

type WagmiConstructorParams = {
  chains?: Chain[];
  options?: SubwalletConnectorOptions;
};

export class SubWalletConnector extends InjectedConnector {
  override readonly id = "subwallet";
  override readonly ready = typeof window != "undefined" && !!window.SubWallet;

  constructor({ chains, options: _options }: WagmiConstructorParams = {}) {
    super({
      chains,
      options: {
        name: "SubWallet",
        shimDisconnect: true,
        ..._options,
      },
    });
  }

  async getProvider() {
    if (typeof window === "undefined") return;
    return window.SubWallet;
  }
}
