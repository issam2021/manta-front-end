import { usePublicAccount } from 'contexts/publicAccountContext';
import { ReactNode } from 'react';

const ALink = ({ children }: { children: ReactNode }) => (
  <a
    href="https://npo.manta.network"
    className="py-3 w-1/3  text-white text-opacity-60 text-center hover:text-white hover:text-opacity-100 hover:font-bold"
    target="_blank"
    rel="noreferrer">
    {children}
  </a>
);
const NavNPO = () => {
  const { externalAccount } = usePublicAccount();
  if (!externalAccount) {
    return <ALink>NPO</ALink>;
  }
  return (
    <div className="group relative">
      <span className={'cursor-pointer text-white text-opacity-100 font-bold'}>
        NPO
      </span>
      <div className="hidden absolute pt-7 top-0 left-1/2 transform -translate-x-1/2  w-32 group-hover:block">
        <ul className="p-4 text-center bg-nav rounded-lg rounded-t-none">
          <li className="mb-4">
            <ALink>Projects</ALink>
          </li>
          <li>
            <ALink>My zkNFTs</ALink>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default NavNPO;
