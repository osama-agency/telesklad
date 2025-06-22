export type Currency = 'RUB' | 'TRY';

export interface CurrencyAmount {
  value: number;
  currency: Currency;
  displayValue: string;
  convertedValue?: {
    value: number;
    currency: Currency;
    rate: number;
    displayValue: string;
  };
}

export interface ExchangeRate {
  currency: Currency;
  rate: number;
  rateWithBuffer: number;
  effectiveDate: Date;
  source: string;
}

export interface PurchaseItemPrice {
  originalAmount: number;
  originalCurrency: Currency;
  rubAmount: number;
  tryAmount?: number;
  exchangeRate?: number;
  displayFormat: 'primary' | 'both' | 'converted';
}