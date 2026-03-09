// Public images paths for Next.js
const educational = "/assets/tours/educational.jpg";
const farmTour = "/assets/tours/farm-tour.jpg";
const beekeeping = "/assets/tours/beekeeping.jpg";

export interface ContentBlock {
  id: string;
  type: "text" | "image" | "video" | "download" | "checklist";
  title?: string;
  content: string;
  caption?: string;
}

export interface ModuleQuizQuestion {
  id: string;
  question: string;
  questionImage?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ModuleQuiz {
  id: string;
  title: string;
  description?: string;
  passingScore: number;
  questions: ModuleQuizQuestion[];
}

export interface ProgramModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  order: number;
  contentBlocks: ContentBlock[];
  quiz?: ModuleQuiz;
}

export interface CertificateTemplate {
  enabled: boolean;
  title: string;
  subtitle: string;
  description: string;
  signatoryName: string;
  signatoryTitle: string;
  badgeColor: string;
  logoUrl?: string;
}

export interface TrainingProgram {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  image: string;
  gallery?: string[];
  duration: string;
  price: number;
  type: "workshop" | "course" | "certification";
  level: "beginner" | "intermediate" | "advanced";
  maxParticipants: number;
  enrolled: number;
  startDate: string;
  endDate?: string;
  schedule: string;
  topics: string[];
  certificate: boolean;
  certificateTemplate?: CertificateTemplate;
  status: "open" | "full" | "upcoming" | "completed";
  modules: ProgramModule[];
  instructor?: string;
  instructorBio?: string;
  requirements?: string[];
  whatYouGet?: string[];
  language?: string;
  location?: string;
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
    longDescription:
      "This comprehensive 4-week course takes you through every aspect of organic farming, from understanding your soil to harvesting your first certified organic crop.",
    image: farmTour,
    gallery: [farmTour, educational, beekeeping],
    duration: "4 weeks",
    price: 50000,
    type: "course",
    level: "beginner",
    maxParticipants: 30,
    enrolled: 22,
    startDate: "2026-04-01",
    endDate: "2026-04-29",
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
    certificateTemplate: {
      enabled: true,
      title: "Certificate of Completion",
      subtitle: "Organic Farming Fundamentals",
      description:
        "Has successfully completed the 4-week Organic Farming Fundamentals course.",
      signatoryName: "Jean-Pierre Habimana",
      signatoryTitle: "Director of Agricultural Education",
      badgeColor: "#16a34a",
    },
    status: "open",
    instructor: "Jean-Pierre Habimana",
    instructorBio: "20+ years of organic farming experience.",
    requirements: [
      "No prior experience needed",
      "Bring work gloves and boots",
      "Notebook for field notes",
    ],
    whatYouGet: [
      "8 hands-on field sessions",
      "Complete organic farming toolkit",
      "Certificate of Completion",
    ],
    language: "Kinyarwanda & English",
    location: "Agri-Eco Farm, Musanze District",
    modules: [
      {
        id: "m1",
        title: "Introduction to Organic Farming",
        description:
          "Understanding organic principles, history in Rwanda, and the MINAGRI PSTA5 framework.",
        duration: "3 hours",
        order: 1,
        contentBlocks: [
          {
            id: "cb1",
            type: "text",
            title: "What is Organic Farming?",
            content:
              "Organic farming is an agricultural system that relies on natural inputs and ecological processes to produce food.",
          },
          {
            id: "cb2",
            type: "image",
            content: farmTour,
            caption: "Our demonstration organic farm in Musanze",
          },
          {
            id: "cb3",
            type: "checklist",
            title: "Pre-course Checklist",
            content:
              "Bring work gloves|Wear boots or closed shoes|Notebook and pen|Water bottle|Sun hat",
          },
        ],
        quiz: {
          id: "mq1",
          title: "Module 1 Quiz",
          description: "Test your understanding of organic farming basics",
          passingScore: 60,
          questions: [
            {
              id: "mq1-1",
              question: "What is the primary principle of organic farming?",
              options: [
                "Using synthetic fertilizers",
                "Relying on natural inputs and ecological processes",
                "Maximizing chemical pest control",
                "Monoculture farming",
              ],
              correctIndex: 1,
              explanation:
                "Organic farming relies on natural inputs like compost and biological pest control.",
            },
            {
              id: "mq1-2",
              question:
                "Which Rwandan government framework supports organic agriculture?",
              options: ["PSTA5", "Vision 2030", "EDPRS III", "NST2"],
              correctIndex: 0,
              explanation:
                "The PSTA5 includes organic farming as a key component.",
            },
            {
              id: "mq1-3",
              question: "What is NOT a benefit of organic farming?",
              options: [
                "Improved soil health",
                "Reduced chemical runoff",
                "Higher short-term yields than conventional",
                "Better biodiversity",
              ],
              correctIndex: 2,
              explanation:
                "Organic farming typically has lower short-term yields but better long-term sustainability.",
            },
          ],
        },
      },
      {
        id: "m2",
        title: "Soil Preparation & Testing",
        description:
          "Learn to analyze soil composition, pH levels, and prepare beds for organic cultivation.",
        duration: "3 hours",
        order: 2,
        contentBlocks: [
          {
            id: "cb4",
            type: "text",
            title: "Understanding Soil Types",
            content:
              "Rwanda's volcanic soils in the northwest are naturally fertile.",
          },
          {
            id: "cb5",
            type: "video",
            content: "https://example.com/soil-prep-video",
            caption: "Watch: Soil preparation techniques",
          },
          {
            id: "cb6",
            type: "download",
            title: "Soil Testing Worksheet",
            content: "#",
            caption: "Download the printable soil analysis worksheet",
          },
        ],
        quiz: {
          id: "mq2",
          title: "Soil Knowledge Check",
          passingScore: 70,
          questions: [
            {
              id: "mq2-1",
              question: "What soil pH range is ideal for most vegetables?",
              options: ["3.0-4.5", "5.5-7.0", "8.0-9.5", "10.0-12.0"],
              correctIndex: 1,
              explanation:
                "Most vegetables thrive in slightly acidic to neutral soil with pH between 5.5 and 7.0.",
            },
            {
              id: "mq2-2",
              question:
                "Which region of Rwanda has naturally volcanic fertile soils?",
              options: [
                "Eastern savanna",
                "Northwest highlands",
                "Southern plateau",
                "Central hills",
              ],
              correctIndex: 1,
              explanation:
                "The northwest volcanic soils near the Virunga range are among Rwanda's most fertile.",
            },
          ],
        },
      },
      {
        id: "m3",
        title: "Composting & Natural Fertilizers",
        description:
          "Build and maintain compost systems, make liquid fertilizers, and understand nutrient cycles.",
        duration: "3 hours",
        order: 3,
        contentBlocks: [
          {
            id: "cb7",
            type: "text",
            title: "Composting Methods",
            content:
              "We cover three composting methods suitable for smallholder farms.",
          },
          {
            id: "cb8",
            type: "image",
            content: educational,
            caption: "Students learning composting at the farm",
          },
        ],
      },
      {
        id: "m4",
        title: "Crop Rotation & Pest Management",
        description:
          "Design crop rotation plans and implement natural pest control strategies.",
        duration: "3 hours",
        order: 4,
        contentBlocks: [
          {
            id: "cb9",
            type: "text",
            title: "Rotation Planning",
            content:
              "A well-designed crop rotation plan prevents soil depletion and breaks pest cycles.",
          },
          {
            id: "cb10",
            type: "download",
            title: "Crop Rotation Planner Template",
            content: "#",
            caption: "Downloadable Excel template for planning your rotations",
          },
        ],
      },
    ],
  },
  {
    id: "tp-2",
    title: "Advanced Beekeeping & Apiary Management",
    description:
      "Deep dive into colony management, queen rearing, disease prevention, and honey processing.",
    longDescription:
      "This intensive 6-week certification program prepares experienced beekeepers for commercial-scale apiary management.",
    image: beekeeping,
    gallery: [beekeeping, farmTour],
    duration: "6 weeks",
    price: 75000,
    type: "certification",
    level: "advanced",
    maxParticipants: 15,
    enrolled: 15,
    startDate: "2026-04-15",
    endDate: "2026-05-27",
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
    certificateTemplate: {
      enabled: true,
      title: "Professional Certification",
      subtitle: "Advanced Beekeeping & Apiary Management",
      description:
        "Has demonstrated advanced competence in beekeeping practices.",
      signatoryName: "Dr. Amina Uwase",
      signatoryTitle: "Head of Apiculture Studies",
      badgeColor: "#d97706",
    },
    status: "full",
    instructor: "Dr. Amina Uwase",
    instructorBio: "PhD in Entomology, 15+ years in apiculture research.",
    requirements: [
      "Minimum 1 year beekeeping experience",
      "Own at least 3 hives",
      "Protective beekeeping gear",
    ],
    whatYouGet: [
      "18 practical sessions",
      "Queen rearing starter kit",
      "Professional certification",
      "Business plan template",
    ],
    language: "English & Kinyarwanda",
    location: "Agri-Eco Apiary, Musanze",
    modules: [
      {
        id: "m5",
        title: "Advanced Colony Assessment",
        description:
          "Techniques for evaluating colony health, brood patterns, and population dynamics.",
        duration: "3 hours",
        order: 1,
        contentBlocks: [
          {
            id: "cb11",
            type: "text",
            title: "Colony Health Indicators",
            content: "Learn to read the signs of a healthy colony.",
          },
        ],
      },
      {
        id: "m6",
        title: "Queen Rearing Techniques",
        description: "Grafting, cell building, and queen introduction methods.",
        duration: "6 hours",
        order: 2,
        contentBlocks: [
          {
            id: "cb12",
            type: "text",
            title: "Grafting Methods",
            content: "Master the Doolittle method of queen rearing.",
          },
          {
            id: "cb13",
            type: "video",
            content: "https://example.com/queen-rearing",
            caption: "Video: Queen rearing step by step",
          },
        ],
      },
    ],
  },
  {
    id: "tp-3",
    title: "Sustainable Water Management Workshop",
    description:
      "One-day intensive workshop on rainwater harvesting, drip irrigation, and water-efficient farming for smallholders.",
    longDescription:
      "Water is the lifeblood of agriculture. This hands-on workshop teaches practical, low-cost water management techniques.",
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
    instructor: "Emmanuel Nsengiyumva",
    instructorBio: "Agricultural engineer specializing in water-smart farming.",
    requirements: ["Basic farming experience helpful but not required"],
    whatYouGet: [
      "DIY drip irrigation kit",
      "Water management handbook",
      "Lunch included",
    ],
    language: "Kinyarwanda",
    location: "Agri-Eco Farm, Musanze District",
    modules: [
      {
        id: "m7",
        title: "Rainwater Harvesting Systems",
        description:
          "Design and build low-cost rainwater collection systems for farm use.",
        duration: "2 hours",
        order: 1,
        contentBlocks: [
          {
            id: "cb14",
            type: "text",
            title: "Harvesting Basics",
            content: "Learn to calculate your roof's collection potential.",
          },
        ],
      },
      {
        id: "m8",
        title: "Drip Irrigation Hands-On",
        description:
          "Build a working drip irrigation system from locally available materials.",
        duration: "3 hours",
        order: 2,
        contentBlocks: [
          {
            id: "cb15",
            type: "text",
            title: "Building Your System",
            content: "Using PVC pipes, medical tubing, and recycled bottles.",
          },
          {
            id: "cb16",
            type: "download",
            title: "Parts List & Assembly Guide",
            content: "#",
            caption: "Printable guide with local supplier contacts",
          },
        ],
      },
    ],
  },
  {
    id: "tp-4",
    title: "Value-Added Product Development",
    description:
      "Learn to create jams, dried fruits, herbal teas, and skincare products from farm produce to increase income.",
    longDescription:
      "Transform your raw farm produce into high-value products that sell at premium prices.",
    image: farmTour,
    duration: "3 weeks",
    price: 45000,
    type: "course",
    level: "intermediate",
    maxParticipants: 20,
    enrolled: 0,
    startDate: "2026-05-10",
    endDate: "2026-05-31",
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
    certificateTemplate: {
      enabled: true,
      title: "Certificate of Completion",
      subtitle: "Value-Added Product Development",
      description:
        "Has successfully completed training in agricultural value addition.",
      signatoryName: "Grace Mukamana",
      signatoryTitle: "Head of Value Addition Programs",
      badgeColor: "#9333ea",
    },
    status: "upcoming",
    instructor: "Grace Mukamana",
    instructorBio: "Food scientist and entrepreneur.",
    requirements: [
      "Access to farm produce",
      "Interest in food processing or skincare",
    ],
    whatYouGet: [
      "Starter ingredient kit",
      "Recipe book with 30+ formulas",
      "Certificate",
      "Business mentorship for 3 months",
    ],
    language: "Kinyarwanda & English",
    location: "Agri-Eco Processing Lab, Musanze",
    modules: [
      {
        id: "m9",
        title: "Food Processing Fundamentals",
        description:
          "Food safety, preservation methods, and setting up a processing workspace.",
        duration: "4 hours",
        order: 1,
        contentBlocks: [
          {
            id: "cb17",
            type: "text",
            title: "Food Safety First",
            content:
              "Before processing any food products, understand hygiene standards.",
          },
        ],
      },
      {
        id: "m10",
        title: "Jam & Preserve Making",
        description:
          "Traditional and modern jam-making techniques optimized for Rwanda's fruits.",
        duration: "4 hours",
        order: 2,
        contentBlocks: [
          {
            id: "cb18",
            type: "text",
            title: "The Science of Jam",
            content: "Understanding pectin, sugar ratios, and preservation.",
          },
          {
            id: "cb19",
            type: "download",
            title: "Jam Recipe Collection",
            content: "#",
            caption: "10 tried-and-tested recipes",
          },
        ],
      },
    ],
  },
];

