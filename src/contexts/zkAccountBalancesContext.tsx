//@ts-nocheck
import BN from 'bn.js';
import { usePrivateWallet } from 'contexts/privateWalletContext';
import { useUsdPrices } from 'contexts/usdPricesContext';
import Decimal from 'decimal.js';
import PropTypes from 'prop-types';
import { createContext, useContext, useEffect, useState } from 'react';
import AssetType from 'types/AssetType';
import Balance from 'types/Balance';
import Usd from 'types/Usd';
import { useActive } from 'hooks/useActive';
import { useConfig } from './configContext';
import { useGlobal } from './globalContexts';

const ZkAccountBalancesContext = createContext();

export type ZkAccountBalance = {
  assetType: AssetType;
  usdBalance: Usd | null;
  usdBalanceString: string;
  privateBalance: Balance;
};

export const ZkAccountBalancesContextProvider = (props) => {
  const config = useConfig();
  const { privateWallet, privateAddress, getSpendableBalance, isReady } = usePrivateWallet();
  const { usdPrices } = useUsdPrices();
  const { NETWORK_NAME: network } = useConfig();

  const assets = AssetType.AllCurrencies(config, true);
  const [totalBalanceString, setTotalBalanceString] = useState('$0.00');
  const [balances, setBalances] = useState([]);
  const { usingMantaWallet } = useGlobal();
  const isActive = useActive();

  useEffect(() => {
    const clearBalancesOnSwitchMode = () => {
      setBalances([]);
      setTotalBalanceString('$0.00');
    };
    clearBalancesOnSwitchMode();
  }, [usingMantaWallet]);

  const fetchPrivateBalanceMantaSigner = async (assetType) => {
    let usdBalance = null;
    const privateBalance = await getSpendableBalance(assetType);
    if (privateBalance) {
      const assetUsdValue = usdPrices[assetType.baseTicker] || null;
      if (assetUsdValue) {
        usdBalance = privateBalance.toUsd(assetUsdValue);
      }
      const usdBalanceString = config.IS_TESTNET
        ? '$0.00'
        : usdBalance?.toString() || '';
      return {
        assetType,
        usdBalance,
        usdBalanceString,
        privateBalance
      };
    }
    return {
      assetType,
      usdBalance,
      usdBalanceString: '',
      privateBalance
    };
  };

  const fetchPrivateBalancesMantaWallet = async () => {
    const assets = AssetType.AllCurrencies(config, true);
    const assetIds = assets.map(asset => asset.assetId.toString());
    const balancesRaw = await privateWallet.getMultiZkBalance({assetIds: assetIds, network });
    const balances = [];
    for (let i = 0; i < balancesRaw.length; i++) {
      const balance = new Balance(assets[i], new BN(balancesRaw[i]));
      const zkAccountBalance = {
        assetType: assets[i],
        usdBalance: null,
        usdBalanceString: '',
        privateBalance: balance
      };
      balances.push(zkAccountBalance);
    }
    setBalances(balances);
    // Not tracked in Manta Wallet mode
    setTotalBalanceString('$0.00');
  };

  const fetchPrivateBalancesMantaSigner = async () => {
    const totalUsd = new Usd(new Decimal(0));
    const updatedBalances = [];
    for (let i = 0; i < assets.length; i++) {
      const balance = await fetchPrivateBalanceMantaSigner(assets[i]);
      updatedBalances.push(balance);
      balance?.usdBalance?.value && totalUsd.add(balance.usdBalance);
    }
    setBalances(updatedBalances);
    setTotalBalanceString(totalUsd.toString());
  };

  const fetchPrivateBalances = async () => {
    if (usingMantaWallet) {
      fetchPrivateBalancesMantaWallet();
    } else {
      fetchPrivateBalancesMantaSigner();
    }
  };

  useEffect(() => {
    // When using manta wallet, balances are only fetched on demand to reduce load on the extension
    if (!usingMantaWallet) {
      const interval = setInterval(() => {
        if (isActive && isReady && privateAddress) {
          fetchPrivateBalances();
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isReady, privateAddress, usingMantaWallet]);

  useEffect(() => {
    const clearBalancesOnDeleteZkAccount = () => {
      if (!privateAddress) {
        setBalances([]);
        setTotalBalanceString('$0.00');
      }
    };
    clearBalancesOnDeleteZkAccount();
  }, [privateAddress]);

  const value = {
    balances,
    totalBalanceString,
    fetchPrivateBalances
  };

  return (
    <ZkAccountBalancesContext.Provider value={value}>
      {props.children}
    </ZkAccountBalancesContext.Provider>
  );
};

ZkAccountBalancesContextProvider.propTypes = {
  children: PropTypes.any
};

export const useZkAccountBalances = () => ({
  ...useContext(ZkAccountBalancesContext)
});
