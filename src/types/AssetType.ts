// @ts-nocheck
import NETWORK from 'constants/NetworkConstants';
import BN from 'bn.js';

const CalamariAssetIds = {
  KMA: 1,
  KAR: 8,
  AUSD: 9,
  LKSM: 10,
  MOVR: 11,
  KSM: 12,
  USDT: 14,
  DAI: 15,
  USDC: 16
};

const DolphinAssetIds = {
  DOL: 1,
  KAR: 8,
  AUSD: 9,
  LKSM: 10,
  MOVR: 11,
  KSM: 12,
  USDT: 14
};

const getAssetIds = (config) => {
  if (config.NETWORK_NAME === NETWORK.CALAMARI) {
    return CalamariAssetIds;
  } else if (config.NETWORK_NAME === NETWORK.DOLPHIN) {
    return DolphinAssetIds;
  }
};

export default class AssetType {
  assetId: number;
  baseName: string;
  name: string;
  baseTicker: string;
  ticker: string;
  logicalTicker: string;
  icon: string;
  numberOfDecimals: number;
  existentialDeposit: BN;
  existentialDeposit: BN;
  isPrivate: boolean;
  isTestnet: boolean;
  isNativeToken: boolean;
  coingeckoId: string;

  constructor(
    assetId,
    baseName,
    baseTicker,
    icon,
    numberOfDecimals,
    existentialDeposit,
    isPrivate,
    coingeckoId,
    isTestnet,
    isNativeToken = false,
    logicalTicker = null
  ) {
    this.assetId = assetId;
    this.baseName = baseName;
    this.baseTicker = baseTicker;
    this.logicalTicker = logicalTicker || baseTicker;
    this.name = AssetType._getFullName(baseName, isPrivate, isTestnet);
    this.ticker = AssetType._getFullTicker(baseTicker, isPrivate);
    this.icon = icon;
    this.numberOfDecimals = numberOfDecimals;
    this.existentialDeposit = existentialDeposit;
    this.isPrivate = isPrivate;
    this.isTestnet = isTestnet;
    this.isNativeToken = isNativeToken;
    this.coingeckoId = coingeckoId;
  }

  static Native(config) {
    if (config.NETWORK_NAME === 'Calamari') {
      return AssetType.Calamari(config, false);
    } else {
      return AssetType.DolphinSkinnedCalamari(config, false);
    }
  }

  static DolphinSkinnedCalamari(config, isPrivate) {
    return new AssetType(
      getAssetIds(config).DOL,
      'Dolphin',
      'DOL',
      'dolphin',
      12,
      new BN('100000000000'),
      isPrivate,
      'dolphin',
      config.IS_TESTNET,
      true,
      'KMA'
    );
  }

  static Calamari(config, isPrivate) {
    return new AssetType(
      getAssetIds(config).KMA,
      'Calamari',
      'KMA',
      'calamari',
      12,
      new BN('100000000000'),
      isPrivate,
      'calamari-network',
      config.IS_TESTNET,
      true
    );
  }

  static Karura(config, isPrivate) {
    return new AssetType(
      getAssetIds(config).KAR,
      'Karura',
      'KAR',
      'kar',
      12,
      new BN('100000000000'),
      isPrivate,
      'karura',
      config.IS_TESTNET,
    );
  }

  static Kusama(config, isPrivate) {
    return new AssetType(
      getAssetIds(config).KSM,
      'Kusama',
      'KSM',
      'kusama',
      12,
      new BN('500000000'),
      isPrivate,
      'kusama',
      config.IS_TESTNET,
    );
  }

  static Moonriver(config, isPrivate) {
    return new AssetType(
      getAssetIds(config).MOVR,
      'Moonriver',
      'MOVR',
      'movr',
      18,
      new BN('100000000000000000'),
      isPrivate,
      'moonriver',
      config.IS_TESTNET,
    );
  }

  static Tether(config, isPrivate) {
    return new AssetType(
      getAssetIds(config).USDT,
      'Tether USD',
      'USDT',
      'tether',
      6,
      new BN('1000'),
      isPrivate,
      'tether',
      config.IS_TESTNET,
    );
  }

