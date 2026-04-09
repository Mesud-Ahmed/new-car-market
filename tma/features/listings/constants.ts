export const ADMIN_USER_ID = 5040963728;
export const DEALER_PHONE = '+251911461574';
export const TELEGRAM_USER_HEADER = 'x-telegram-user-id';

export const DEFAULT_MAX_PRICE = 5_000_000;
export const MIN_PRICE = 1_000_000;
export const MAX_PRICE = 50_000_000;
export const PRICE_STEP = 500_000;

export const FUEL_FILTER_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' },
] as const;
