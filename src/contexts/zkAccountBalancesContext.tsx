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
import { useConfig } from './configContext';
import { useGlobal } from './globalContexts';
import { useActive } from 'hooks/useActive';

const ZkAccountBalancesContext = createContext();

export type ZkAccountBalance = {
  assetType: AssetType;
  usdBalance: Usd;
  usdBalanceString: string;
  privateBalance: Balance;
};

export const ZkAccountBalancesContextProvider = (props) => {
  const config = useConfig();
  const { privateAddress, getSpendableBalance, isReady } = usePrivateWallet();
  const { usdPrices } = useUsdPrices();

  const assets = AssetType.AllCurrencies(config, true);
  const [totalBalanceString, setTotalBalanceString] = useState('$0.00');
  const [balances, setBalances] = useState([]);
  const { usingMantaWallet } = useGlobal();
  const isActive = useActive();

  const fetchPrivateBalance = async (assetType) => {
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

  const fetchPrivateBalances = async () => {
    const totalUsd = new Usd(new Decimal(0));
    const updatedBalances = [];
    for (let i = 0; i < assets.length; i++) {
      const balance = await fetchPrivateBalance(assets[i]);
      updatedBalances.push(balance);
      balance?.usdBalance?.value && totalUsd.add(balance.usdBalance);
    }
    const nonzeroBalances = [
      ...updatedBalances.filter(
        (balance) =>
          balance.privateBalance &&
          balance.privateBalance.gt(new Balance(balance.assetType, new BN(0)))
      )
    ];
    setBalances(nonzeroBalances);
    setTotalBalanceString(totalUsd.toString());
  };

  useEffect(() => {
    // Manta Signer
    if (!usingMantaWallet) {
      const interval = setInterval(() => {
        if (isActive && isReady && privateAddress) {
          fetchPrivateBalances();
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isReady, privateAddress]);

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
    totalBalanceString
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
