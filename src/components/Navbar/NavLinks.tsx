import classNames from 'classnames';
import { dolphinConfig } from 'config';
import { useConfig } from 'contexts/configContext';
import { NavLink } from 'react-router-dom';
import NavNPO from './NavNPO';

const NAVLINKPATH = {
  Transact: '/transact',
  Bridge: '/bridge',
  Stake: '/stake'
};

const NavLinks = () => {
  const { NETWORK_NAME } = useConfig();
  const networkUrlParam = `/${NETWORK_NAME.toLowerCase()}`;

  const isDolphinPage = NETWORK_NAME === dolphinConfig.NETWORK_NAME;
  const isActiveTransactPage = window.location.pathname.includes(
    NAVLINKPATH.Transact
  );
  const isActiveBridgePage = window.location.pathname.includes(
    NAVLINKPATH.Bridge
  );
  const isActiveStakePage = window.location.pathname.includes(
    NAVLINKPATH.Stake
  );
  return (
    <div
      className={`ml-5 flex flex-row justify-between ${
        isDolphinPage ? 'w-96' : 'w-128'
      }  shadow-2xl items-center text-sm font-red-hat-text`}>
      <NavLink
        to={`${networkUrlParam}${NAVLINKPATH.Transact}`}
        className={classNames(
          'py-3 text-white text-opacity-60 text-center hover:text-white hover:text-opacity-100',
          {
            ' text-white text-opacity-100': isActiveTransactPage
          }
        )}>
        MantaPay
      </NavLink>
      <NavLink
        to={`${networkUrlParam}${NAVLINKPATH.Bridge}`}
        className={classNames(
          'py-3 text-white text-opacity-60 text-center hover:text-white hover:text-opacity-100',
          {
            'text-white text-opacity-100': isActiveBridgePage
          }
        )}>
        Bridge
      </NavLink>
      {!isDolphinPage && <NavNPO />}

      {!isDolphinPage && (
        <NavLink
          to={`${networkUrlParam}${NAVLINKPATH.Stake}`}
          className={classNames(
            'py-3 text-white text-opacity-60 text-center hover:text-white hover:text-opacity-100',
            {
              ' text-white text-opacity-100': isActiveStakePage
            }
          )}>
          Staking
        </NavLink>
      )}
      <a
        href="https://forum.manta.network/"
        className="py-3 text-white text-opacity-60 text-center hover:text-white hover:text-opacity-100"
        target="_blank"
        rel="noreferrer">
        Govern
      </a>
      <a
        href={`https://${NETWORK_NAME.toLowerCase()}.subscan.io/`}
        className="py-3 text-white text-opacity-60 text-center hover:text-white hover:text-opacity-100"
        target="_blank"
        rel="noreferrer">
        Block Explorer
      </a>
    </div>
  );
};

export default NavLinks;
