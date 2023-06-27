# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2022-06-16

### Added

- [\#145](https://github.com/Manta-Network/manta-front-end/pull/145) Distinguish longer-lasting initial sync from subsequent syncs in UI text
- [\#145](https://github.com/Manta-Network/manta-front-end/pull/145) Add loading animation to '...' text while private balances are syncing to chain
- [\#138](https://github.com/Manta-Network/manta-front-end/pull/138) / [\#160](https://github.com/Manta-Network/manta-front-end/pull/160) Support end-to-end testing by adding metadata to front end components
- [\#126](https://github.com/Manta-Network/manta-front-end/pull/126) Add bug report link to sidebar
- [\#154](https://github.com/Manta-Network/manta-front-end/pull/154) Add versioning rules to readme
- [\#164](https://github.com/Manta-Network/manta-front-end/pull/164) Add downtime modal
- [\#134](https://github.com/Manta-Network/manta-front-end/pull/134) Persist and load privacy toggle / asset selection

### Changed

- [\#141](https://github.com/Manta-Network/manta-front-end/pull/141) Sync to chain more quickly and efficiently using new RPC

### Fixed

- [\#142](https://github.com/Manta-Network/manta-front-end/pull/142) Prevent stale balances from displaying after a transaction while waiting for wallet synchronization
- [\#152](https://github.com/Manta-Network/manta-front-end/pull/152) Add staging branch to CI/CD pipeline

## [2.2.0] - 2022-07-6

### Fixed

- [\#187](https://github.com/Manta-Network/manta-front-end/pull/187) Updates the front end to use the new pull RPC interface, which makes the front end compatible with the current runtime, and reduces wallet sync times
- [\#187](https://github.com/Manta-Network/manta-front-end/pull/187) Fixes a bug such that dolphin public balances won't load

## [2.3.0] - 2022-07-8

### Changed

- [\#184](https://github.com/Manta-Network/manta-front-end/pull/184) Moved inline SVGs to their own files
- [\#176](https://github.com/Manta-Network/manta-front-end/pull/176) Vertically and horizontally centered page content

### Fixed

- [\#183](https://github.com/Manta-Network/manta-front-end/pull/183) Fixed Send Max Amount warning for DOL, which was stretching out the UI for 2 or 3 pixels only on firefox
- [\#183](https://github.com/Manta-Network/manta-front-end/pull/183) Fixed Dolphin icon missing piece
- [\#188](https://github.com/Manta-Network/manta-front-end/pull/188) Fixed sidebar menu disappearing on smaller screens
- [\#182](https://github.com/Manta-Network/manta-front-end/pull/182) Fixed autocomplete getting discolored under some conditions

## [3.0.0] - 2022-10-5

### Added

- [\#252](https://github.com/Manta-Network/manta-front-end/pull/252) Added Calamari staking page and support for multiple networks

## [3.0.1] - 2022-10-11

### Added

- [\#270](https://github.com/Manta-Network/manta-front-end/pull/270) Display previous round rewards and APY estimates adjusted for collator performance on the staking page

## [3.0.2] - 2022-10-12

### Fixed

- [\#272](https://github.com/Manta-Network/manta-front-end/pull/272) Prevent error when user is staked to a node that left the set of collator candidates

## [3.0.3] - 2022-10-19

### Fixed

- [\#275](https://github.com/Manta-Network/manta-front-end/pull/275) Fix display issue on widescreens; fix failure to connect to Talisman wallet

## [3.0.4] - 2022-10-22

### Fixed

- [\#281](https://github.com/Manta-Network/manta-front-end/pull/281) Prevent excess api calls when initializing wallet

## [3.1.0] - 2022-10-28

### Added

- [\#249](https://github.com/Manta-Network/manta-front-end/pull/249) Add FAQ links to missing required software modal
- [\#271](https://github.com/Manta-Network/manta-front-end/pull/271) Display user balance in staking modal; add APY estimates to staking table; add link to collator onboarding docs to staking UI
- [\#273](https://github.com/Manta-Network/manta-front-end/pull/273) Add secondary menu containing social and documentation links + theme toggle

### Changed

- [\#208](https://github.com/Manta-Network/manta-front-end/pull/208) Display transaction success modal when transaction is in block instead of finalized
- [\#210](https://github.com/Manta-Network/manta-front-end/pull/210) Add ids for e2e automation
- [\#235](https://github.com/Manta-Network/manta-front-end/pull/235) Change text displayed while node is syncing
- [\#271](https://github.com/Manta-Network/manta-front-end/pull/271) Show only active collators by default on staking page; reduce staking page width to improve UX on smaller screens

### Removed

- [\#227](https://github.com/Manta-Network/manta-front-end/pull/227) Remove gh-pages dependency target

### Fixed

- [\#228](https://github.com/Manta-Network/manta-front-end/pull/228) Prevent loader and initial sync text from displaying if polkadot.js api becomes disconnected
- [\#259](https://github.com/Manta-Network/manta-front-end/pull/259) Fix typescript type annotation compilation for files with `.ts` extension
- [\#271](https://github.com/Manta-Network/manta-front-end/pull/271) Fix issue with URL parameters being ignored before '#'

### Security

- [\#198](https://github.com/Manta-Network/manta-front-end/pull/198) Bump react-router-dom from 5.3.3 to 6.3.0 (required refactoring of breaking API changes)
- [\#201](https://github.com/Manta-Network/manta-front-end/pull/201) Bump @craco/craco from 6.4.3 to 6.4.5
- [\#117](https://github.com/Manta-Network/manta-front-end/pull/117) Bump node-sass from 6.0.1 to 7.0.1

## [3.1.1] - 2022-12-02

### Added

- [\#310](https://github.com/Manta-Network/manta-front-end/pull/310) Added name for a collator

## [3.1.2] - 2022-12-15

### Changed

- [\#331](https://github.com/Manta-Network/manta-front-end/pull/331) Added or changed names for several collators

## [4.0.0] - 2022-12-21

### Added

- [\#318](https://github.com/Manta-Network/manta-front-end/pull/318) Bridge page; support testnet v3 private payments
- [\#304](https://github.com/Manta-Network/manta-front-end/pull/304) New public wallet connection workflow; support for Talisman, SubWallet, and Metamask (on bridge page only)
- [\#242](https://github.com/Manta-Network/manta-front-end/pull/242) zkAccount display

### Changed

- [\#320](https://github.com/Manta-Network/manta-front-end/pull/320) UI redesign

## [4.0.1] - 2023-1-17

### Added

- [\#342](https://github.com/Manta-Network/manta-front-end/pull/342) Add link to web3go on the staking page
- [\#332](https://github.com/Manta-Network/manta-front-end/pull/332) Add name for a collator
- [\#349](https://github.com/Manta-Network/manta-front-end/pull/349) Add warning when users are about to send so much Dolphin to private that they will be unable to pay transaction fees

### Fixed

- [\#340](https://github.com/Manta-Network/manta-front-end/pull/340) Give wallets in connect wallet modal more accurate names
- [\#351](https://github.com/Manta-Network/manta-front-end/pull/351) Allow wallets and Manta Signer to connect even when user is not connected to a node.
- [\#354](https://github.com/Manta-Network/manta-front-end/pull/354) Change text to clarify what is happening when private balances are loading; add text to clarify what Metamask is for
- [\#352](https://github.com/Manta-Network/manta-front-end/pull/352) Fix long load times for bridge page balances

## [4.0.2] - 2023-1-19

### Added

- [\#364](https://github.com/Manta-Network/manta-front-end/pull/364) Display connection errors on zkTransact and Bridge pages

### Fixed

- [\#359](https://github.com/Manta-Network/manta-front-end/pull/359) Cancel transaction error toast now says "Transaction declined" rather than "Transaction failed"

### Changed

- [\#353](https://github.com/Manta-Network/manta-front-end/pull/353) Wallet modal closes upon connection to a wallet
- [\#355](https://github.com/Manta-Network/manta-front-end/pull/355) Refactored icons

## [4.0.3] - 2023-2-14

### Fixed

- [\#369](https://github.com/Manta-Network/manta-front-end/pull/369) Fix bridge page balance not refreshing
- [\#368](https://github.com/Manta-Network/manta-front-end/pull/368) Fix p0x labs footer text and link
- [\#337](https://github.com/Manta-Network/manta-front-end/pull/337) Remove block explorer links from tx success notifications for internal testnet parachains

### Changed

- [\#367](https://github.com/Manta-Network/manta-front-end/pull/367) Change Dolphin home page to zkTransact

## [4.0.4] - 2023-2-22

### Fixed

- [\#416](https://github.com/Manta-Network/manta-front-end/pull/416) Prevent loader from showing indefinitely if the node becomes disconnected during a transaction
- [\#417](https://github.com/Manta-Network/manta-front-end/pull/417) Fix capitalization of "MetaMask"; tweak fee warning text
- [\#431](https://github.com/Manta-Network/manta-front-end/pull/431) Allow users to close the chain select dropdown by clicking it again
- [\#439](https://github.com/Manta-Network/manta-front-end/pull/439) Prevent failed transactions from showing both "Transaction failed" and "Transaction succeeded" notifications
- [\#441](https://github.com/Manta-Network/manta-front-end/pull/441) Prevent zkAddress from displaying in zkAccount modal after the account is deleted in Manta Signer

### Removed

- [\#430](https://github.com/Manta-Network/manta-front-end/pull/430) Removed autocomplete from form inputs

### Changed

- [\#360](https://github.com/Manta-Network/manta-front-end/pull/360) Restyle UI, particularly chain selector and fonts

### Added

- [\#432](https://github.com/Manta-Network/manta-front-end/pull/432) Added fee depletion warning for public transfers of DOL
- [\#487](https://github.com/Manta-Network/manta-front-end/pull/487) Show private transaction history in zkAccount modal

## [4.1.0] - 2023-3-10

### Fixed

- [\#685](https://github.com/Manta-Network/manta-front-end/pull/684) Fix downtime modal discord link

### Changed

- [\#684](https://github.com/Manta-Network/manta-front-end/pull/684) Update manta.js to v3.0.0

## [5.0.0] - 2023-3-14

### Fixed

- [\#440](https://github.com/Manta-Network/manta-front-end/pull/440) Fix small balances appearing as "0" in zkAccount modal
- [\#442](https://github.com/Manta-Network/manta-front-end/pull/442) Remove addresses from the address select dropdown if permission is revoked in the wallet browser extension
- [\#438](https://github.com/Manta-Network/manta-front-end/pull/438) Prevents users from inputing more decimals than possible for assets on the Bridge and ZkTransact pages
- [\#438](https://github.com/Manta-Network/manta-front-end/pull/438) Displays the amount to be sent without rounding on the ZkTransact page
- [\#543](https://github.com/Manta-Network/manta-front-end/pull/543) Prevent error when ETH accounts are injected from Talisman wallet
- [\#614](https://github.com/Manta-Network/manta-front-end/pull/614) Prevent user from highlighting chain selector text, zkAccount button text, and public wallet button text
- [\#612](https://github.com/Manta-Network/manta-front-end/pull/612) Prevent enkrypt wallet accounts from appearing under other wallets
- [\#610](https://github.com/Manta-Network/manta-front-end/pull/610) Prevent users from clicking the button to publish transactions while balances are loading on the MantaPay page
- [\#580](https://github.com/Manta-Network/manta-front-end/pull/580) Allow users to see their zkAddress even when a node is not connected
- [\#632](https://github.com/Manta-Network/manta-front-end/pull/632) Prevent success notifications from showing after a transaction is interrupted by a network disconnection
- [\#637](https://github.com/Manta-Network/manta-front-end/pull/637) Show that zkAssets are loading inside the zkAccount modal during the initial sync
- [\#652](https://github.com/Manta-Network/manta-front-end/pull/652) Use lower fee estimates for Calamari than for Dolphin
- [\#653](https://github.com/Manta-Network/manta-front-end/pull/653) Prevent staked balances from being included in MantaPay public balances
- [\#644](https://github.com/Manta-Network/manta-front-end/pull/644) Prevent Calamari and Dolphin private transaction history from appearing under the wrong network
- [\#718](https://github.com/Manta-Network/manta-front-end/pull/718) Prevent MOVR transactions less than the minimum of 0.1

### Changed

- [\#546](https://github.com/Manta-Network/manta-front-end/pull/546) Hide private transaction history older than 6 months
- [\#613](https://github.com/Manta-Network/manta-front-end/pull/613) Restyle the address copy icon in the zkAccount modal
- [\#629](https://github.com/Manta-Network/manta-front-end/pull/629) Replace tabbed menu with navlinks
- [\#646](https://github.com/Manta-Network/manta-front-end/pull/646) Change fonts on staking page
- [\#666](https://github.com/Manta-Network/manta-front-end/pull/666) Change styles on staking page and bridge page

### Added

- [\#493](https://github.com/Manta-Network/manta-front-end/pull/493) Remember and default to the most recently used account for each public wallet
- [\#483](https://github.com/Manta-Network/manta-front-end/pull/483) Instruct users to create an account in Tallisman if no account exists
- [\#594](https://github.com/Manta-Network/manta-front-end/pull/594) Set bridge form to the most recently selected chains on page load
- [\#643](https://github.com/Manta-Network/manta-front-end/pull/643) Prevent users in restricted geographies from using MantaPay on Calamari
- [\#644](https://github.com/Manta-Network/manta-front-end/pull/644) Enable MantaPay and Bridge pages on Calamari

## [5.0.1] - 2023-3-15

### Added

- [\#711](https://github.com/Manta-Network/manta-front-end/pull/711) Add Giant Squid activity banner

## [5.0.2] - 2023-3-15

### Fixed

- [\#751](https://github.com/Manta-Network/manta-front-end/pull/751) Remove country-level IP blocking from all pages except MantaPay on Calamari
- [\#742](https://github.com/Manta-Network/manta-front-end/pull/742) Stop blocking Hong Kong and Macau IPs

## [5.0.3] - 2023-3-15

### Fixed

- [\#755](https://github.com/Manta-Network/manta-front-end/pull/755) Fix dotmenu content height style

## [5.0.4] - 2023-3-28

### Fixed

- [\#829](https://github.com/Manta-Network/manta-front-end/pull/829) Fix a single disconnected network on Bridge Page from preventing all transactions
- [\#753](https://github.com/Manta-Network/manta-front-end/pull/753) Fix a single disconnected network on Bridge Page from preventing all transactions

### Added

- [\#753](https://github.com/Manta-Network/manta-front-end/pull/753) Enable Karura on Calamari MantaPay and Bridge Page
- [\#821](https://github.com/Manta-Network/manta-front-end/pull/821) Allow users to connect a source account when sending to or from Moonriver by clicking on button next to the address input form
- [\#754](https://github.com/Manta-Network/manta-front-end/pull/754) Get Coingecko asset prices in USD by querying our own proxy server that holds an API key, instead of using the public Coingecko endpoint.

## [5.1.0] - 2023-4-11

### Fixed

- [\#872](https://github.com/Manta-Network/manta-front-end/pull/872) Fix bug preventing bridging between Kusama and Calamari

## [5.1.1] - 2023-4-18

### Fixed

- [\#908](https://github.com/Manta-Network/manta-front-end/pull/908) Fix Calamari websocket

## [6.0.0] - 2023-4-25

### Added

- [\#873](https://github.com/Manta-Network/manta-front-end/pull/873) Support both Manta Wallet and Manta Signer for MantaPay on Calamari

## [6.0.1] - 2023-4-26

### Added

- [\#988](https://github.com/Manta-Network/manta-front-end/pull/988) Add Trading Incentive activity banner

## [6.0.2] - 2023-5-17

### Changed

- [\#999](https://github.com/Manta-Network/manta-front-end/pull/999) Update fathom tracking
- [\#1022](https://github.com/Manta-Network/manta-front-end/pull/1022) Updates private transaction history in Manta Wallet
- [\#1025](https://github.com/Manta-Network/manta-front-end/pull/1025) Update gas fee estimate

### Added

- [\#1034](https://github.com/Manta-Network/manta-front-end/pull/1034) Add mantaWallet.subscribeAccounts api/Add MantaWallet update notification and change network notification

## [6.0.3] - 2023-5-24

### Changed

- [\#1075](https://github.com/Manta-Network/manta-front-end/pull/1075) Fix signAndSend nonce

## [6.0.4] - 2023-6-06

### Fixed

- [\#1090](https://github.com/Manta-Network/manta-front-end/pull/1090) Fix error building transactions while in Manta Signer mode
- [\#1099](https://github.com/Manta-Network/manta-front-end/pull/1099) Possibly fix issue with wallet not connecting in some inconsistent cases (can't reproduce)
- [\#1078](https://github.com/Manta-Network/manta-front-end/pull/1078) Subscribe to Manta Wallet accounts

## [6.0.5] - 2023-6-14

### Fixed

- [\#1111](https://github.com/Manta-Network/manta-front-end/pull/1111) Fix staking rewards decimals

## [6.0.6] - 2023-6-21

### Added

- [\#1118](https://github.com/Manta-Network/manta-front-end/pull/1118) Add Trading Incentive Activity New Banner

## [6.0.7] - 2023-6-26

### Fixed

- [\#1128](https://github.com/Manta-Network/manta-front-end/pull/1128) `return unsub()` => `return () => unsub()`

## [6.0.8] - 2023-6-27

### Fixed

- [\#1131](https://github.com/Manta-Network/manta-front-end/pull/1131) Fix bridging and bridge transaction fee estimation
