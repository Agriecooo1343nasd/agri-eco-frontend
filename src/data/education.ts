// Public images paths for Next.js
const educational = "/assets/tours/educational.jpg";
const farmTour = "/assets/tours/farm-tour.jpg";
const beekeeping = "/assets/tours/beekeeping.jpg";

export interface TrainingProgram {
  id: string;
  title: string;
  description: string;
  image: string;
  duration: string;
  price: number;
  type: "workshop" | "course" | "certification";
  level: "beginner" | "intermediate" | "advanced";
  maxParticipants: number;
  enrolled: number;
  startDate: string;
  schedule: string;
  topics: string[];
  certificate: boolean;
  status: "open" | "full" | "upcoming" | "completed";
}

export interface SchoolVisit {
  id: string;
  schoolName: string;
  contactPerson: string;
  email: string;
  phone: string;
  studentCount: number;
  gradeLevel: string;
  preferredDate: string;
  status: "pending" | "approved" | "completed" | "cancelled";
  curriculumAlignment: string;
  specialNeeds?: string;
  createdAt: string;
}

export interface LearningResource {
  id: string;
  title: string;
  description: string;
  type: "article" | "video" | "guide" | "worksheet";
  category:
    | "organic-farming"
    | "beekeeping"
    | "sustainability"
    | "heritage"
    | "soil-science";
  image: string;
  downloadUrl?: string;
  videoUrl?: string;
  duration?: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  featured: boolean;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  questionCount: number;
  duration: string;
  difficulty: "easy" | "medium" | "hard";
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const trainingPrograms: TrainingProgram[] = [
  {
    id: "tp-1",
    title: "Organic Farming Fundamentals",
    description:
      "Master the basics of organic agriculture including soil preparation, natural pest control, and crop rotation techniques used in Rwandan farming.",
    image: farmTour,
    duration: "4 weeks",
    price: 50000,
    type: "course",
    level: "beginner",
    maxParticipants: 30,
    enrolled: 22,
    startDate: "2026-04-01",
    schedule: "Tuesdays & Thursdays, 9:00 AM - 12:00 PM",
    topics: [
      "Soil preparation",
      "Composting",
      "Crop rotation",
      "Natural pest management",
      "Water conservation",
      "Harvest planning",
    ],
    certificate: true,
    status: "open",
  },
  {
    id: "tp-2",
    title: "Advanced Beekeeping & Apiary Management",
    description:
      "Deep dive into colony management, queen rearing, disease prevention, and honey processing for commercial production.",
    image: beekeeping,
    duration: "6 weeks",
    price: 75000,
    type: "certification",
    level: "advanced",
    maxParticipants: 15,
    enrolled: 15,
    startDate: "2026-04-15",
    schedule: "Mondays, Wednesdays & Fridays, 8:00 AM - 11:00 AM",
    topics: [
      "Colony health assessment",
      "Queen rearing",
      "Disease prevention",
      "Honey processing",
      "Wax production",
      "Business planning",
    ],
    certificate: true,
    status: "full",
  },
  {
    id: "tp-3",
    title: "Sustainable Water Management Workshop",
    description:
      "One-day intensive workshop on rainwater harvesting, drip irrigation, and water-efficient farming for smallholders.",
    image: educational,
    duration: "1 day",
    price: 15000,
    type: "workshop",
    level: "intermediate",
    maxParticipants: 40,
    enrolled: 12,
    startDate: "2026-03-28",
    schedule: "Saturday, 8:00 AM - 4:00 PM",
    topics: [
      "Rainwater harvesting",
      "Drip irrigation",
      "Mulching techniques",
      "Water budgeting",
    ],
    certificate: false,
    status: "open",
  },
  {
    id: "tp-4",
    title: "Value-Added Product Development",
    description:
      "Learn to create jams, dried fruits, herbal teas, and skincare products from farm produce to increase income.",
    image: farmTour,
    duration: "3 weeks",
    price: 45000,
    type: "course",
    level: "intermediate",
    maxParticipants: 20,
    enrolled: 0,
    startDate: "2026-05-10",
    schedule: "Saturdays, 9:00 AM - 1:00 PM",
    topics: [
      "Jam & preserve making",
      "Fruit drying techniques",
      "Herbal tea blending",
      "Natural skincare",
      "Packaging & labeling",
      "Market pricing",
    ],
    certificate: true,
    status: "upcoming",
  },
];

export const sampleSchoolVisits: SchoolVisit[] = [
  {
    id: "sv-1",
    schoolName: "Green Hills Academy",
    contactPerson: "Teacher Marie Claire",
    email: "marie@greenhills.rw",
    phone: "+250 788 345 678",
    studentCount: 35,
    gradeLevel: "Primary 5-6",
    preferredDate: "2026-03-25",
    status: "approved",
    curriculumAlignment: "Science & Environment",
    specialNeeds: "3 vegetarian students, 1 wheelchair user",
    createdAt: "2026-03-03",
  },
  {
    id: "sv-2",
    schoolName: "Kigali International School",
    contactPerson: "Mr. James Ndahiro",
    email: "james@kis.rw",
    phone: "+250 722 111 222",
    studentCount: 45,
    gradeLevel: "Secondary 1-2",
    preferredDate: "2026-04-10",
    status: "pending",
    curriculumAlignment: "Biology & Agriculture",
    createdAt: "2026-03-06",
  },
  {
    id: "sv-3",
    schoolName: "Lycée de Kigali",
    contactPerson: "Mme. Diane Uwimana",
    email: "diane@lyceekigali.rw",
    phone: "+250 788 999 000",
    studentCount: 60,
    gradeLevel: "Secondary 3",
    preferredDate: "2026-04-22",
    status: "pending",
    curriculumAlignment: "Environmental Science",
    createdAt: "2026-03-08",
  },
];

export const learningResources: LearningResource[] = [
  {
    id: "lr-1",
    title: "Introduction to Organic Farming in Rwanda",
    description:
      "A comprehensive guide covering the fundamentals of organic agriculture adapted to Rwanda's climate and soil conditions.",
    type: "guide",
    category: "organic-farming",
    image: farmTour,
    downloadUrl: "#",
    difficulty: "beginner",
    featured: true,
  },
  {
    id: "lr-2",
    title: "Beekeeping for Beginners",
    description:
      "Video tutorial series on starting your first beehive, from equipment selection to your first harvest.",
    type: "video",
    category: "beekeeping",
    image: beekeeping,
    videoUrl: "#",
    duration: "45 min",
    difficulty: "beginner",
    featured: true,
  },
  {
    id: "lr-3",
    title: "Soil Health Assessment Worksheet",
    description:
      "Printable worksheet for students to assess soil composition, pH levels, and organic matter content.",
    type: "worksheet",
    category: "soil-science",
    image: educational,
    downloadUrl: "#",
    difficulty: "intermediate",
    featured: false,
  },
  {
    id: "lr-4",
    title: "Rwanda's Agricultural Heritage",
    description:
      "Explore the rich history of farming practices in Rwanda, from ancient terracing to modern organic methods.",
    type: "article",
    category: "heritage",
    image: farmTour,
    difficulty: "beginner",
    featured: true,
  },
  {
    id: "lr-5",
    title: "Composting Masterclass",
    description:
      "Step-by-step video guide to building and maintaining a productive compost system for smallholder farms.",
    type: "video",
    category: "sustainability",
    image: educational,
    videoUrl: "#",
    duration: "30 min",
    difficulty: "intermediate",
    featured: false,
  },
  {
    id: "lr-6",
    title: "Natural Pest Management Guide",
    description:
      "Detailed guide on companion planting, biological controls, and organic sprays for common Rwandan crop pests.",
    type: "guide",
    category: "organic-farming",
    image: farmTour,
    downloadUrl: "#",
    difficulty: "advanced",
    featured: false,
  },
];

export const quizzes: Quiz[] = [
  {
    id: "quiz-1",
    title: "Organic Farming Basics",
    description:
      "Test your knowledge on fundamental organic farming principles and practices.",
    category: "organic-farming",
    questionCount: 5,
    duration: "10 min",
    difficulty: "easy",
    questions: [
      {
        id: "q1",
        question:
          "What is the primary benefit of crop rotation in organic farming?",
        options: [
          "Faster growth",
          "Soil nutrient balance & pest reduction",
          "Higher water usage",
          "Reduced labor",
        ],
        correctIndex: 1,
        explanation:
          "Crop rotation helps maintain soil fertility by alternating nutrient demands and breaks pest and disease cycles naturally.",
      },
      {
        id: "q2",
        question:
          "Which of the following is NOT an organic pest control method?",
        options: [
          "Companion planting",
          "Synthetic pesticide spray",
          "Neem oil application",
          "Introducing beneficial insects",
        ],
        correctIndex: 1,
        explanation:
          "Synthetic pesticides are prohibited in organic farming. Organic methods rely on natural alternatives.",
      },
      {
        id: "q3",
        question: "What is composting?",
        options: [
          "Burning crop waste",
          "Decomposing organic matter into nutrient-rich soil amendment",
          "Adding chemical fertilizers",
          "Flooding fields with water",
        ],
        correctIndex: 1,
        explanation:
          "Composting is the natural process of recycling organic matter into a valuable fertilizer that enriches soil.",
      },
      {
        id: "q4",
        question: "Which practice helps conserve water in organic farming?",
        options: [
          "Flood irrigation",
          "Mulching",
          "Removing all vegetation",
          "Using plastic ground cover",
        ],
        correctIndex: 1,
        explanation:
          "Mulching retains soil moisture, reduces evaporation, and suppresses weeds naturally.",
      },
      {
        id: "q5",
        question: "What does organic certification ensure?",
        options: [
          "Products are locally grown",
          "No synthetic chemicals used in production",
          "Products are cheaper",
          "Faster delivery",
        ],
        correctIndex: 1,
        explanation:
          "Organic certification verifies that products are grown and processed without synthetic chemicals, GMOs, or artificial additives.",
      },
    ],
  },
  {
    id: "quiz-2",
    title: "Beekeeping Knowledge Check",
    description: "How much do you know about bees and beekeeping? Find out!",
    category: "beekeeping",
    questionCount: 5,
    duration: "10 min",
    difficulty: "medium",
    questions: [
      {
        id: "q6",
        question: "How many queen bees are typically in a healthy hive?",
        options: ["None", "One", "Two", "Many"],
        correctIndex: 1,
        explanation:
          "A healthy hive has exactly one queen bee who is responsible for laying all the eggs.",
      },
      {
        id: "q7",
        question: "What do bees primarily collect from flowers?",
        options: ["Water", "Nectar and pollen", "Seeds", "Leaves"],
        correctIndex: 1,
        explanation:
          "Bees collect nectar (for honey) and pollen (for protein) from flowers, pollinating plants in the process.",
      },
      {
        id: "q8",
        question: "What is the waggle dance?",
        options: [
          "A mating ritual",
          "A communication method to indicate food sources",
          "A defense mechanism",
          "A sign of illness",
        ],
        correctIndex: 1,
        explanation:
          "The waggle dance is how forager bees communicate the direction and distance of food sources to other bees.",
      },
      {
        id: "q9",
        question: "What is beeswax used for?",
        options: [
          "Building honeycomb cells",
          "Feeding larvae",
          "Storing water",
          "Protecting the queen",
        ],
        correctIndex: 0,
        explanation:
          "Worker bees produce beeswax to build the hexagonal comb cells used for storing honey and raising brood.",
      },
      {
        id: "q10",
        question: "When is the best time to harvest honey in Rwanda?",
        options: [
          "During heavy rains",
          "At the end of a flowering season",
          "In winter",
          "At night",
        ],
        correctIndex: 1,
        explanation:
          "Honey is best harvested at the end of a flowering season when bees have had time to produce surplus honey.",
      },
    ],
  },
];
