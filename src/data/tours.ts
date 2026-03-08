export type TourCategory =
  | "farm-tour"
  | "beekeeping"
  | "harvesting"
  | "cultural"
  | "educational"
  | "farm-stay"
  | "workshop";

export type TourStatus = "available" | "limited" | "sold-out" | "upcoming";

export interface TimeSlot {
  id: string;
  time: string;
  capacity: number;
  booked: number;
}

export interface TourAccommodation {
  id: string;
  name: string;
  type: "standard" | "premium" | "family";
  pricePerNight: number;
  capacity: number;
  available: boolean;
  description: string;
}

export interface Tour {
  id: string;
  name: string;
  slug: string;
  category: TourCategory;
  description: string;
  longDescription: string;
  image: string;
  gallery: string[];
  duration: string;
  price: number;
  groupPrice?: number;
  maxParticipants: number;
  minParticipants: number;
  rating: number;
  reviewCount: number;
  status: TourStatus;
  seasonal: boolean;
  season?: string;
  includes: string[];
  highlights: string[];
  requirements: string[];
  location: string;
  timeSlots: TimeSlot[];
  accommodation?: TourAccommodation[];
  cancellationPolicy: string;
  featured: boolean;
  createdAt: string;
}

export interface Booking {
  id: string;
  tourId: string;
  tourName: string;
  tourImage: string;
  date: string;
  timeSlot: string;
  participants: number;
  isGroup: boolean;
  groupName?: string;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "waitlisted";
  accommodation?: { name: string; nights: number; pricePerNight: number };
  specialRequirements?: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  bookingRef: string;
  createdAt: string;
  paymentMethod: string;
}

// Public images paths for Next.js
const farmTour = "/assets/tours/farm-tour.jpg";
const beekeeping = "/assets/tours/beekeeping.jpg";
const harvesting = "/assets/tours/harvesting.jpg";
const cultural = "/assets/tours/cultural.jpg";
const farmstay = "/assets/tours/farmstay.jpg";
const educational = "/assets/tours/educational.jpg";
const waxWorkshop = "/assets/tours/wax-workshop.jpg";

