type pagePath = 'stake' | 'bridge' | 'transact';

const pathMapToPageName = {
  stake: 'Staking',
  bridge: 'Bridge',
  transact: 'MantaPay'
};

const getPageName = () => {
  const pathname = window.location.pathname; // .e.g. /calamari/stake
  const pathArray= pathname.split('/'); // ['', 'calamari', 'stake']
  const pageType = pathArray[pathArray.length - 1] as pagePath;

  return pathMapToPageName[pageType] || pathMapToPageName.transact;
};

export default getPageName;
