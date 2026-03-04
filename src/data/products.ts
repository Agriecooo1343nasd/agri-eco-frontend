import type { Product } from "@/components/ProductCard";

// Using public paths for Next.js
const apples = "/assets/products/apples.jpg";
const broccoli = "/assets/products/broccoli.jpg";
const carrots = "/assets/products/carrots.jpg";
const tomatoes = "/assets/products/tomatoes.jpg";
const oranges = "/assets/products/oranges.jpg";
const spinach = "/assets/products/spinach.jpg";
const strawberries = "/assets/products/strawberries.jpg";
const bellPepper = "/assets/products/bell-pepper.jpg";
const honey = "/assets/products/honey.jpg";

export const products: Product[] = [
  {
    id: 1,
    name: "Fresh Organic Apples",
    price: 4.99,
    oldPrice: 6.99,
    image: apples,
    images: [apples, apples, apples],
    rating: 5,
    badge: "sale",
    category: "Fruits",
    unit: "kg",
    shortDescription:
      "Freshly picked organic apples from local orchards. Sweet, crunchy, and packed with nutrients.",
    longDescription:
      "Our organic apples are grown without synthetic pesticides or fertilizers in certified organic orchards. Each apple is hand-picked at peak ripeness to ensure the best flavor and texture. Perfect for snacking, baking in pies, or adding to salads. These apples are rich in fiber and vitamin C, making them a healthy choice for the whole family.",
    stock: 50,
    reviews: [
      {
        id: 1,
        user: "John Doe",
        rating: 5,
        date: "2024-03-15",
        comment: "The best apples I've had in a long time! So sweet and crisp.",
      },
      {
        id: 2,
        user: "Jane Smith",
        rating: 4,
        date: "2024-03-10",
        comment:
          "Very fresh and delicious, though some were smaller than expected.",
      },
    ],
  },
  {
    id: 2,
    name: "Organic Broccoli Florets",
    price: 3.49,
    image: broccoli,
    images: [broccoli, broccoli],
    rating: 4,
    badge: "organic",
    category: "Vegetables",
    unit: "bunch",
    shortDescription:
      "Nutrient-rich organic broccoli florets, perfect for steaming or stir-frying.",
    longDescription:
      "These organic broccoli florets are harvested fresh and delivered to your door. Broccoli is a superfood packed with vitamins K and C, folate, and potassium. It's versatile and can be enjoyed raw in salads, steamed as a side dish, or added to hearty stir-fries.",
    stock: 35,
    reviews: [
      {
        id: 1,
        user: "Alice Green",
        rating: 5,
        date: "2024-03-12",
        comment: "Extremely fresh and lasted a long time in the fridge.",
      },
    ],
  },
  {
    id: 3,
    name: "Farm Fresh Carrots",
    price: 2.99,
    oldPrice: 3.99,
    image: carrots,
    rating: 5,
    badge: "sale",
    category: "Vegetables",
    unit: "kg",
    shortDescription: "Sweet and crunchy farm-fresh carrots.",
    longDescription: "Naturally grown carrots with high beta-carotene content.",
    stock: 100,
  },
  {
    id: 4,
    name: "Vine Ripe Tomatoes",
    price: 5.49,
    image: tomatoes,
    rating: 4,
    badge: "new",
    category: "Vegetables",
    unit: "kg",
    shortDescription: "Juicy vine-ripened tomatoes.",
    longDescription:
      "Sun-ripened tomatoes with deep red color and intense flavor.",
    stock: 25,
  },
  {
    id: 5,
    name: "Sweet Valencia Oranges",
    price: 6.99,
    oldPrice: 8.99,
    image: oranges,
    rating: 5,
    badge: "sale",
    category: "Fruits",
    unit: "kg",
    shortDescription: "Succulent Valencia oranges.",
    longDescription: "Perfect for fresh juice or eating as a healthy snack.",
    stock: 40,
  },
  {
    id: 6,
    name: "Baby Spinach Leaves",
    price: 3.99,
    image: spinach,
    rating: 4,
    badge: "organic",
    category: "Vegetables",
    unit: "pack",
    shortDescription: "Tender organic baby spinach leaves.",
    longDescription:
      "Pre-washed and ready to eat. Great for salads and smoothies.",
    stock: 60,
  },
  {
    id: 7,
    name: "Organic Strawberries",
    price: 7.99,
    oldPrice: 9.99,
    image: strawberries,
    rating: 5,
    badge: "sale",
    category: "Fruits",
    unit: "box",
    shortDescription: "Sweet organic strawberries.",
    longDescription: "Plump and juicy strawberries grown organically.",
    stock: 15,
  },
  {
    id: 8,
    name: "Green Bell Pepper",
    price: 2.49,
    image: bellPepper,
    rating: 4,
    category: "Vegetables",
    unit: "piece",
    shortDescription: "Crisp green bell peppers.",
    longDescription: "Fresh bell peppers perfect for stuffing or salads.",
    stock: 80,
  },
  {
    id: 9,
    name: "Raw Organic Honey",
    price: 12.99,
    image: honey,
    rating: 5,
    badge: "organic",
    category: "Honey",
    unit: "jar",
    shortDescription: "Pure raw organic honey.",
    longDescription:
      "Locally sourced unprocessed honey with all its natural benefits.",
    stock: 20,
  },
  {
    id: 10,
    name: "Cherry Tomatoes Pack",
    price: 4.49,
    oldPrice: 5.99,
    image: tomatoes,
    rating: 4,
    badge: "sale",
    category: "Vegetables",
    unit: "pack",
    shortDescription: "Sweet cherry tomatoes.",
    longDescription: "Bursting with flavor, perfect for snacking.",
    stock: 45,
  },
];
