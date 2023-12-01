// @ts-nocheck
import NETWORK from 'constants/NetworkConstants';
import { KaruraAdapter } from 'manta-polkawallet-bridge/build/adapters/acala';
import { CalamariAdapter } from 'manta-polkawallet-bridge/build/adapters/manta';
import { KusamaAdapter } from 'manta-polkawallet-bridge/build/adapters/polkadot';
import { MoonriverAdapter } from 'manta-polkawallet-bridge/build/adapters/moonbeam';
// import { StatemineAdapter } from 'manta-polkawallet-bridge/build/adapters/statemint';
import { typesBundlePre900 } from 'moonbeam-types-bundle';
import { options } from '@acala-network/api';
import { ApiPromise, WsProvider } from '@polkadot/api';
import types from '../config/types.json';
import AssetType from './AssetType';

export default class Chain {
  name: string;
  displayName: string;
  parachainId: number;
  icon: string;
  socket: string;
  subscanUrl: string;
  xcmAssets: AssetType[];
  nativeAsset: AssetType;
  xcmAdapterClass: any;
  apiTypes: any;
  apiOptions: any;
  apiTypesBundle: any;
  ethMetadata: any;
  ethChainId: null | string;

  constructor(
    name,
    displayName,
    parachainId,
    icon,
    socket,
    subscanUrl,
    xcmAssets,
    nativeAsset,
    xcmAdapterClass,
    apiTypes = null,
    apiOptions = null,
    apiTypesBundle = null,
    ethMetadata = null,
    ethChainId = null
  ) {
    this.name = name;
    this.displayName = displayName;
    this.parachainId = parachainId;
    this.icon = icon;
    this.socket = socket;
    this.subscanUrl = subscanUrl;
    this.xcmAssets = xcmAssets;
    this.nativeAsset = nativeAsset;
    this.xcmAdapterClass = xcmAdapterClass;
    this.apiTypes = apiTypes || {};
    this.apiOptions = apiOptions;
    this.apiTypesBundle = apiTypesBundle;
    this.ethMetadata = ethMetadata;
    this.ethChainId = ethChainId;
    this.api = null;
  }

  static DolphinSkinnedCalamari(config) {
    return new Chain(
      'calamari',
      'Dolphin',
      2084,
      'dolphin',
      config.DOLPHIN_SOCKET,
      config.DOLPHIN_SUBSCAN_URL,
      [AssetType.Kusama(config), AssetType.Karura(config), AssetType.Moonriver(config), AssetType.Tether(config)],
      AssetType.DolphinSkinnedCalamari(config),
      CalamariAdapter,
      types
    );
  }

  static Calamari(config) {
    return new Chain(
      'calamari',
      'Calamari',
      2084,
      'calamariLogo',
      config.CALAMARI_SOCKET,
      config.CALAMARI_SUBSCAN_URL,
      [AssetType.Kusama(config), AssetType.Karura(config), AssetType.Moonriver(config), AssetType.Tether(config), AssetType.Dai(config), AssetType.UsdCoin(config)],
      AssetType.Calamari(config),
      CalamariAdapter,
      types
    );
  }

  static Kusama(config) {
    return new Chain(
      'kusama',
      'Kusama',
      null,
      'kusama',
      config.KUSAMA_SOCKET,
      config.KUSAMA_SUBSCAN_URL,
      [AssetType.Kusama(config)],
      AssetType.Kusama(config),
      KusamaAdapter
    );
  }

  // static Statemine(config) {
  //   return new Chain(
  //     'statemine',
  //     'Statemine',
  //     1000,
  //     'statemine',
  //     config.STATEMINE_SOCKET,
  //     config.STATEMINE_SUBSCAN_URL,
  //     [AssetType.Tether(config)],
  //     AssetType.Kusama(config),
  //     StatemineAdapter
  //   );
  // }


  static Karura(config) {
    return new Chain(
      'karura',
      'Karura',
      2000,
      'kar',
      config.KARURA_SOCKET,
      config.KARURA_SUBSCAN_URL,
      [AssetType.Karura(config), AssetType.UsdCoin(config), AssetType.Dai(config), AssetType.Tether(config)],
      AssetType.Karura(config),
      KaruraAdapter,
      null,
      options
    );
  }

  static Moonriver(config) {
    const moonriverEthMetadata = {
      chainId: config.IS_TESTNET ? '0x500' : '0x505',
      chainName: config.IS_TESTNET ? 'Moonriver Development Testnet' : 'Moonriver',
      nativeCurrency: {
        name: 'MOVR',
        symbol: 'MOVR',
        decimals: 18
      },
      rpcUrls: [config.MOONRIVER_RPC]
    };

    return new Chain(
      'moonriver',
      'Moonriver',
      1000,
      'movr',
      config.MOONRIVER_SOCKET,
      config.MOONRIVER_SUBSCAN_URL,
      [AssetType.Moonriver(config)],
      AssetType.Moonriver(config),
      MoonriverAdapter,
      typesBundlePre900,
      null,
      null,
      moonriverEthMetadata,
      config.IS_TESTNET ? '1280' : '1285'
    );
  }

  static All(config) {
    if (config.NETWORK_NAME === NETWORK.CALAMARI) {
      return [
        Chain.Calamari(config),
        // Chain.Kusama(config),
        Chain.Karura(config),
        Chain.Moonriver(config),
        // Chain.Statemine(config)
      ];
    } else if (config.NETWORK_NAME === NETWORK.DOLPHIN) {
      return [
        Chain.DolphinSkinnedCalamari(config),
        // Chain.Kusama(config),
        // Chain.Karura(config),
        Chain.Moonriver(config),
        // Chain.Statemine(config)
      ];
    }
  }

  getXcmApi() {
    const provider = new WsProvider(this.socket);
    if (this.apiOptions) {
      const api = new ApiPromise(options({ provider, types: this.apiTypes}));
      return api;
    } else {
      const api = new ApiPromise({provider, types: this.apiTypes, typesBundle: this.apiTypesBundle});
      return api;
    }
  }

  getXcmAdapter() {
    return new this.xcmAdapterClass();
  }

  canTransferXcm(otherChain) {
    if (this.name === otherChain.name) {
      return false;
    }
    for (let i = 0; i < this.xcmAssets.length; i++) {
      const asset = this.xcmAssets[i];
      if (
        otherChain.xcmAssets.find(
          (otherAsset) => asset.assetId === otherAsset.assetId
        )
      ) {
        return true;
      }
    }
    return false;
  }
}
