// @ts-nocheck
import React from 'react';
import PropTypes from 'prop-types';
import Select, { components } from 'react-select';
import { useTxStatus } from 'contexts/txStatusContext';
import AssetType from 'types/AssetType';
import classNames from 'classnames';
import Icon from 'components/Icon';

const AssetTypeSelectDropdown = ({
  assetType,
  assetTypeOptions,
  setSelectedAssetType
}) => {
  const { txStatus } = useTxStatus();
  const disabled = txStatus?.isProcessing();
  const dropdownOptions = assetTypeOptions?.map((assetType) => {
    return {
      id: `assetType_${assetType.ticker}`,
      key: assetType.assetId,
      label: assetType.ticker,
      value: assetType
    };
  });

  const onChangeAssetType = (option) => {
    if (option.value.assetId !== assetType.assetId) {
      setSelectedAssetType(option.value);
    }
  };

  return (
    <Select
      id="selectedAssetType"
      className={classNames(
        '!absolute right-1 manta-bg-gray rounded-lg whitespace-nowrap text-black dark:text-white',
        { disabled: disabled }
      )}
      isSearchable={false}
      value={assetType}
      onChange={onChangeAssetType}
      options={dropdownOptions}
      isDisabled={disabled}
      placeholder="--"
      styles={dropdownStyles(disabled)}
      components={{
        SingleValue: AssetTypeSingleValue,
        MenuList: AssetTypeMenuList,
        Option: AssetTypeOption,
        IndicatorSeparator: EmptyIndicatorSeparator
      }}
    />
  );
};

AssetTypeSelectDropdown.propTypes = {
  selectedOption: PropTypes.instanceOf(AssetType),
  setSelectedOption: PropTypes.func,
  optionsArePrivate: PropTypes.bool
};

const dropdownStyles = (disabled) => {
  const cursor = disabled ? 'not-allowed !important' : 'pointer';
  return {
    dropdownIndicator: () => ({ paddingRight: '1rem' }),
    control: (provided) => ({
      ...provided,
      borderStyle: 'none',
      borderWidth: '0px',
      borderRadius: '1rem',
      backgroundColor: 'transparent',
      paddingBottom: '0.5rem',
      paddingTop: '0.5rem',
      boxShadow: '0 0 #0000',
      display: 'flex',
      flexWrap: 'nowrap',
      alignItems: 'center',
      height: '56px',
      cursor: cursor
    }),
    option: () => ({
      marginTop: '0.3rem',
      fontSize: '12pt',
      lineHeight: '18px'
    }),
    valueContainer: () => ({
      minHeight: '2rem',
      minWidth: '75%',
      textAlign: 'center',
      display: 'flex',
      justifyContent: 'center'
    }),
    menu: (provided) => ({
      ...provided,
      width: '185%',
      top: '70px',
      borderRadius: '0.5rem',
      backgroundColor: 'transparent',

    }),
    menuList: () => ({
      paddingTop: '0px',
      paddingBottom: '0px',
    }),
    container: () => ({
      position: 'absolute'
    })
  };
};

const EmptyIndicatorSeparator = () => {
  return <div />;
};

const AssetTypeSingleValue = ({ data }) => {
  return (
    <div className="border-0 flex items-center gap-2">
      <Icon className="w-6 h-6 rounded-full" name={data.icon} />
      <div className="text-black dark:text-white place-self-center">
        {data.ticker}
      </div>
    </div>
  );
};

const AssetTypeOption = (props) => {
  const { value, innerProps } = props;

  return (
    <div {...innerProps}>
      <div
        id={value.ticker}
        className="flex items-center inline w-full hover:bg-dropdown-hover">
        <Icon className="ml-5 w-6 rounded-full" name={value?.icon} />
        <div className="p-2 pl-2.5 text-white">
          <components.Option {...props} />
          <div className="text-sm block text-white text-opacity-60">
            {value.name}
          </div>
        </div>
      </div>
    </div>
  );
};

const AssetTypeMenuList = (props) => {
  return (
    <components.MenuList {...props}>
      <div className="rounded-lg overflow-hidden divide-y divide-white-light border border-white-light bg-primary">
        {props.children}
      </div>
    </components.MenuList>
  );
};

export default AssetTypeSelectDropdown;
