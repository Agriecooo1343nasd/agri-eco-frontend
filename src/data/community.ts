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
  status: "active" | "pending" | "rejected";
  phone?: string;
  email?: string;
  appliedDate?: string;
  approvedDate?: string;
}

export interface ArtisanProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  artisanId?: string;
  stock?: number;
  category?: string;
}

export interface ArtisanApplication {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  specialty: string;
  experience: string;
  bio: string;
  portfolioDescription: string;
  status: "pending" | "approved" | "rejected";
  appliedDate: string;
  reviewedDate?: string;
  reviewNotes?: string;
}

export interface Partner {
  id: string;
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  type: "tourism-operator" | "hotel" | "restaurant" | "school" | "ngo";
  aboutBusiness: string;
  status: "active" | "pending" | "inactive" | "terminated";
  networkStatus: "onboarding" | "verified" | "at-risk" | "suspended";
  commissionRate: number;
  partnerSharePercent: number;
  platformSharePercent: number;
  grossRevenue: number;
  partnerEarnings: number;
  platformEarnings: number;
  payoutCycle: "weekly" | "monthly" | "quarterly";
  payoutStatus: "paid" | "pending" | "on-hold";
  lastPayoutDate?: string;
  totalBookings: number;
  totalRevenue: number;
  joinedDate: string;
  contractStartDate?: string;
  contractEndDate?: string;
  notes?: string;
  agreements: PartnerAgreement[];
  packages: PartnerPackage[];
  payouts?: PartnerPayoutRecord[];
}

export interface PartnerAgreement {
  id: string;
  title: string;
  status: "active" | "expired" | "terminated";
  version: string;
  effectiveDate: string;
  endDate?: string;
  termsSummary: string;
  updatedAt: string;
  commissionRate?: number;
  partnerSharePercent?: number;
  platformSharePercent?: number;
}

export interface PartnerPayoutRecord {
  id: string;
  amount: number;
  date: string;
  period: string;
  agreementId?: string;
  agreementTitle?: string;
  status: "paid" | "pending" | "failed";
  notes?: string;
}

