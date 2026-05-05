export interface ExpenseItem {
  id: string;
  name: string;
  quantity: number;
  rate: number;
  total: number;
  date: string;
  category?: string;
}

export interface CapitalCost {
  id: string;
  name: string;
  category?: string;
  acres?: number;
  rentPerAcre?: number;
  cost?: number;
  ownerName?: string;
  total: number;
  date: string;
}

export interface OtherExpense {
  id: string;
  details: string;
  amount: number;
  date: string;
}

export interface FishVariety {
  id: string;
  name: string;
  quantity: number;
}

export interface FishStock {
  id: string;
  pondNumber: string;
  date: string;
  varieties: FishVariety[];
}

export interface FishSeed {
  id: string;
  variety: string;
  quantity: number;
  pricePerSeed: number;
  total: number;
  date: string;
}

export interface FishSale {
  id: string;
  date: string;
  variety: string;
  fishCount: number;
  weightKg: number;
  ratePerKg: number;
  totalPrice: number;
  buyerName?: string;
}
