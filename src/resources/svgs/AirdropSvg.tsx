// @ts-nocheck
import React from 'react';
import PropTypes from 'prop-types';

const FaucetSvg = ({ className, fill }) => {
  return (
    <svg width="458.667" height="458.667" viewBox="0 0 344 344" preserveAspectRatio="xMidYMid meet" className={className}>
      <path d="M155.5 22.7C118.2 28.6 83.1 55.6 66 91.5c-7.2 15.1-12 34.9-12 49.4v6.3l26.3 32.9 26.2 32.8.5 53c.5 49.2.6 53.2 2.3 54.8 1.7 1.7 5.6 1.8 62.7 1.8s61-.1 62.7-1.8c1.7-1.6 1.8-5.6 2.3-54.8l.5-53 26.3-32.8 26.2-32.9v-6.3c0-9.1-2.5-23.3-6-34.2-12.4-38.8-45.1-70.7-83.5-81.4-7.6-2.1-11.6-2.5-25.5-2.8-9.1-.2-17.8-.1-19.5.2zm40.8 12.7c18.1 4.6 33.2 13.3 47.9 27.4 17.2 16.5 30.7 41.7 33.4 62.2l.7 5.3-3.9-2.7c-5.2-3.5-15.4-6.6-21.8-6.6-10.7 0-25.9 5.6-37.9 13.9l-4.4 3-5.9-4.5c-21.7-16.4-43.1-16.4-64.8 0l-5.8 4.4-6.9-4.5c-12-7.7-25.4-12.3-35.8-12.3-6.2 0-16.4 3.2-21.5 6.6l-3.9 2.7.7-5.3c2.7-20.4 16.3-45.7 33.2-62 17.6-16.9 37.4-26.9 59.6-30 9.8-1.4 26.4-.3 37.1 2.4zm-94.8 97.7c5.6 1.6 15 6.2 22 10.8l6 3.9 8.6 28.1 8.6 28.1h-16.8H113l-23.6-29.5c-23.5-29.4-23.6-29.6-21.8-31.6 2.8-3.1 9.9-7.8 14.2-9.4 4.6-1.7 14.3-1.9 19.7-.4zm86.5 2.8c7.2 3.7 15 9.6 15 11.4 0 .7-3.8 13.6-8.4 28.7l-8.4 27.5H172h-14.2l-8.4-27.5-8.4-28.7c0-2.6 13.9-11.8 21.7-14.3 1.5-.5 6.4-.8 10.8-.7 6.7.3 9 .8 14.5 3.6zm75.2-1.9c2.9 1.1 7.5 3.9 10.3 6.3l5 4.4-23.8 29.7-23.8 29.6h-16.8-16.8l8.6-28.1 8.6-28.1 6-3.9c17.1-11.3 30.7-14.4 42.7-9.9zM140 248.2c0 29.4.2 33.3 1.7 35 .9 1 2.3 1.8 3.1 1.8.9 0 7.3-3.4 14.4-7.6l12.8-7.6 12.8 7.6c7.1 4.2 13.5 7.6 14.4 7.6s2.4-.7 3.2-1.6c1.4-1.3 1.6-5.9 1.6-35V215h11 11v48.5V312h-54-54v-48.5V215h11 11v33.2zm53-6.2c0 14.8-.3 27-.6 27s-4.7-2.5-9.8-5.5c-5-3-9.8-5.5-10.6-5.5s-4 1.5-7 3.3l-10.2 6.1-4.8 2.8v-27.6V215h21.5H193v27z"/>
    </svg>
  );
};

FaucetSvg.propTypes = {
  className: PropTypes.string,
};

export default FaucetSvg;
