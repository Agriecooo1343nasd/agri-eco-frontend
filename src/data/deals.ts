export interface Deal {
  id: string;
  title: string;
  description: string;
  image: string;
  discount: string;
  badge: string;
  /** Product IDs included in this deal */
  productIds: number[];
  endsAt: string;
}

// Mock deals removed to use backend data
export const deals: Deal[] = [];
