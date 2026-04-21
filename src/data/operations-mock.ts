export type ReturnStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Appealed"
  | "Refunded";

export type AgentReturnStatus =
  | "Pending pickup"
  | "Picked up"
  | "Returned to warehouse";

export interface ReturnRequest {
  id: string;
  orderId: string;
  product: string;
  buyer: string;
  reason: string;
  amount: number;
  date: string;
  status: ReturnStatus;
  adminNote?: string;
  appealNote?: string;
  assignedAgent?: string;
  agentStatus?: AgentReturnStatus;
  agentNotes?: Array<{ id: string; text: string; createdAt: string }>;
  proofImages?: Array<{ name: string; dataUrl: string }>;
  qrVerified?: boolean;
}

export type DeliveryStatus =
  | "Assigned"
  | "Picked up"
  | "In transit"
  | "Delivered"
  | "Failed";

export interface DeliveryOrder {
  id: string;
  orderId: string;
  customer: string;
  address: string;
  phone: string;
  items: string;
  amount: number;
  eta: string;
  status: DeliveryStatus;
  assignedAgent: string;
  distanceKm: number;
  products?: Array<{ name: string; qty: number; price: number; image?: string }>;
  agentNotes?: Array<{ id: string; text: string; createdAt: string }>;
  proofImages?: Array<{ name: string; dataUrl: string }>;
  qrVerified?: boolean;
}

export const deliveryAgents = [
  "Agent Thierry",
  "Agent Diane",
  "Agent Claude",
  "Agent Aline",
];

export const initialReturns: ReturnRequest[] = [
  {
    id: "RET-1001",
    orderId: "ORD-1101",
    product: "Organic Honey 500g",
    buyer: "Marcus Holloway",
    reason: "Damaged jar on delivery",
    amount: 12.5,
    date: "2026-03-20",
    status: "Pending",
    assignedAgent: "Agent Thierry",
    agentStatus: "Pending pickup",
  },
  {
    id: "RET-1002",
    orderId: "ORD-1102",
    product: "Dried Pineapple Pack",
    buyer: "Aline Uwera",
    reason: "Wrong product received",
    amount: 8.0,
    date: "2026-03-18",
    status: "Rejected",
    adminNote: "Evidence not sufficient.",
    assignedAgent: "Agent Thierry",
    agentStatus: "Picked up",
    agentNotes: [
      { id: "n-ret-1", text: "Reached customer location, waiting at reception.", createdAt: "2026-03-19T10:30:00.000Z" },
    ],
  },
  {
    id: "RET-1003",
    orderId: "ORD-1103",
    product: "Avocado Crate",
    buyer: "John Peter",
    reason: "Quality issues",
    amount: 15.0,
    date: "2026-03-16",
    status: "Appealed",
    appealNote: "I added new photos from the same day of delivery.",
    assignedAgent: "Agent Thierry",
    agentStatus: "Pending pickup",
  },
];

export const initialDeliveryOrders: DeliveryOrder[] = [
  {
    id: "DLV-1",
    orderId: "ORD-1101",
    customer: "Marcus Holloway",
    address: "KN 15 St, Kacyiru, Kigali",
    phone: "+250788111222",
    items: "2 items",
    amount: 34.5,
    eta: "10:30",
    status: "Assigned",
    assignedAgent: "Agent Thierry",
    distanceKm: 5.2,
    products: [
      { name: "Organic Honey 500g", qty: 1, price: 12.5, image: "/assets/products/placeholder.jpg" },
      { name: "Dried Pineapple Pack", qty: 1, price: 22.0, image: "/assets/products/placeholder.jpg" },
    ],
  },
  {
    id: "DLV-2",
    orderId: "ORD-1104",
    customer: "Ineza Claire",
    address: "KK 70 Ave, Gisozi, Kigali",
    phone: "+250788444555",
    items: "4 items",
    amount: 62.0,
    eta: "12:15",
    status: "In transit",
    assignedAgent: "Agent Thierry",
    distanceKm: 8.7,
    products: [
      { name: "Avocado Crate", qty: 2, price: 20, image: "/assets/products/placeholder.jpg" },
      { name: "Tea Bundle", qty: 1, price: 22, image: "/assets/products/placeholder.jpg" },
    ],
  },
];

export const partnerShowcase = [
  {
    id: "partner-1",
    name: "Rwanda Green Cooperative",
    type: "Cooperative",
    region: "Northern Province",
    members: "180+",
    since: "2019",
    image: "/assets/products/placeholder.jpg",
    shortInfo: "Cooperative supporting smallholder farmers with collective processing and market access.",
    description:
      "Farmer cooperative improving production quality and collective distribution.",
    whatTheyDo:
      "Aggregates produce from members, handles quality checks, and coordinates traceable fulfillment for export and local markets.",
    website: "https://example.org/green-coop",
    email: "contact@greencoop.example",
    phone: "+250788100200",
    links: ["https://x.com/green-coop", "https://linkedin.com/company/green-coop"],
  },
  {
    id: "partner-2",
    name: "EcoMove Logistics",
    type: "Logistics",
    region: "Kigali",
    members: "42 staff",
    since: "2021",
    image: "/assets/products/placeholder.jpg",
    shortInfo: "Cold-chain and last-mile logistics partner for perishables and bulk orders.",
    description:
      "Delivery and cold-chain logistics partner supporting last-mile operations.",
    whatTheyDo:
      "Provides route optimization, temperature-controlled transport, and delivery proof workflows for B2B and B2C.",
    website: "https://example.org/ecomove",
    email: "ops@ecomove.example",
    phone: "+250788333444",
    links: ["https://x.com/ecomove", "https://linkedin.com/company/ecomove"],
  },
];
