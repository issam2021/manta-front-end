import {
  MANTA_WALLET_BASE_PATH,
  INTERNAL_CHAIN_ID,
  EXTERNAL_CHAIN_ID,
} from 'constants/Bip39Constants';
import store from 'store';
import { base64Decode, base64Encode } from '@polkadot/util-crypto';
import axios from 'axios';
import MantaUIAsset from 'types/MantaUIAsset';
import { persistSpendableAssets } from 'utils/persistence/AssetStorage';

export default class SignerClient {
  constructor(api) {
    axios.defaults.baseURL = 'http://localhost:29986/';
    this.api = api;
    if (!store.get('mantaAddresses')) {
      store.set('mantaAddresses', {
        [INTERNAL_CHAIN_ID]: [],
        [EXTERNAL_CHAIN_ID]: [],
      });
    }
  }

  async checkSignerIsOpen() {
    try {
      await axios.get('heartbeat', { timeout: 2 });
      return true;
    } catch (timeoutError) {
      return false;
    }
  }

  async recoverWallet() {
    const encryptedNotes = await this.api.query.mantaPay.encValueList();
    const voidNumbers = await this.api.query.mantaPay.vNList();
    const shards = await this.api.query.mantaPay.coinShards();
    const utxos = shards.shard.map((shard) => shard.list).flat();
    const params = this.api.createType('RecoverAccountParams', {
      encrypted_notes: encryptedNotes,
      void_numbers: voidNumbers,
      utxos: utxos,
    });
    const res = await axios.post('recoverAccount', params.toU8a());
    let bytes = base64Decode(res.data.recovered_account);
    const recoveredAssetsRaw = this.api.createType('RecoveredAccount', bytes);
    const recoveredAssets = recoveredAssetsRaw.assets.map((asset) =>
      MantaUIAsset.fromBytes(asset.toU8a(), this.api)
    );
    persistSpendableAssets(recoveredAssets);
  }

  async _deriveAddress(path, assetId) {
    const params = this.api.createType('DeriveShieldedAddressParams', {
      asset_id: assetId,
      path: path,
    });
    const res = await axios.post('deriveShieldedAddress', params.toU8a());
    let addressBytes = base64Decode(res.data.address);
    return base64Encode(
      this.api.createType('MantaAssetShieldedAddress', addressBytes).toU8a()
    );
  }

  async _generateNextAddress(isInternal, assetId) {
    const chainId = isInternal ? INTERNAL_CHAIN_ID : EXTERNAL_CHAIN_ID;
    let addresses = store.get('mantaAddresses');
    const chainAddresses = addresses[chainId];
    const addressIdx = chainAddresses.length;
    const path = `${MANTA_WALLET_BASE_PATH}/${chainId}/${addressIdx}`;

    const address = this._deriveAddress(path, assetId);
    chainAddresses.push(address);
    store.set('mantaAddresses', addresses);
    return address;
  }

  async generateNextInternalAddress(assetId) {
    return this._generateNextAddress(true, assetId);
  }

  async generateNextExternalAddress(assetId) {
    return this._generateNextAddress(false, assetId);
  }

  async generateAsset(assetId, amount) {
    await this.generateNextInternalAddress(assetId);
    let addressIdx = store.get('mantaAddresses')[INTERNAL_CHAIN_ID].length - 1;
    const path = `${MANTA_WALLET_BASE_PATH}/${INTERNAL_CHAIN_ID}/${addressIdx}`;
    const params = this.api.createType('GenerateAssetParams', {
      asset_id: assetId,
      path: path,
      value: amount,
    });
    const res = await axios.post('generateAsset', params.toU8a());
    let assetBytes = base64Decode(res.data.asset);
    return MantaUIAsset.fromBytes(assetBytes, this.api);
  }

  async generateMintPayload(asset) {
    const params = this.api.createType('GenerateAssetParams', {
      asset_id: asset.assetId,
      path: asset.path,
      value: asset.value,
    });
    const res = await axios.post('generateMintData', params.toU8a());
    return base64Decode(res.data.mint_data);
  }

  async generatePrivateTransferParams(
    asset1,
    asset2,
    ledgerState1,
    ledgerState2,
    spendAmount,
    changeAmount
  ) {
    await this.generateNextInternalAddress(asset1.assetId);
    let changeAddressIdx =
      store.get('mantaAddresses')[INTERNAL_CHAIN_ID].length - 1;
    const changePath = `${MANTA_WALLET_BASE_PATH}/${INTERNAL_CHAIN_ID}/${changeAddressIdx}`;

    const params = this.api.createType('GeneratePrivateTransferDataParams', {
      asset_1_value: asset1.value,
      asset_2_value: asset2.value,
      asset_1_path: asset1.path,
      asset_2_path: asset2.path,
      asset_1_shard: ledgerState1,
      asset_2_shard: ledgerState2,
      change_path: changePath,
      non_change_output_value: spendAmount,
      change_output_value: changeAmount,
    });
    return params.toU8a();
  }

  async requestGeneratePrivateTransferPayloads(
    assetId,
    receivingAddress,
    privateTransferParamsList
  ) {
    const privateTransferParamsBatch = this.api.createType(
      'GeneratePrivateTransferBatchParams',
      {
        asset_id: assetId,
        receiving_address: base64Decode(receivingAddress),
        private_transfer_params_list: privateTransferParamsList,
      }
    );
    const res = await axios.post(
      'requestGeneratePrivateTransferData',
      privateTransferParamsBatch.toU8a()
    );
    const decoded = this.api.createType(
      'PrivateTransferDataBatch',
      base64Decode(res.data.private_transfer_data)
    );
    return decoded.private_transfer_data_list.map((data) => data.toU8a());
  }

  async generateReclaimParams(
    asset1,
    asset2,
    ledgerState1,
    ledgerState2,
    reclaimValue
  ) {
    this.generateNextInternalAddress(asset1.assetId);
    let changeAddressIdx =
      store.get('mantaAddresses')[INTERNAL_CHAIN_ID].length - 1;
    const changePath = `${MANTA_WALLET_BASE_PATH}/${INTERNAL_CHAIN_ID}/${changeAddressIdx}`;
    const params = this.api.createType('GenerateReclaimDataParams', {
      asset_1_value: asset1.value,
      asset_2_value: asset2.value,
      asset_1_path: asset1.path,
      asset_2_path: asset2.path,
      asset_1_shard: ledgerState1,
      asset_2_shard: ledgerState2,
      change_path: changePath,
      reclaim_value: reclaimValue,
    });

    return params.toU8a();
  }

  async requestGenerateReclaimPayloads(assetId, reclaimParamsList) {
    const reclaimParamsBatch = this.api.createType(
      'GenerateReclaimBatchParams',
      { asset_id: assetId, reclaim_params_list: reclaimParamsList }
    );
    const res = await axios.post(
      'requestGenerateReclaimData',
      reclaimParamsBatch.toU8a()
    );
    const decoded = this.api.createType(
      'ReclaimDataBatch',
      base64Decode(res.data.reclaim_data)
    );
    return decoded.reclaim_data_list.map((data) => data.toU8a());
  }
}