export interface PartnerApplication {
  id: string;
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  type: "tourism-operator" | "hotel" | "restaurant" | "school" | "ngo";
  aboutBusiness: string;
  status: "pending" | "approved" | "rejected";
  appliedDate: string;
  reviewedDate?: string;
  reviewNotes?: string;
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
    status: "active",
    phone: "+250 788 123 456",
    email: "vestine@example.com",
    appliedDate: "2025-03-10",
    approvedDate: "2025-03-15",
    products: [
      {
        id: "ap-1",
        name: "Traditional Agaseke Peace Basket",
        price: 25000,
        image: cultural,
        description: "Handwoven peace basket with geometric patterns",
        artisanId: "art-1",
        stock: 12,
        category: "Baskets",
      },
      {
        id: "ap-2",
        name: "Decorative Wall Basket Set",
        price: 45000,
        image: cultural,
        description: "Set of 3 colorful wall-hanging baskets",
        artisanId: "art-1",
        stock: 8,
        category: "Baskets",
      },
      {
        id: "ap-3",
        name: "Storage Basket with Lid",
        price: 18000,
        image: cultural,
        description: "Practical woven basket with fitted lid",
        artisanId: "art-1",
        stock: 15,
        category: "Baskets",
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
    status: "active",
    phone: "+250 788 234 567",
    email: "emmanuel@example.com",
    appliedDate: "2025-04-01",
    approvedDate: "2025-04-05",
    products: [
      {
        id: "ap-4",
        name: "Carved Gorilla Sculpture",
        price: 35000,
        image: farmTour,
        description: "Hand-carved mountain gorilla from local wood",
        artisanId: "art-2",
        stock: 5,
        category: "Sculptures",
      },
      {
        id: "ap-5",
        name: "Wooden Serving Bowl Set",
        price: 22000,
        image: farmTour,
        description: "Set of 3 hand-carved serving bowls",
        artisanId: "art-2",
        stock: 10,
        category: "Kitchenware",
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
    status: "active",
    phone: "+250 788 345 678",
    email: "claudine@example.com",
    appliedDate: "2025-05-10",
    approvedDate: "2025-05-14",
    products: [
      {
        id: "ap-6",
        name: "Traditional Cooking Pot (Inkono)",
        price: 15000,
        image: waxWorkshop,
        description: "Authentic clay cooking pot for traditional dishes",
        artisanId: "art-3",
        stock: 20,
        category: "Pottery",
      },
      {
        id: "ap-7",
        name: "Decorative Ceramic Vase",
        price: 28000,
        image: waxWorkshop,
        description: "Hand-thrown vase with traditional motifs",
        artisanId: "art-3",
        stock: 6,
        category: "Pottery",
      },
      {
        id: "ap-8",
        name: "Ceramic Mug Set",
        price: 20000,
        image: waxWorkshop,
        description: "Set of 4 handmade ceramic mugs",
        artisanId: "art-3",
        stock: 14,
        category: "Pottery",
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
    status: "active",
    phone: "+250 788 456 789",
    email: "jeandedieu@example.com",
    appliedDate: "2025-06-01",
    approvedDate: "2025-06-05",
    products: [
      {
        id: "ap-9",
        name: "Beeswax Candle Set (3-pack)",
        price: 18000,
        image: beekeeping,
        description: "Hand-poured pure beeswax candles",
        artisanId: "art-4",
        stock: 25,
        category: "Candles",
      },
      {
        id: "ap-10",
        name: "Natural Lip Balm Trio",
        price: 8000,
        image: beekeeping,
        description: "3 flavors: honey, eucalyptus, lemongrass",
        artisanId: "art-4",
        stock: 40,
        category: "Skincare",
      },
      {
        id: "ap-11",
        name: "Beeswax Hand Cream",
        price: 12000,
        image: beekeeping,
        description: "Moisturizing cream with shea butter & beeswax",
        artisanId: "art-4",
        stock: 30,
        category: "Skincare",
      },
    ],
  },
];

export const artisanApplications: ArtisanApplication[] = [
  {
    id: "app-1",
    fullName: "Alice Uwimana",
    email: "alice@example.com",
    phone: "+250 788 555 111",
    location: "Kigali",
    specialty: "Textile Weaving",
    experience:
      "8 years of traditional textile weaving, trained at Rwanda Arts Initiative",
    bio: "I create vibrant textiles using natural dyes and traditional Rwandan patterns. My work blends modern fashion with ancestral techniques.",
    portfolioDescription:
      "Collection of hand-dyed scarves, table runners, and wall hangings using locally sourced cotton and natural plant dyes.",
    status: "pending",
    appliedDate: "2026-03-01",
  },
  {
    id: "app-2",
    fullName: "Patrick Mugisha",
    email: "patrick.m@example.com",
    phone: "+250 788 555 222",
    location: "Huye District",
    specialty: "Leather Crafting",
    experience:
      "12 years crafting leather goods, apprenticeship under master craftsman",
    bio: "From wallets to bags, I work with locally tanned leather to create durable, beautiful pieces that tell a story of Rwandan craftsmanship.",
    portfolioDescription:
      "Handmade leather bags, belts, wallets, and sandals using vegetable-tanned leather from local tanneries.",
    status: "pending",
    appliedDate: "2026-03-05",
  },
  {
    id: "app-3",
    fullName: "Grace Ingabire",
    email: "grace.i@example.com",
    phone: "+250 788 555 333",
    location: "Rubavu District",
    specialty: "Jewelry Making",
    experience:
      "5 years creating jewelry from recycled materials and natural stones",
    bio: "I transform recycled brass, copper, and semi-precious stones from the Rwandan hills into unique jewelry pieces.",
    portfolioDescription:
      "Earrings, necklaces, bracelets, and rings made from recycled metals and locally sourced stones.",
    status: "approved",
    appliedDate: "2026-02-15",
    reviewedDate: "2026-02-20",
    reviewNotes:
      "Excellent portfolio. Strong alignment with our sustainability values.",
  },
  {
    id: "app-4",
    fullName: "Samuel Ntezimana",
    email: "samuel.n@example.com",
    phone: "+250 788 555 444",
    location: "Nyagatare",
    specialty: "Bamboo Crafts",
    experience: "3 years working with bamboo furniture and decor",
    bio: "I craft eco-friendly furniture and home decor from sustainably harvested bamboo.",
    portfolioDescription:
      "Bamboo chairs, lampshades, picture frames, and small tables.",
    status: "rejected",
    appliedDate: "2026-02-10",
    reviewedDate: "2026-02-18",
    reviewNotes:
      "Portfolio needs more development. Encouraged to reapply in 6 months.",
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
    aboutBusiness:
      "A Kigali-based tour operator building agritourism and conservation itineraries for regional and international travelers.",
    status: "active",
    networkStatus: "verified",
    commissionRate: 12,
    partnerSharePercent: 88,
    platformSharePercent: 12,
    grossRevenue: 3840000,
    partnerEarnings: 3379200,
    platformEarnings: 460800,
    payoutCycle: "monthly",
    payoutStatus: "paid",
    lastPayoutDate: "2026-03-05",
    totalBookings: 48,
    totalRevenue: 3840000,
    joinedDate: "2025-06-15",
    contractStartDate: "2025-06-15",
    contractEndDate: "2027-06-14",
    notes: "Top-performing adventure package partner.",
    agreements: [
      {
        id: "agr-1",
        title: "Primary Distribution Agreement",
        status: "active",
        version: "v2.1",
        effectiveDate: "2025-06-15",
        endDate: "2027-06-14",
        termsSummary:
          "Revenue-share agreement for farm tours and bundled cultural experiences.",
        updatedAt: "2026-01-10",
      },
    ],
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
    payouts: [
      {
        id: "pay-1-1",
        amount: 584200,
        date: "2026-03-05",
        period: "March 2026",
        agreementId: "agr-1",
        agreementTitle: "Primary Distribution Agreement",
        status: "paid",
        notes: "Monthly payout via bank transfer.",
      },
      {
        id: "pay-1-2",
        amount: 1050000,
        date: "2026-02-28",
        period: "February 2026",
        agreementId: "agr-1",
        agreementTitle: "Primary Distribution Agreement",
        status: "paid",
      },
      {
        id: "pay-1-3",
        amount: 925000,
        date: "2026-01-31",
        period: "January 2026",
        agreementId: "agr-1",
        agreementTitle: "Primary Distribution Agreement",
        status: "paid",
      },
      {
        id: "pay-1-4",
        amount: 820000,
        date: "2025-12-31",
        period: "December 2025",
        agreementId: "agr-1",
        agreementTitle: "Primary Distribution Agreement",
        status: "paid",
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
    aboutBusiness:
      "Business hotel in Kigali offering premium accommodation and curated local tourism experiences.",
    status: "active",
    networkStatus: "verified",
    commissionRate: 10,
    partnerSharePercent: 90,
    platformSharePercent: 10,
    grossRevenue: 2560000,
    partnerEarnings: 2304000,
    platformEarnings: 256000,
    payoutCycle: "monthly",
    payoutStatus: "pending",
    lastPayoutDate: "2026-02-28",
    totalBookings: 32,
    totalRevenue: 2560000,
    joinedDate: "2025-08-01",
    contractStartDate: "2025-08-01",
    contractEndDate: "2026-08-01",
    agreements: [
      {
        id: "agr-2",
        title: "Corporate Co-Marketing Agreement",
        status: "active",
        version: "v1.4",
        effectiveDate: "2025-08-01",
        endDate: "2026-08-01",
        termsSummary:
          "Joint campaign and referral agreement for hospitality + farm day trips.",
        updatedAt: "2025-12-04",
      },
    ],
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
    payouts: [
      {
        id: "pay-2-1",
        amount: 954000,
        date: "2026-02-28",
        period: "February 2026",
        agreementId: "agr-2",
        agreementTitle: "Corporate Co-Marketing Agreement",
        status: "pending",
        notes: "Pending partner confirmation.",
      },
      {
        id: "pay-2-2",
        amount: 750000,
        date: "2026-01-31",
        period: "January 2026",
        agreementId: "agr-2",
        agreementTitle: "Corporate Co-Marketing Agreement",
        status: "paid",
      },
      {
        id: "pay-2-3",
        amount: 600000,
        date: "2025-12-31",
        period: "December 2025",
        agreementId: "agr-2",
        agreementTitle: "Corporate Co-Marketing Agreement",
        status: "paid",
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
    aboutBusiness:
      "Farm-to-table restaurant focused on organic menus and local producer networks.",
    status: "active",
    networkStatus: "verified",
    commissionRate: 8,
    partnerSharePercent: 92,
    platformSharePercent: 8,
    grossRevenue: 975000,
    partnerEarnings: 897000,
    platformEarnings: 78000,
    payoutCycle: "monthly",
    payoutStatus: "paid",
    lastPayoutDate: "2026-03-03",
    totalBookings: 15,
    totalRevenue: 975000,
    joinedDate: "2025-10-01",
    contractStartDate: "2025-10-01",
    contractEndDate: "2026-10-01",
    agreements: [
      {
        id: "agr-3",
        title: "Referral & Catering Collaboration",
        status: "active",
        version: "v1.2",
        effectiveDate: "2025-10-01",
        endDate: "2026-10-01",
        termsSummary:
          "Mutual referral and event catering collaboration for community events.",
        updatedAt: "2026-02-02",
      },
    ],
    packages: [
      {
        id: "pkg-4",
        name: "Farm-to-Table Evening",
        description: "Evening dining package featuring local farm ingredients",
        tourIds: ["tour-4"],
        price: 120000,
        active: true,
      },
    ],
    payouts: [
      {
        id: "pay-3-1",
        amount: 97000,
        date: "2026-03-03",
        period: "March 2026",
        agreementId: "agr-3",
        agreementTitle: "Referral & Catering Collaboration",
        status: "paid",
      },
      {
        id: "pay-3-2",
        amount: 420000,
        date: "2026-02-28",
        period: "February 2026",
        agreementId: "agr-3",
        agreementTitle: "Referral & Catering Collaboration",
        status: "paid",
      },
      {
        id: "pay-3-3",
        amount: 380000,
        date: "2026-01-31",
        period: "January 2026",
        agreementId: "agr-3",
        agreementTitle: "Referral & Catering Collaboration",
        status: "paid",
      },
    ],
  },
  {
    id: "p-4",
    businessName: "Volcanoes Safari Lodge",
    contactPerson: "David Karenzi",
    email: "david@volcanosafari.com",
    phone: "+250 788 111 333",
    type: "hotel",
    aboutBusiness:
      "Eco-lodge near Volcanoes National Park serving sustainability-focused travelers.",
    status: "pending",
    networkStatus: "onboarding",
    commissionRate: 10,
    partnerSharePercent: 90,
    platformSharePercent: 10,
    grossRevenue: 0,
    partnerEarnings: 0,
    platformEarnings: 0,
    payoutCycle: "monthly",
    payoutStatus: "pending",
    totalBookings: 0,
    totalRevenue: 0,
    joinedDate: "2026-03-01",
    contractStartDate: "2026-03-01",
    contractEndDate: "2027-03-01",
    agreements: [
      {
        id: "agr-4",
        title: "Onboarding MOU",
        status: "active",
        version: "v0.9",
        effectiveDate: "2026-03-01",
        termsSummary:
          "Preliminary onboarding terms pending full commercial agreement.",
        updatedAt: "2026-03-01",
      },
    ],
    packages: [
      {
        id: "pkg-5",
        name: "Volcanoes Eco Retreat",
        description:
          "2-night eco retreat with guided sustainable tourism activities",
        tourIds: ["tour-3"],
        price: 300000,
        active: false,
      },
    ],
    payouts: [],
  },
];

export const partnerApplications: PartnerApplication[] = [
  {
    id: "partner-app-1",
    businessName: "Akagera Student Expeditions",
    contactPerson: "Alice Mukarwego",
    email: "alice@akageraexpeditions.rw",
    phone: "+250 788 778 901",
    type: "school",
    aboutBusiness:
      "Educational travel organizer building curriculum-linked field trips for schools.",
    status: "pending",
    appliedDate: "2026-03-08",
  },
  {
    id: "partner-app-2",
    businessName: "Roots Community Foundation",
    contactPerson: "Emmanuel Ntaganda",
    email: "partnerships@rootsfoundation.org",
    phone: "+250 788 440 224",
    type: "ngo",
    aboutBusiness:
      "Community organization supporting farmer training and youth agribusiness programs.",
    status: "approved",
    appliedDate: "2026-02-20",
    reviewedDate: "2026-02-25",
    reviewNotes:
      "Strong alignment with community objectives and regional programs.",
  },
  {
    id: "partner-app-3",
    businessName: "Kigali Downtown Bistro",
    contactPerson: "Yvette Uwimana",
    email: "yvette@downtownbistro.rw",
    phone: "+250 788 090 300",
    type: "restaurant",
    aboutBusiness:
      "Urban bistro interested in recurring farm produce procurement and culinary tours.",
    status: "rejected",
    appliedDate: "2026-02-14",
    reviewedDate: "2026-02-18",
    reviewNotes:
      "Business profile is promising, but requires stronger compliance details before onboarding.",
  },
];
