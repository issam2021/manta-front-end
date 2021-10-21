import { INTERNAL_CHAIN_ID, EXTERNAL_CHAIN_ID } from 'constants/Bip39Constants';
import React, { useEffect } from 'react';
import { Route, Switch, withRouter, Redirect } from 'react-router-dom';
import { TransactPage, AccountPage } from 'pages';
import { SidebarMenu } from 'components/elements/Layouts';
import ScrollIntoView from 'components/elements/ScrollFollow/ScrollIntoView';
import ChangeThemeButton from 'components/resources/Sidebar/ChangeThemeButton';
import store from 'store';
import { useSubstrate } from 'contexts/SubstrateContext';
import { useSigner } from 'contexts/SignerContext';
import { useWallet } from 'contexts/WalletContext';
import SignerParamGen from 'api/SignerParamGen';
import SignerClient from 'api/SignerClient';

function MainApp() {
  const { api } = useSubstrate();
  const { signerClient } = useSigner();
  const { saveSpendableAssets } = useWallet();

  useEffect(() => {
    const devClearLocalStorage = async () => {
      if (!api) return;
      await api.isReady;
      const oldBlockNumber = store.get('block num') || 0;
      const currentBlock = await api.rpc.chain.getBlock();
      const currentBlockNumber = currentBlock.block.header.number.toNumber();
      store.set('block num', currentBlockNumber);
      if (currentBlockNumber < oldBlockNumber) {
        store.set('manta_spendable_assets', []);
        store.set('mantaAddresses', {
          [INTERNAL_CHAIN_ID]: [],
          [EXTERNAL_CHAIN_ID]: [],
        });
        store.set('manta_initialized_assets', []);
        store.set('dummyPublicAssetBalance', {});
        console.log('Reset local storage');
      }
    };
    devClearLocalStorage();
  }, [api]);

  useEffect(() => {
    if (!api || !api.isConnected || !signerClient) {
      return;
    }
    const recoverWallet = async () => {
      await api.isReady;
      const signerParamGen = new SignerParamGen(api);
      const signerClient = new SignerClient(api);
      const params = await signerParamGen.generateRecoverWalletParams();
      const spendableAssets = await signerClient.recoverWallet(params);
      saveSpendableAssets(spendableAssets, api);
    };
    recoverWallet();
  }, [api, signerClient]);

  return (
    <div className="main-app bg-primary">
      <ScrollIntoView>
        <SidebarMenu />
        <Switch>
          <Route path="/" render={() => <Redirect to="/account" />} exact />
          <Route path="/account" component={AccountPage} exact />
          <Route path="/transact" component={TransactPage} exact />
          {/* <Route path="/swap" component={SwapPage} exact />
          <Route path="/pool" component={PoolPage} exact />
          <Route path="/govern" component={GovernPage} exact />
          <Route path="/audit" component={AuditPage} exact />
          <Route path="/explore" component={ExplorePage} exact />
          <Route path="/explore/extrinsic" component={ExtrinsicPage} exact />
          <Route path="/explore/block" component={BlockPage} exact />
          <Route path="/explore/extrinsic-history" component={ExtrinsicHistory} exact />
          <Route path="/explore/hash/:id" component={HashDetailPage} exact /> */}
        </Switch>
        <div className="p-4 hidden change-theme lg:block fixed right-0 bottom-0">
          <ChangeThemeButton />
        </div>
      </ScrollIntoView>
    </div>
  );
}

export default withRouter(MainApp);
