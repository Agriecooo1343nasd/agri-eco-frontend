// Public images paths for Next.js
const cultural = "/assets/tours/cultural.jpg";
const farmTour = "/assets/tours/farm-tour.jpg";
const beekeeping = "/assets/tours/beekeeping.jpg";
const waxWorkshop = "/assets/tours/wax-workshop.jpg";

export interface Artisan {
  id: string;
  name: string;
  specialty: string;
  image: string;
  description: string;
  location: string;
  products: ArtisanProduct[];
  story: string;
  featured: boolean;
}

export interface ArtisanProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
}

export interface Partner {
  id: string;
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  type: "tourism-operator" | "hotel" | "restaurant" | "school" | "ngo";
  status: "active" | "pending" | "inactive";
  commissionRate: number;
  totalBookings: number;
  totalRevenue: number;
  joinedDate: string;
  packages: PartnerPackage[];
}

export interface PartnerPackage {
  id: string;
  name: string;
  description: string;
  tourIds: string[];
  price: number;
  active: boolean;
}

export const artisans: Artisan[] = [
  {
    id: "art-1",
    name: "Vestine Mukamana",
    specialty: "Basket Weaving (Agaseke)",
    image: cultural,
    description:
      "Master weaver preserving Rwanda's iconic peace basket tradition. Each basket takes 2-3 weeks to complete using locally sourced sisal and raffia.",
    location: "Musanze District",
    story:
      "Vestine learned basket weaving from her grandmother at age 8. Today, she leads a cooperative of 15 women artisans, creating traditional Agaseke baskets that symbolize peace and unity in Rwandan culture.",
    featured: true,
    products: [
      {
        id: "ap-1",
        name: "Traditional Agaseke Peace Basket",
        price: 25000,
        image: cultural,
        description: "Handwoven peace basket with geometric patterns",
      },
      {
        id: "ap-2",
        name: "Decorative Wall Basket Set",
        price: 45000,
        image: cultural,
        description: "Set of 3 colorful wall-hanging baskets",
      },
      {
        id: "ap-3",
        name: "Storage Basket with Lid",
        price: 18000,
        image: cultural,
        description: "Practical woven basket with fitted lid",
      },
    ],
  },
  {
    id: "art-2",
    name: "Emmanuel Nshimiyimana",
    specialty: "Wood Carving",
    image: farmTour,
    description:
      "Traditional wood carver creating functional and decorative pieces from sustainably harvested local hardwoods.",
    location: "Musanze District",
    story:
      "Emmanuel transforms fallen trees into works of art. His carvings tell stories of Rwandan wildlife and daily life, each piece taking days of careful hand-carving using traditional tools passed down through generations.",
    featured: true,
    products: [
      {
        id: "ap-4",
        name: "Carved Gorilla Sculpture",
        price: 35000,
        image: farmTour,
        description: "Hand-carved mountain gorilla from local wood",
      },
      {
        id: "ap-5",
        name: "Wooden Serving Bowl Set",
        price: 22000,
        image: farmTour,
        description: "Set of 3 hand-carved serving bowls",
      },
    ],
  },
  {
    id: "art-3",
    name: "Claudine Nyiransabimana",
    specialty: "Pottery & Ceramics",
    image: waxWorkshop,
    description:
      "Potter crafting traditional Rwandan cooking vessels and modern decorative ceramics using local clay.",
    location: "Musanze District",
    story:
      "Claudine's pottery connects ancient Rwandan craftsmanship with contemporary design. She sources clay from the shores of Lake Kivu and fires her pieces in a traditional wood-burning kiln.",
    featured: true,
    products: [
      {
        id: "ap-6",
        name: "Traditional Cooking Pot (Inkono)",
        price: 15000,
        image: waxWorkshop,
        description: "Authentic clay cooking pot for traditional dishes",
      },
      {
        id: "ap-7",
        name: "Decorative Ceramic Vase",
        price: 28000,
        image: waxWorkshop,
        description: "Hand-thrown vase with traditional motifs",
      },
      {
        id: "ap-8",
        name: "Ceramic Mug Set",
        price: 20000,
        image: waxWorkshop,
        description: "Set of 4 handmade ceramic mugs",
      },
    ],
  },
  {
    id: "art-4",
    name: "Jean de Dieu Habimana",
    specialty: "Beeswax Candles & Skincare",
    image: beekeeping,
    description:
      "Artisan creating pure beeswax candles, balms, and natural skincare products from our farm's apiary.",
    location: "Agri-Eco Farm",
    story:
      "Using beeswax from Agri-Eco's own hives, Jean de Dieu creates hand-poured candles and all-natural skincare products. His lip balms and hand creams use only farm-grown herbs and essential oils.",
    featured: false,
    products: [
      {
        id: "ap-9",
        name: "Beeswax Candle Set (3-pack)",
        price: 18000,
        image: beekeeping,
        description: "Hand-poured pure beeswax candles",
      },
      {
        id: "ap-10",
        name: "Natural Lip Balm Trio",
        price: 8000,
        image: beekeeping,
        description: "3 flavors: honey, eucalyptus, lemongrass",
      },
      {
        id: "ap-11",
        name: "Beeswax Hand Cream",
        price: 12000,
        image: beekeeping,
        description: "Moisturizing cream with shea butter & beeswax",
      },
    ],
  },
];

export const partners: Partner[] = [
  {
    id: "p-1",
    businessName: "Rwanda Explorer Tours",
    contactPerson: "Patrick Habimana",
    email: "patrick@rwandaexplorer.com",
    phone: "+250 733 789 012",
    type: "tourism-operator",
    status: "active",
    commissionRate: 12,
    totalBookings: 48,
    totalRevenue: 3840000,
    joinedDate: "2025-06-15",
    packages: [
      {
        id: "pkg-1",
        name: "Gorilla & Farm Adventure",
        description:
          "2-day package combining gorilla trekking with farm experience",
        tourIds: ["tour-1", "tour-3"],
        price: 250000,
        active: true,
      },
      {
        id: "pkg-2",
        name: "Cultural Immersion Week",
        description: "5-day deep dive into Rwandan culture and organic farming",
        tourIds: ["tour-1", "tour-4", "tour-6"],
        price: 450000,
        active: true,
      },
    ],
  },
  {
    id: "p-2",
    businessName: "Kigali Marriott Hotel",
    contactPerson: "Aline Uwase",
    email: "aline@kigalimarriott.com",
    phone: "+250 722 456 789",
    type: "hotel",
    status: "active",
    commissionRate: 10,
    totalBookings: 32,
    totalRevenue: 2560000,
    joinedDate: "2025-08-01",
    packages: [
      {
        id: "pkg-3",
        name: "Hotel + Farm Day Trip",
        description: "Luxury hotel stay with included farm tour excursion",
        tourIds: ["tour-1"],
        price: 180000,
        active: true,
      },
    ],
  },
  {
    id: "p-3",
    businessName: "Green Garden Restaurant",
    contactPerson: "Chef Mutesi",
    email: "mutesi@greengarden.rw",
    phone: "+250 788 654 321",
    type: "restaurant",
    status: "active",
    commissionRate: 8,
    totalBookings: 15,
    totalRevenue: 975000,
    joinedDate: "2025-10-01",
    packages: [],
  },
  {
    id: "p-4",
    businessName: "Volcanoes Safari Lodge",
    contactPerson: "David Karenzi",
    email: "david@volcanosafari.com",
    phone: "+250 788 111 333",
    type: "hotel",
    status: "pending",
    commissionRate: 10,
    totalBookings: 0,
    totalRevenue: 0,
    joinedDate: "2026-03-01",
    packages: [],
  },
];
