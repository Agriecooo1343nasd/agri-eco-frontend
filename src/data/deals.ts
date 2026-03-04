// Using public paths for Next.js
const categoryFruits = "/assets/category-fruits.jpg";
const categoryVegetables = "/assets/category-vegetables.jpg";
const categoryJuices = "/assets/category-juices.jpg";
const honey = "/assets/products/honey.jpg";

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

export const deals: Deal[] = [
  {
    id: "summer-fruits",
    title: "Summer Fruits Festival",
    description:
      "Get the freshest organic fruits at unbeatable prices. Hand-picked apples, juicy oranges, and plump strawberries — all at up to 30% off!",
    image: categoryFruits,
    discount: "Up to 30% OFF",
    badge: "Hot Deal",
    productIds: [1, 5, 7],
    endsAt: "2026-04-15",
  },
  {
    id: "veggie-bundle",
    title: "Farm-Fresh Veggie Bundle",
    description:
      "Stock up on the finest organic vegetables. From crunchy carrots to vibrant bell peppers, save big on your daily greens.",
    image: categoryVegetables,
    discount: "Up to 25% OFF",
    badge: "Limited Time",
    productIds: [2, 3, 4, 6, 8, 10],
    endsAt: "2026-03-30",
  },
  {
    id: "golden-honey",
    title: "Golden Honey Special",
    description:
      "Pure, raw organic honey directly from local beekeepers. A jar of nature's sweetest gift at a special price.",
    image: honey,
    discount: "15% OFF",
    badge: "New Deal",
    productIds: [9],
    endsAt: "2026-05-01",
  },
  {
    id: "healthy-juice",
    title: "Fresh-Pressed Juice Deals",
    description:
      "Start your day right with our organic juice collection. Made from 100% natural fruits and vegetables, no additives.",
    image: categoryJuices,
    discount: "Buy 2 Get 1 Free",
    badge: "Exclusive",
    productIds: [1, 5, 7, 3],
    endsAt: "2026-04-10",
  },
];
