import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

function AssociatedBridges() {
  const [open, setOpen] = useState(true);
  const toggleStatus = () => {
    setOpen((prev) => !prev);
  };
  const Content = () => {
    return (
      <div className="-mt-2">
        <div className="text-gray2 leading-4 text-xss mb-2">
          To move assets from other chains to Calamari Network, first bridge
          those assets to Karura, and then transfer them using the Manta Bridge.
        </div>
        <a
          href="https://apps.karura.network/bridge"
          target="_blank"
          className="text-sm text-link2 hover:text-link2"
          rel="noreferrer">
          Karura Bridge
        </a>
        <div className="text-gray2 leading-4 text-xss mt-2 mb-4">
          Karura Bridge enables smooth asset transfers between Kusama parachains
          and Ethereum. Calamari supports the following assets from Karura
          Bridge:{' '}
          <span className="text-light-yellow">
            USDC and DAI from Ethereum, USDT from Statemine.
          </span>
        </div>
      </div>
    );
  };
  return (
    <>
      <div className="text-white w-120 -ml-8 text-base leading-5">
        Associated Bridge
      </div>
      <div className="text-white bg-secondary px-4 border border-white-light rounded-lg -mt-2">
        <div className="w-120">
          <button
            className="flex items-center justify-between w-full py-4"
            onClick={toggleStatus}>
            <div className="text-sm">Karura Chain</div>
            <div className="text-white opacity-40 ml-4">
              <FontAwesomeIcon icon={open ? faAngleUp : faAngleDown} />
            </div>
          </button>
          {open && <Content />}
        </div>
      </div>
    </>
  );
}

export default AssociatedBridges;