  // static WrappedBitcoin(config, isPrivate) {
  //   return new AssetType(
  //     getAssetIds(config).WBTC,
  //     'Wrapped Bitcoin',
  //     'WBTC',
  //     'wbtc', // need to find image (just bitcoin image maybe okay)
  //     8, // pretty sure, check
  //     new BN('1'), // not sure
  //     isPrivate,
  //     'wrapped-bitcoin',
  //     config.IS_TESTNET,
  //   );
  // }

  // static WrappedEthereum(config, isPrivate) {
  //   return new AssetType(
  //     getAssetIds(config).WETH,
  //     'Wrapped Ethereum',
  //     'WETH',
  //     'weth', // need to find image (just ETH image maybe okay)
  //     18, // pretty sure, check
  //     new BN('1'), // not sure
  //     isPrivate,
  //     'weth',
  //     config.IS_TESTNET,
  //   );
  // }

  static Dai(config, isPrivate) {
    return new AssetType(
      getAssetIds(config).DAI,
      'Dai',
      'DAI',
      'dai',
      18,
      new BN('10000000000000000'),
      isPrivate,
      'dai',
      config.IS_TESTNET,
    );
  }

  static UsdCoin(config, isPrivate) {
    return new AssetType(
      getAssetIds(config).USDC,
      'USD Coin',
      'USDC',
      'usdc',
      6,
      new BN('10000'),
      isPrivate,
      'usd-coin',
      config.IS_TESTNET,
      false,
      'USDCet'
    );
  }


  static AllCurrencies(config, isPrivate) {
    if (config.NETWORK_NAME === NETWORK.DOLPHIN) {
      return [
        AssetType.DolphinSkinnedCalamari(config, isPrivate),
        // AssetType.Karura(config, isPrivate),
        AssetType.Kusama(config, isPrivate),
        AssetType.Moonriver(config, isPrivate),
        AssetType.Tether(config, isPrivate),
        // AssetType.WrappedBitcoin(config, isPrivate),
        // AssetType.WrappedEthereum(config, isPrivate),
        // AssetType.Dai(config, isPrivate),
        // AssetType.UsdCoin(config, isPrivate)
      ];
    } else if (config.NETWORK_NAME === NETWORK.CALAMARI) {
      return [
        AssetType.Calamari(config, isPrivate),
        AssetType.Karura(config, isPrivate),
        AssetType.Kusama(config, isPrivate),
        AssetType.Moonriver(config, isPrivate),
        AssetType.Tether(config, isPrivate),
        // AssetType.WrappedBitcoin(config, isPrivate),
        // AssetType.WrappedEthereum(config, isPrivate),
        AssetType.Dai(config, isPrivate),
        AssetType.UsdCoin(config, isPrivate)
      ];
    }
  }

  static _getFullName(baseName, isPrivate, isTestnet) {
    let name = isTestnet ? 'Test ' : '';
    if (isPrivate) {
      name += 'zk';
    }
    return name + baseName;
  }

  static _getFullTicker(baseTicker, isPrivate) {
    return isPrivate ? `zk${baseTicker}` : baseTicker;
  }

  toPrivate() {
    return new AssetType(
      this.assetId,
      this.baseName,
      this.baseTicker,
      this.icon,
      this.numberOfDecimals,
      this.existentialDeposit,
      true,
      this.coingeckoId,
      this.isTestnet,
      this.isNativeToken,
      this.logicalTicker
    );
  }

  toPublic() {
    return new AssetType(
      this.assetId,
      this.baseName,
      this.baseTicker,
      this.icon,
      this.numberOfDecimals,
      this.existentialDeposit,
      false,
      this.coingeckoId,
      this.isTestnet,
      this.isNativeToken,
      this.logicalTicker
    );
  }

  toggleIsPrivate() {
    if (this.isPrivate) {
      return this.toPublic();
    } else {
      return this.toPrivate();
    }
  }

  canTransferXcm = (originChain, destinationChain) => {
    return (
      originChain.xcmAssets.find((asset) => asset.name === this.name) &&
      destinationChain.xcmAssets.find((asset) => asset.name === this.name)
    );
  };
}