export interface SchoolVisitConfig {
  whatsIncluded: string[];
  details: { label: string; value: string }[];
  heading: string;
  subheading: string;
  curriculumSubjects: { id: string; name: string; description?: string }[];
  gradeLevels: { value: string; label: string }[];
}

export const schoolVisitConfig: SchoolVisitConfig = {
  whatsIncluded: [
    "Curriculum-aligned activities",
    "Student workbooks",
    "Organic lunch for all",
    "Teacher resource packs",
    "Certificates of participation",
    "Pre & post-visit materials",
  ],
  details: [
    { label: "Duration", value: "Full day (6 hours)" },
    { label: "Price", value: "5,000 RWF/student" },
    { label: "Group Size", value: "10 - 50 students" },
    { label: "Levels", value: "Primary & Secondary" },
    { label: "Advance Booking", value: "2 weeks required" },
  ],
  heading: "School Visit Programs",
  subheading:
    "Curriculum-aligned farm visits for primary and secondary schools",
  curriculumSubjects: [
    {
      id: "s1",
      name: "Science & Environment",
      description: "Natural sciences and environmental studies",
    },
    {
      id: "s2",
      name: "Biology & Agriculture",
      description: "Life sciences and agricultural practices",
    },
    {
      id: "s3",
      name: "Geography",
      description: "Land use, climate, and sustainability",
    },
    {
      id: "s4",
      name: "General Knowledge",
      description: "Interdisciplinary learning",
    },
  ],
  gradeLevels: [
    { value: "primary-lower", label: "Primary 1-3" },
    { value: "primary-upper", label: "Primary 4-6" },
    { value: "secondary-lower", label: "Secondary 1-3" },
    { value: "secondary-upper", label: "Secondary 4-6" },
  ],
};

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