export const tours: Tour[] = [
  {
    id: "tour-1",
    name: "Guided Organic Farm Tour",
    slug: "guided-organic-farm-tour",
    category: "farm-tour",
    description:
      "Explore our 50-acre certified organic farm with an expert guide. See sustainable farming techniques in action.",
    longDescription:
      "Immerse yourself in the beauty and science of organic agriculture on our comprehensive guided farm tour. Walk through our terraced hillside plots, learn about companion planting, natural pest management, and soil regeneration techniques that have been practiced for generations. Our knowledgeable guides share the story of Rwandan agricultural heritage while demonstrating modern organic methods aligned with MINAGRI's PSTA5 strategic plan.",
    image: farmTour,
    gallery: [farmTour, harvesting, educational],
    duration: "3 hours",
    price: 25000,
    groupPrice: 18000,
    maxParticipants: 20,
    minParticipants: 1,
    rating: 4.9,
    reviewCount: 127,
    status: "available",
    seasonal: false,
    includes: [
      "Expert guide",
      "Organic snack tasting",
      "Farm map",
      "Souvenir seeds packet",
      "Refreshments",
    ],
    highlights: [
      "50-acre organic farm walkthrough",
      "Terraced hillside farming",
      "Composting & soil health station",
      "Organic certification process explained",
      "Photo opportunities",
    ],
    requirements: [
      "Comfortable walking shoes",
      "Sun protection",
      "Camera recommended",
    ],
    location: "Agri-Eco Farm, Musanze District, Rwanda",
    timeSlots: [
      { id: "ts-1a", time: "08:00 AM", capacity: 20, booked: 14 },
      { id: "ts-1b", time: "10:30 AM", capacity: 20, booked: 20 },
      { id: "ts-1c", time: "02:00 PM", capacity: 20, booked: 8 },
    ],
    accommodation: [
      {
        id: "acc-1",
        name: "Garden View Cottage",
        type: "standard",
        pricePerNight: 45000,
        capacity: 2,
        available: true,
        description: "Cozy cottage overlooking the organic gardens",
      },
      {
        id: "acc-2",
        name: "Hillside Lodge",
        type: "premium",
        pricePerNight: 75000,
        capacity: 2,
        available: true,
        description: "Spacious lodge with panoramic valley views",
      },
      {
        id: "acc-3",
        name: "Family Farmhouse",
        type: "family",
        pricePerNight: 95000,
        capacity: 6,
        available: false,
        description: "Full farmhouse with kitchen, perfect for families",
      },
    ],
    cancellationPolicy:
      "Free cancellation up to 48 hours before. 50% refund within 24 hours. No refund for no-shows.",
    featured: true,
    createdAt: "2025-01-15",
  },
  {
    id: "tour-2",
    name: "Beekeeping Discovery Experience",
    slug: "beekeeping-discovery",
    category: "beekeeping",
    description:
      "Get up close with our honey bees. Learn hive management, honey extraction, and taste raw organic honey varieties.",
    longDescription:
      "Step into the fascinating world of apiculture with our immersive beekeeping experience. Suited up in full protective gear, you'll open active hives alongside our master beekeeper, observe colony behavior, and learn about the vital role bees play in organic farming. The experience culminates with a honey tasting session featuring our seasonal varieties—eucalyptus, wildflower, and coffee blossom honey.",
    image: beekeeping,
    gallery: [beekeeping, waxWorkshop],
    duration: "2.5 hours",
    price: 30000,
    groupPrice: 22000,
    maxParticipants: 12,
    minParticipants: 1,
    rating: 4.8,
    reviewCount: 89,
    status: "available",
    seasonal: true,
    season: "March - November (Active season)",
    includes: [
      "Full protective gear",
      "Honey tasting (5 varieties)",
      "200g honey jar to take home",
      "Beekeeping guide booklet",
    ],
    highlights: [
      "Live hive inspection",
      "Queen bee spotting",
      "Honey extraction demonstration",
      "Raw honey tasting",
      "Take-home honey jar",
    ],
    requirements: [
      "No bee allergies",
      "Long pants recommended",
      "Minimum age: 8 years",
    ],
    location: "Agri-Eco Apiary, Musanze District, Rwanda",
    timeSlots: [
      { id: "ts-2a", time: "09:00 AM", capacity: 12, booked: 10 },
      { id: "ts-2b", time: "01:00 PM", capacity: 12, booked: 5 },
    ],
    cancellationPolicy:
      "Free cancellation up to 48 hours before. No refund within 24 hours due to limited capacity.",
    featured: true,
    createdAt: "2025-02-01",
  },
  {
    id: "tour-3",
    name: "Harvest & Cook Experience",
    slug: "harvest-and-cook",
    category: "harvesting",
    description:
      "Pick your own organic vegetables and cook a traditional Rwandan meal with our farm chef.",
    longDescription:
      "This hands-on experience combines the joy of harvesting with the art of traditional Rwandan cuisine. Begin in the fields selecting the freshest seasonal produce—tomatoes, beans, amaranth greens, sweet potatoes, and herbs. Then move to our open-air farm kitchen where Chef Mutesi guides you through preparing an authentic meal using only ingredients you've just picked.",
    image: harvesting,
    gallery: [harvesting, farmTour],
    duration: "4 hours",
    price: 35000,
    groupPrice: 28000,
    maxParticipants: 15,
    minParticipants: 2,
    rating: 5.0,
    reviewCount: 63,
    status: "available",
    seasonal: true,
    season: "Year-round (menu varies by season)",
    includes: [
      "Harvesting baskets & tools",
      "Full cooking class",
      "Traditional lunch",
      "Recipe card set",
      "Drinks",
    ],
    highlights: [
      "Pick-your-own produce",
      "Traditional cooking techniques",
      "Open-air farm kitchen",
      "Full meal with local beer/juice",
      "Recipe cards to take home",
    ],
    requirements: [
      "Comfortable clothing",
      "Closed-toe shoes",
      "Dietary needs communicated in advance",
    ],
    location: "Agri-Eco Farm Kitchen, Musanze District, Rwanda",
    timeSlots: [
      { id: "ts-3a", time: "09:00 AM", capacity: 15, booked: 15 },
      { id: "ts-3b", time: "02:00 PM", capacity: 15, booked: 7 },
    ],
    cancellationPolicy:
      "Free cancellation up to 72 hours before due to food preparation requirements.",
    featured: true,
    createdAt: "2025-01-20",
  },
  {
    id: "tour-4",
    name: "Rwandan Cultural Immersion",
    slug: "rwandan-cultural-immersion",
    category: "cultural",
    description:
      "Experience traditional dance, music, storytelling, and crafts with local community members.",
    longDescription:
      "Dive deep into Rwanda's rich cultural heritage through this immersive half-day experience. Local community elders share traditional stories and songs, while dancers perform the iconic Intore warrior dance. Participate in craft workshops including basket weaving (agaseke) and pottery, and learn about the deep connection between Rwandan culture and sustainable agriculture.",
    image: cultural,
    gallery: [cultural],
    duration: "5 hours",
    price: 40000,
    groupPrice: 32000,
    maxParticipants: 30,
    minParticipants: 4,
    rating: 4.7,
    reviewCount: 45,
    status: "available",
    seasonal: false,
    includes: [
      "Cultural performances",
      "Craft workshop materials",
      "Traditional lunch",
      "Handmade souvenir",
      "Photo opportunities",
    ],
    highlights: [
      "Intore dance performance",
      "Agaseke basket weaving",
      "Traditional storytelling",
      "Community lunch",
      "Live drumming session",
    ],
    requirements: ["Respectful attire", "Open mind and heart"],
    location: "Agri-Eco Community Center, Musanze District, Rwanda",
    timeSlots: [{ id: "ts-4a", time: "09:00 AM", capacity: 30, booked: 18 }],
    cancellationPolicy:
      "Free cancellation up to 48 hours before. 50% refund within 24 hours.",
    featured: false,
    createdAt: "2025-03-01",
  },
  {
    id: "tour-5",
    name: "School Educational Farm Visit",
    slug: "school-educational-visit",
    category: "educational",
    description:
      "Curriculum-aligned farm visit for schools. Students learn about organic farming, ecology, and sustainability.",
    longDescription:
      "Designed in partnership with Rwandan educators, this program brings classroom learning to life. Students explore soil science, plant biology, water management, and the food chain through hands-on activities across the farm. Age-appropriate content is available for primary and secondary levels, with pre-visit and post-visit teaching materials provided to schools.",
    image: educational,
    gallery: [educational, farmTour],
    duration: "Full day (6 hours)",
    price: 8000,
    groupPrice: 5000,
    maxParticipants: 50,
    minParticipants: 10,
    rating: 4.9,
    reviewCount: 34,
    status: "available",
    seasonal: false,
    includes: [
      "Curriculum-aligned activities",
      "Student workbook",
      "Organic lunch",
      "Teacher resource pack",
      "Certificate of participation",
    ],
    highlights: [
      "Soil science station",
      "Plant biology lab",
      "Water cycle demonstration",
      "Composting workshop",
      "Farm animal interaction",
    ],
    requirements: [
      "Advance booking required (2 weeks)",
      "Teacher supervision",
      "School uniform or comfortable clothing",
    ],
    location: "Agri-Eco Farm, Musanze District, Rwanda",
    timeSlots: [{ id: "ts-5a", time: "08:30 AM", capacity: 50, booked: 30 }],
    cancellationPolicy:
      "Free cancellation up to 1 week before. 50% refund within 3 days.",
    featured: false,
    createdAt: "2025-02-15",
  },
  {
    id: "tour-6",
    name: "Farm Stay & Sunrise Experience",
    slug: "farm-stay-sunrise",
    category: "farm-stay",
    description:
      "Spend the night at our eco-lodge and wake up to a guided sunrise walk through the misty farm hills.",
    longDescription:
      "Disconnect from the city and reconnect with nature during an overnight stay at our eco-friendly farm accommodations. Enjoy a farm-to-table dinner, stargazing session, and wake up to a magical guided sunrise walk through the misty terraced hills. This experience includes a full organic breakfast and a morning farm tour.",
    image: farmstay,
    gallery: [farmstay, farmTour],
    duration: "Overnight (24 hours)",
    price: 85000,
    groupPrice: 70000,
    maxParticipants: 8,
    minParticipants: 1,
    rating: 5.0,
    reviewCount: 22,
    status: "limited",
    seasonal: false,
    includes: [
      "Eco-lodge accommodation",
      "Farm-to-table dinner",
      "Sunrise guided walk",
      "Organic breakfast",
      "Stargazing session",
    ],
    highlights: [
      "Eco-lodge overnight stay",
      "Farm-to-table dinner",
      "Sunrise hill walk",
      "Stargazing",
      "Full organic breakfast",
    ],
    requirements: ["Warm clothing for morning walk", "Arrive by 4:00 PM"],
    location: "Agri-Eco Eco-Lodge, Musanze District, Rwanda",
    timeSlots: [
      { id: "ts-6a", time: "04:00 PM (Check-in)", capacity: 8, booked: 6 },
    ],
    accommodation: [
      {
        id: "acc-4",
        name: "Eco Pod",
        type: "standard",
        pricePerNight: 0,
        capacity: 2,
        available: true,
        description: "Included in experience — cozy eco pod",
      },
      {
        id: "acc-5",
        name: "Luxury Treehouse",
        type: "premium",
        pricePerNight: 30000,
        capacity: 2,
        available: true,
        description: "Upgrade to our elevated treehouse with valley views",
      },
    ],
    cancellationPolicy:
      "Free cancellation up to 72 hours before. 50% refund within 48 hours.",
    featured: true,
    createdAt: "2025-03-05",
  },
  {
    id: "tour-7",
    name: "Beeswax Workshop",
    slug: "beeswax-workshop",
    category: "workshop",
    description:
      "Learn to create candles, balms, and soaps from pure beeswax in our artisan workshop.",
    longDescription:
      "Join our artisan instructor for a hands-on workshop where you'll learn the ancient craft of working with beeswax. Create your own beeswax candles, lip balms, and natural soaps using ingredients sourced directly from our apiary and herb garden. Take home everything you make plus a starter kit to continue crafting at home.",
    image: waxWorkshop,
    gallery: [waxWorkshop, beekeeping],
    duration: "3 hours",
    price: 28000,
    groupPrice: 20000,
    maxParticipants: 10,
    minParticipants: 2,
    rating: 4.6,
    reviewCount: 31,
    status: "upcoming",
    seasonal: true,
    season: "Available from April 2026",
    includes: [
      "All materials",
      "3 finished products to take home",
      "Starter kit",
      "Refreshments",
      "Recipe booklet",
    ],
    highlights: [
      "Candle making",
      "Natural soap crafting",
      "Lip balm creation",
      "Herb garden visit",
      "Take-home starter kit",
    ],
    requirements: ["No wax allergies", "Minimum age: 12 years"],
    location: "Agri-Eco Artisan Studio, Musanze District, Rwanda",
    timeSlots: [
      { id: "ts-7a", time: "10:00 AM", capacity: 10, booked: 0 },
      { id: "ts-7b", time: "02:00 PM", capacity: 10, booked: 0 },
    ],
    cancellationPolicy: "Free cancellation up to 48 hours before.",
    featured: false,
    createdAt: "2025-03-10",
  },
];

