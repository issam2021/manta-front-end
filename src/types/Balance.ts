import Decimal from 'decimal.js';
import BN from 'bn.js';
import AssetType from './AssetType';
import Usd from './Usd';
export default class Balance {
  assetType: AssetType;
  valueAtomicUnits: BN;

  constructor(assetType: AssetType, valueAtomicUnits: BN) {
    this.assetType = assetType;
    this.valueAtomicUnits = valueAtomicUnits;
  }

  static Native(config: object, valueAtomicUnits: BN) {
    return new Balance(AssetType.Native(config), valueAtomicUnits);
  }

  valueOverExistentialDeposit(): Balance {
    const existentialDeposit = new Balance(
      this.assetType,
      this.assetType.existentialDeposit
    );
    const value = this.sub(existentialDeposit);
    const zero = new Balance(this.assetType, new BN(0));
    return Balance.max(value, zero);
  }

  static fromBaseUnits(assetType: AssetType, valueBaseUnits: Decimal): Balance {
    const atomicUnitsPerBaseUnit = new Decimal(10).pow(
      new Decimal(assetType.numberOfDecimals)
    );
    const valueAtomicUnits = atomicUnitsPerBaseUnit
      .mul(new Decimal(valueBaseUnits.toString()))
      .floor();
    // This conversion to BN doesn't work if our valueAtomicUnits Decimal
    // is formatted as an exponent
    Decimal.set({ toExpPos: 1000 });
    return new Balance(assetType, new BN(valueAtomicUnits.toString()));
  }

  valueBaseUnits(): Decimal {
    const balanceAtomicUnitsDecimal = new Decimal(
      this.valueAtomicUnits.toString()
    );
    const atomicUnitsPerBaseUnit = new Decimal(10).pow(
      new Decimal(this.assetType.numberOfDecimals)
    );
    const valueBaseUnits = balanceAtomicUnitsDecimal.div(
      new Decimal(atomicUnitsPerBaseUnit)
    );
    return valueBaseUnits;
  }

  toString(decimals = 3) {
    return this.valueBaseUnits()
      .toDecimalPlaces(decimals, Decimal.ROUND_DOWN)
      .toString();
  }

  toStringUnrounded(): string {
    return this.valueBaseUnits().toDecimalPlaces(this.assetType.numberOfDecimals, Decimal.ROUND_DOWN).toString();
  }

  toDisplayString(decimals = 3, roundDown = true): string {
    const _valueBaseUnits = this.valueBaseUnits();
    if (_valueBaseUnits.gt(0) && _valueBaseUnits.lt(0.01)) {
      return `< 0.01 ${this.assetType.ticker}`;
    }
    const rounding = roundDown ? Decimal.ROUND_DOWN : Decimal.ROUND_UP;
    return `${_valueBaseUnits
      .toDecimalPlaces(decimals, rounding)
      .toNumber()
      .toLocaleString(undefined, {
        maximumFractionDigits: decimals,
        minimumFractionDigits: 0
      })} ${this.assetType.ticker}`;
  }

  toFeeDisplayString(): string {
    return this.toDisplayString(6, false);
  }

  toUsd(usdPerToken: Usd): Usd {
    return new Usd(this.valueBaseUnits().mul(usdPerToken.value));
  }

  eq(other: Balance): boolean {
    if (this.assetType.assetId !== other.assetType.assetId) {
      throw new Error('Cannot compare different asset types');
    }
    return this.valueAtomicUnits.eq(other.valueAtomicUnits);
  }

  gt(other: Balance): boolean {
    if (this.assetType.assetId !== other.assetType.assetId) {
      throw new Error('Cannot compare different asset types');
    }
    return this.valueAtomicUnits.gt(other.valueAtomicUnits);
  }

  gte(other: Balance): boolean {
    if (this.assetType.assetId !== other.assetType.assetId) {
      throw new Error('Cannot compare different asset types');
    }
    return this.valueAtomicUnits.gte(other.valueAtomicUnits);
  }

  lt(other: Balance): boolean {
    if (this.assetType.assetId !== other.assetType.assetId) {
      throw new Error('Cannot compare different asset types');
    }
    return this.valueAtomicUnits.lt(other.valueAtomicUnits);
  }

  lte(other: Balance): boolean {
    if (this.assetType.assetId !== other.assetType.assetId) {
      throw new Error('Cannot compare different asset types');
    }
    return this.valueAtomicUnits.lte(other.valueAtomicUnits);
  }

  sub(other: Balance): Balance {
    if (this.assetType.assetId !== other.assetType.assetId) {
      throw new Error('Cannot subtract different asset types');
    }
    const value = this.valueAtomicUnits.sub(other.valueAtomicUnits);
    return new Balance(this.assetType, value);
  }

  add(other: Balance): Balance {
    if (this.assetType.assetId !== other.assetType.assetId) {
      throw new Error('Cannot add different asset types');
    }
    const value = this.valueAtomicUnits.add(other.valueAtomicUnits);
    return new Balance(this.assetType, value);
  }

  mul(num: BN): Balance {
    const value = this.valueAtomicUnits.mul(num);
    return new Balance(this.assetType, value);
  }

  div(num: BN): Balance {
    const value = this.valueAtomicUnits.div(num);
    return new Balance(this.assetType, value);
  }

  static max(a: Balance, b: Balance): Balance {
    if (a.assetType.assetId !== b.assetType.assetId) {
      throw new Error('Cannot compare different asset types');
    }
    const value = BN.max(a.valueAtomicUnits, b.valueAtomicUnits);
    return new Balance(a.assetType, value);
  }
}