export const sampleBookings: Booking[] = [
  {
    id: "bk-001",
    tourId: "tour-1",
    tourName: "Guided Organic Farm Tour",
    tourImage: farmTour,
    date: "2026-03-15",
    timeSlot: "08:00 AM",
    participants: 2,
    isGroup: false,
    totalPrice: 50000,
    status: "confirmed",
    contactName: "Jean Baptiste Mugisha",
    contactEmail: "jean@example.com",
    contactPhone: "+250 788 123 456",
    bookingRef: "AGE-2026-0315-001",
    createdAt: "2026-03-07",
    paymentMethod: "MTN Mobile Money",
  },
  {
    id: "bk-002",
    tourId: "tour-2",
    tourName: "Beekeeping Discovery Experience",
    tourImage: beekeeping,
    date: "2026-03-18",
    timeSlot: "09:00 AM",
    participants: 4,
    isGroup: true,
    groupName: "Kigali Adventure Club",
    totalPrice: 88000,
    status: "pending",
    contactName: "Aline Uwase",
    contactEmail: "aline@example.com",
    contactPhone: "+250 722 456 789",
    bookingRef: "AGE-2026-0318-002",
    createdAt: "2026-03-06",
    paymentMethod: "Airtel Money",
  },
  {
    id: "bk-003",
    tourId: "tour-3",
    tourName: "Harvest & Cook Experience",
    tourImage: harvesting,
    date: "2026-03-10",
    timeSlot: "09:00 AM",
    participants: 6,
    isGroup: true,
    groupName: "Sunset Tours Ltd",
    totalPrice: 168000,
    status: "completed",
    contactName: "Patrick Habimana",
    contactEmail: "patrick@example.com",
    contactPhone: "+250 733 789 012",
    bookingRef: "AGE-2026-0310-003",
    createdAt: "2026-03-01",
    paymentMethod: "Visa Card",
  },
  {
    id: "bk-004",
    tourId: "tour-6",
    tourName: "Farm Stay & Sunrise Experience",
    tourImage: farmstay,
    date: "2026-03-20",
    timeSlot: "04:00 PM (Check-in)",
    participants: 2,
    isGroup: false,
    totalPrice: 170000,
    status: "waitlisted",
    accommodation: {
      name: "Luxury Treehouse",
      nights: 1,
      pricePerNight: 30000,
    },
    contactName: "Sarah Johnson",
    contactEmail: "sarah@example.com",
    contactPhone: "+1 555 123 4567",
    bookingRef: "AGE-2026-0320-004",
    createdAt: "2026-03-07",
    paymentMethod: "Stripe",
  },
  {
    id: "bk-005",
    tourId: "tour-5",
    tourName: "School Educational Farm Visit",
    tourImage: educational,
    date: "2026-03-25",
    timeSlot: "08:30 AM",
    participants: 35,
    isGroup: true,
    groupName: "Green Hills Academy",
    totalPrice: 175000,
    status: "confirmed",
    specialRequirements:
      "3 students with vegetarian dietary needs. 1 student uses wheelchair — need accessible path.",
    contactName: "Teacher Marie Claire",
    contactEmail: "marie@greenhills.rw",
    contactPhone: "+250 788 345 678",
    bookingRef: "AGE-2026-0325-005",
    createdAt: "2026-03-03",
    paymentMethod: "Bank Transfer",
  },
];
