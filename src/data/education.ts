// Public images paths for Next.js
const educational = "/assets/tours/educational.jpg";
const farmTour = "/assets/tours/farm-tour.jpg";
const beekeeping = "/assets/tours/beekeeping.jpg";

import { ml, type MultiLangValue } from "@/components/admin/MultiLangInput";

export interface ContentBlock {
  id: string;
  type: "text" | "image" | "video" | "download" | "checklist";
  title?: MultiLangValue;
  content: MultiLangValue;
  caption?: MultiLangValue;
}

export interface ModuleQuizQuestion {
  id: string;
  question: MultiLangValue;
  questionImage?: string;
  options: MultiLangValue[];
  correctIndex: number;
  explanation: MultiLangValue;
}

export interface ModuleQuiz {
  id: string;
  title: MultiLangValue;
  description?: MultiLangValue;
  passingScore: number;
  questions: ModuleQuizQuestion[];
}

export interface ProgramModule {
  id: string;
  title: MultiLangValue;
  description: MultiLangValue;
  duration: MultiLangValue;
  order: number;
  contentBlocks: ContentBlock[];
  quiz?: ModuleQuiz;
}

export interface CertificateTemplate {
  enabled: boolean;
  title: MultiLangValue;
  subtitle: MultiLangValue;
  description: MultiLangValue;
  signatoryName: string;
  signatoryTitle: string;
  badgeColor: string;
  logoUrl?: string;
}

export interface TrainingProgram {
  id: string;
  title: MultiLangValue;
  description: MultiLangValue;
  longDescription?: MultiLangValue;
  image: string;
  gallery?: string[];
  duration: MultiLangValue;
  price: number;
  type: "workshop" | "course" | "certification";
  level: MultiLangValue;
  maxParticipants: number;
  enrolled: number;
  startDate: MultiLangValue;
  endDate?: string;
  schedule: MultiLangValue;
  topics: MultiLangValue[];
  certificate: boolean;
  certificateTemplate?: CertificateTemplate;
  status: "open" | "full" | "upcoming" | "completed";
  modules: ProgramModule[];
  instructor?: MultiLangValue;
  instructorBio?: MultiLangValue;
  requirements?: MultiLangValue[];
  whatYouGet?: MultiLangValue[];
  language?: MultiLangValue;
  location?: MultiLangValue;
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
  title: MultiLangValue;
  description: MultiLangValue;
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
  duration?: MultiLangValue;
  difficulty: "beginner" | "intermediate" | "advanced";
  featured: boolean;
}

export interface Quiz {
  id: string;
  title: MultiLangValue;
  description: MultiLangValue;
  category: string;
  questionCount: number;
  duration: string;
  difficulty: "easy" | "medium" | "hard";
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: MultiLangValue;
  options: MultiLangValue[];
  correctIndex: number;
  explanation: MultiLangValue;
}

export const trainingPrograms: TrainingProgram[] = [
  {
    id: "tp-1",
    title: ml("Organic Farming Fundamentals"),
    description: ml(
      "Master the basics of organic agriculture including soil preparation, natural pest control, and crop rotation techniques used in Rwandan farming.",
    ),
    longDescription: ml(
      "This comprehensive 4-week course takes you through every aspect of organic farming, from understanding your soil to harvesting your first certified organic crop.",
    ),
    image: farmTour,
    gallery: [farmTour, educational, beekeeping],
    duration: ml("4 weeks"),
    price: 50000,
    type: "course",
    level: ml("beginner"),
    maxParticipants: 30,
    enrolled: 22,
    startDate: ml("2026-04-01"),
    endDate: "2026-04-29",
    schedule: ml("Tuesdays & Thursdays, 9:00 AM - 12:00 PM"),
    topics: [
      ml("Soil preparation"),
      ml("Composting"),
      ml("Crop rotation"),
      ml("Natural pest management"),
      ml("Water conservation"),
      ml("Harvest planning"),
    ],
    certificate: true,
    certificateTemplate: {
      enabled: true,
      title: ml("Certificate of Completion"),
      subtitle: ml("Organic Farming Fundamentals"),
      description: ml(
        "Has successfully completed the 4-week Organic Farming Fundamentals course.",
      ),
      signatoryName: "Jean-Pierre Habimana",
      signatoryTitle: "Director of Agricultural Education",
      badgeColor: "#16a34a",
    },
    status: "open",
    instructor: ml("Jean-Pierre Habimana"),
    instructorBio: ml("20+ years of organic farming experience."),
    requirements: [
      ml("No prior experience needed"),
      ml("Bring work gloves and boots"),
      ml("Notebook for field notes"),
    ],
    whatYouGet: [
      ml("8 hands-on field sessions"),
      ml("Complete organic farming toolkit"),
      ml("Certificate of Completion"),
    ],
    language: ml("Kinyarwanda & English"),
    location: ml("Agri-Eco Farm, Musanze District"),
    modules: [
      {
        id: "m1",
        title: ml("Introduction to Organic Farming"),
        description: ml(
          "Understanding organic principles, history in Rwanda, and the MINAGRI PSTA5 framework.",
        ),
        duration: ml("3 hours"),
        order: 1,
        contentBlocks: [
          {
            id: "cb1",
            type: "text",
            title: ml("What is Organic Farming?"),
            content: ml(
              "Organic farming is an agricultural system that relies on natural inputs and ecological processes to produce food.",
            ),
          },
          {
            id: "cb2",
            type: "image",
            content: ml(farmTour),
            caption: ml("Our demonstration organic farm in Musanze"),
          },
          {
            id: "cb3",
            type: "checklist",
            title: ml("Pre-course Checklist"),
            content: ml(
              "Bring work gloves|Wear boots or closed shoes|Notebook and pen|Water bottle|Sun hat",
            ),
          },
        ],
        quiz: {
          id: "mq1",
          title: ml("Module 1 Quiz"),
          description: ml("Test your understanding of organic farming basics"),
          passingScore: 60,
          questions: [
            {
              id: "mq1-1",
              question: ml("What is the primary principle of organic farming?"),
              options: [
                ml("Using synthetic fertilizers"),
                ml("Relying on natural inputs and ecological processes"),
                ml("Maximizing chemical pest control"),
                ml("Monoculture farming"),
              ],
              correctIndex: 1,
              explanation: ml(
                "Organic farming relies on natural inputs like compost and biological pest control.",
              ),
            },
            {
              id: "mq1-2",
              question: ml(
                "Which Rwandan government framework supports organic agriculture?",
              ),
              options: [
                ml("PSTA5"),
                ml("Vision 2030"),
                ml("EDPRS III"),
                ml("NST2"),
              ],
              correctIndex: 0,
              explanation: ml(
                "The PSTA5 includes organic farming as a key component.",
              ),
            },
            {
              id: "mq1-3",
              question: ml("What is NOT a benefit of organic farming?"),
              options: [
                ml("Improved soil health"),
                ml("Reduced chemical runoff"),
                ml("Higher short-term yields than conventional"),
                ml("Better biodiversity"),
              ],
              correctIndex: 2,
              explanation: ml(
                "Organic farming typically has lower short-term yields but better long-term sustainability.",
              ),
            },
          ],
        },
      },
      {
        id: "m2",
        title: ml("Soil Preparation & Testing"),
        description: ml(
          "Learn to analyze soil composition, pH levels, and prepare beds for organic cultivation.",
        ),
        duration: ml("3 hours"),
        order: 2,
        contentBlocks: [
          {
            id: "cb4",
            type: "text",
            title: ml("Understanding Soil Types"),
            content: ml(
              "Rwanda's volcanic soils in the northwest are naturally fertile.",
            ),
          },
          {
            id: "cb5",
            type: "video",
            content: ml("https://example.com/soil-prep-video"),
            caption: ml("Watch: Soil preparation techniques"),
          },
          {
            id: "cb6",
            type: "download",
            title: ml("Soil Testing Worksheet"),
            content: ml("#"),
            caption: ml("Download the printable soil analysis worksheet"),
          },
        ],
        quiz: {
          id: "mq2",
          title: ml("Soil Knowledge Check"),
          passingScore: 70,
          questions: [
            {
              id: "mq2-1",
              question: ml("What soil pH range is ideal for most vegetables?"),
              options: [
                ml("3.0-4.5"),
                ml("5.5-7.0"),
                ml("8.0-9.5"),
                ml("10.0-12.0"),
              ],
              correctIndex: 1,
              explanation: ml(
                "Most vegetables thrive in slightly acidic to neutral soil with pH between 5.5 and 7.0.",
              ),
            },
            {
              id: "mq2-2",
              question: ml(
                "Which region of Rwanda has naturally volcanic fertile soils?",
              ),
              options: [
                ml("Eastern savanna"),
                ml("Northwest highlands"),
                ml("Southern plateau"),
                ml("Central hills"),
              ],
              correctIndex: 1,
              explanation: ml(
                "The northwest volcanic soils near the Virunga range are among Rwanda's most fertile.",
              ),
            },
          ],
        },
      },
      {
        id: "m3",
        title: ml("Composting & Natural Fertilizers"),
        description: ml(
          "Build and maintain compost systems, make liquid fertilizers, and understand nutrient cycles.",
        ),
        duration: ml("3 hours"),
        order: 3,
        contentBlocks: [
          {
            id: "cb7",
            type: "text",
            title: ml("Composting Methods"),
            content: ml(
              "We cover three composting methods suitable for smallholder farms.",
            ),
          },
          {
            id: "cb8",
            type: "image",
            content: ml(educational),
            caption: ml("Students learning composting at the farm"),
          },
        ],
      },
      {
        id: "m4",
        title: ml("Crop Rotation & Pest Management"),
        description: ml(
          "Design crop rotation plans and implement natural pest control strategies.",
        ),
        duration: ml("3 hours"),
        order: 4,
        contentBlocks: [
          {
            id: "cb9",
            type: "text",
            title: ml("Rotation Planning"),
            content: ml(
              "A well-designed crop rotation plan prevents soil depletion and breaks pest cycles.",
            ),
          },
          {
            id: "cb10",
            type: "download",
            title: ml("Crop Rotation Planner Template"),
            content: ml("#"),
            caption: ml(
              "Downloadable Excel template for planning your rotations",
            ),
          },
        ],
      },
    ],
  },
  {
    id: "tp-2",
    title: ml("Advanced Beekeeping & Apiary Management"),
    description: ml(
      "Deep dive into colony management, queen rearing, disease prevention, and honey processing.",
    ),
    longDescription: ml(
      "This intensive 6-week certification program prepares experienced beekeepers for commercial-scale apiary management.",
    ),
    image: beekeeping,
    gallery: [beekeeping, farmTour],
    duration: ml("6 weeks"),
    price: 75000,
    type: "certification",
    level: ml("advanced"),
    maxParticipants: 15,
    enrolled: 15,
    startDate: ml("2026-04-15"),
    endDate: "2026-05-27",
    schedule: ml("Mondays, Wednesdays & Fridays, 8:00 AM - 11:00 AM"),
    topics: [
      ml("Colony health assessment"),
      ml("Queen rearing"),
      ml("Disease prevention"),
      ml("Honey processing"),
      ml("Wax production"),
      ml("Business planning"),
    ],
    certificate: true,
    certificateTemplate: {
      enabled: true,
      title: ml("Professional Certification"),
      subtitle: ml("Advanced Beekeeping & Apiary Management"),
      description: ml(
        "Has demonstrated advanced competence in beekeeping practices.",
      ),
      signatoryName: "Dr. Amina Uwase",
      signatoryTitle: "Head of Apiculture Studies",
      badgeColor: "#d97706",
    },
    status: "full",
    instructor: ml("Dr. Amina Uwase"),
    instructorBio: ml("PhD in Entomology, 15+ years in apiculture research."),
    requirements: [
      ml("Minimum 1 year beekeeping experience"),
      ml("Own at least 3 hives"),
      ml("Protective beekeeping gear"),
    ],
    whatYouGet: [
      ml("18 practical sessions"),
      ml("Queen rearing starter kit"),
      ml("Professional certification"),
      ml("Business plan template"),
    ],
    language: ml("English & Kinyarwanda"),
    location: ml("Agri-Eco Apiary, Musanze"),
    modules: [
      {
        id: "m5",
        title: ml("Advanced Colony Assessment"),
        description: ml(
          "Techniques for evaluating colony health, brood patterns, and population dynamics.",
        ),
        duration: ml("3 hours"),
        order: 1,
        contentBlocks: [
          {
            id: "cb11",
            type: "text",
            title: ml("Colony Health Indicators"),
            content: ml("Learn to read the signs of a healthy colony."),
          },
        ],
      },
      {
        id: "m6",
        title: ml("Queen Rearing Techniques"),
        description: ml(
          "Grafting, cell building, and queen introduction methods.",
        ),
        duration: ml("6 hours"),
        order: 2,
        contentBlocks: [
          {
            id: "cb12",
            type: "text",
            title: ml("Grafting Methods"),
            content: ml("Master the Doolittle method of queen rearing."),
          },
          {
            id: "cb13",
            type: "video",
            content: ml("https://example.com/queen-rearing"),
            caption: ml("Video: Queen rearing step by step"),
          },
        ],
      },
    ],
  },
  {
    id: "tp-3",
    title: ml("Sustainable Water Management Workshop"),
    description: ml(
      "One-day intensive workshop on rainwater harvesting, drip irrigation, and water-efficient farming for smallholders.",
    ),
    longDescription: ml(
      "Water is the lifeblood of agriculture. This hands-on workshop teaches practical, low-cost water management techniques.",
    ),
    image: educational,
    duration: ml("1 day"),
    price: 15000,
    type: "workshop",
    level: ml("intermediate"),
    maxParticipants: 40,
    enrolled: 12,
    startDate: ml("2026-03-28"),
    schedule: ml("Saturday, 8:00 AM - 4:00 PM"),
    topics: [
      ml("Rainwater harvesting"),
      ml("Drip irrigation"),
      ml("Mulching techniques"),
      ml("Water budgeting"),
    ],
    certificate: false,
    status: "open",
    instructor: ml("Emmanuel Nsengiyumva"),
    instructorBio: ml(
      "Agricultural engineer specializing in water-smart farming.",
    ),
    requirements: [ml("Basic farming experience helpful but not required")],
    whatYouGet: [
      ml("DIY drip irrigation kit"),
      ml("Water management handbook"),
      ml("Lunch included"),
    ],
    language: ml("Kinyarwanda"),
    location: ml("Agri-Eco Farm, Musanze District"),
    modules: [
      {
        id: "m7",
        title: ml("Rainwater Harvesting Systems"),
        description: ml(
          "Design and build low-cost rainwater collection systems for farm use.",
        ),
        duration: ml("2 hours"),
        order: 1,
        contentBlocks: [
          {
            id: "cb14",
            type: "text",
            title: ml("Harvesting Basics"),
            content: ml("Learn to calculate your roof's collection potential."),
          },
        ],
      },
      {
        id: "m8",
        title: ml("Drip Irrigation Hands-On"),
        description: ml(
          "Build a working drip irrigation system from locally available materials.",
        ),
        duration: ml("3 hours"),
        order: 2,
        contentBlocks: [
          {
            id: "cb15",
            type: "text",
            title: ml("Building Your System"),
            content: ml(
              "Using PVC pipes, medical tubing, and recycled bottles.",
            ),
          },
          {
            id: "cb16",
            type: "download",
            title: ml("Parts List & Assembly Guide"),
            content: ml("#"),
            caption: ml("Printable guide with local supplier contacts"),
          },
        ],
      },
    ],
  },
  {
    id: "tp-4",
    title: ml("Value-Added Product Development"),
    description: ml(
      "Learn to create jams, dried fruits, herbal teas, and skincare products from farm produce to increase income.",
    ),
    longDescription: ml(
      "Transform your raw farm produce into high-value products that sell at premium prices.",
    ),
    image: farmTour,
    duration: ml("3 weeks"),
    price: 45000,
    type: "course",
    level: ml("intermediate"),
    maxParticipants: 20,
    enrolled: 0,
    startDate: ml("2026-05-10"),
    endDate: "2026-05-31",
    schedule: ml("Saturdays, 9:00 AM - 1:00 PM"),
    topics: [
      ml("Jam & preserve making"),
      ml("Fruit drying techniques"),
      ml("Herbal tea blending"),
      ml("Natural skincare"),
      ml("Packaging & labeling"),
      ml("Market pricing"),
    ],
    certificate: true,
    certificateTemplate: {
      enabled: true,
      title: ml("Certificate of Completion"),
      subtitle: ml("Value-Added Product Development"),
      description: ml(
        "Has successfully completed training in agricultural value addition.",
      ),
      signatoryName: "Grace Mukamana",
      signatoryTitle: "Head of Value Addition Programs",
      badgeColor: "#9333ea",
    },
    status: "upcoming",
    instructor: ml("Grace Mukamana"),
    instructorBio: ml("Food scientist and entrepreneur."),
    requirements: [
      ml("Access to farm produce"),
      ml("Interest in food processing or skincare"),
    ],
    whatYouGet: [
      ml("Starter ingredient kit"),
      ml("Recipe book with 30+ formulas"),
      ml("Certificate"),
      ml("Business mentorship for 3 months"),
    ],
    language: ml("Kinyarwanda & English"),
    location: ml("Agri-Eco Processing Lab, Musanze"),
    modules: [
      {
        id: "m9",
        title: ml("Food Processing Fundamentals"),
        description: ml(
          "Food safety, preservation methods, and setting up a processing workspace.",
        ),
        duration: ml("4 hours"),
        order: 1,
        contentBlocks: [
          {
            id: "cb17",
            type: "text",
            title: ml("Food Safety First"),
            content: ml(
              "Before processing any food products, understand hygiene standards.",
            ),
          },
        ],
      },
      {
        id: "m10",
        title: ml("Jam & Preserve Making"),
        description: ml(
          "Traditional and modern jam-making techniques optimized for Rwanda's fruits.",
        ),
        duration: ml("4 hours"),
        order: 2,
        contentBlocks: [
          {
            id: "cb18",
            type: "text",
            title: ml("The Science of Jam"),
            content: ml(
              "Understanding pectin, sugar ratios, and preservation.",
            ),
          },
          {
            id: "cb19",
            type: "download",
            title: ml("Jam Recipe Collection"),
            content: ml("#"),
            caption: ml("10 tried-and-tested recipes"),
          },
        ],
      },
    ],
  },
];

export interface SchoolVisitConfig {
  whatsIncluded: MultiLangValue[];
  details: { label: MultiLangValue; value: MultiLangValue }[];
  heading: MultiLangValue;
  subheading: MultiLangValue;
  curriculumSubjects: {
    id: string;
    name: MultiLangValue;
    description?: MultiLangValue;
  }[];
  gradeLevels: { value: string; label: MultiLangValue }[];
}

export const schoolVisitConfig: SchoolVisitConfig = {
  whatsIncluded: [
    ml("Curriculum-aligned activities"),
    ml("Student workbooks"),
    ml("Organic lunch for all"),
    ml("Teacher resource packs"),
    ml("Certificates of participation"),
    ml("Pre & post-visit materials"),
  ],
  details: [
    { label: ml("Duration"), value: ml("Full day (6 hours)") },
    { label: ml("Price"), value: ml("5,000 RWF/student") },
    { label: ml("Group Size"), value: ml("10 - 50 students") },
    { label: ml("Levels"), value: ml("Primary & Secondary") },
    { label: ml("Advance Booking"), value: ml("2 weeks required") },
  ],
  heading: ml("School Visit Programs"),
  subheading: ml(
    "Curriculum-aligned farm visits for primary and secondary schools",
  ),
  curriculumSubjects: [
    {
      id: "s1",
      name: ml("Science & Environment"),
      description: ml("Natural sciences and environmental studies"),
    },
    {
      id: "s2",
      name: ml("Biology & Agriculture"),
      description: ml("Life sciences and agricultural practices"),
    },
    {
      id: "s3",
      name: ml("Geography"),
      description: ml("Land use, climate, and sustainability"),
    },
    {
      id: "s4",
      name: ml("General Knowledge"),
      description: ml("Interdisciplinary learning"),
    },
  ],
  gradeLevels: [
    { value: "primary-lower", label: ml("Primary 1-3") },
    { value: "primary-upper", label: ml("Primary 4-6") },
    { value: "secondary-lower", label: ml("Secondary 1-3") },
    { value: "secondary-upper", label: ml("Secondary 4-6") },
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
    title: ml("Introduction to Organic Farming in Rwanda"),
    description: ml(
      "A comprehensive guide covering the fundamentals of organic agriculture adapted to Rwanda's climate and soil conditions.",
    ),
    type: "guide",
    category: "organic-farming",
    image: farmTour,
    downloadUrl: "#",
    difficulty: "beginner",
    featured: true,
  },
  {
    id: "lr-2",
    title: ml("Beekeeping for Beginners"),
    description: ml(
      "Video tutorial series on starting your first beehive, from equipment selection to your first harvest.",
    ),
    type: "video",
    category: "beekeeping",
    image: beekeeping,
    videoUrl: "#",
    duration: ml("45 min"),
    difficulty: "beginner",
    featured: true,
  },
  {
    id: "lr-3",
    title: ml("Soil Health Assessment Worksheet"),
    description: ml(
      "Printable worksheet for students to assess soil composition, pH levels, and organic matter content.",
    ),
    type: "worksheet",
    category: "soil-science",
    image: educational,
    downloadUrl: "#",
    difficulty: "intermediate",
    featured: false,
  },
  {
    id: "lr-4",
    title: ml("Rwanda's Agricultural Heritage"),
    description: ml(
      "Explore the rich history of farming practices in Rwanda, from ancient terracing to modern organic methods.",
    ),
    type: "article",
    category: "heritage",
    image: farmTour,
    difficulty: "beginner",
    featured: true,
  },
  {
    id: "lr-5",
    title: ml("Composting Masterclass"),
    description: ml(
      "Step-by-step video guide to building and maintaining a productive compost system for smallholder farms.",
    ),
    type: "video",
    category: "sustainability",
    image: educational,
    videoUrl: "#",
    duration: ml("30 min"),
    difficulty: "intermediate",
    featured: false,
  },
  {
    id: "lr-6",
    title: ml("Natural Pest Management Guide"),
    description: ml(
      "Detailed guide on companion planting, biological controls, and organic sprays for common Rwandan crop pests.",
    ),
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
    title: ml("Organic Farming Basics"),
    description: ml(
      "Test your knowledge on fundamental organic farming principles and practices.",
    ),
    category: "organic-farming",
    questionCount: 5,
    duration: "10 min",
    difficulty: "easy",
    questions: [
      {
        id: "q1",
        question: ml(
          "What is the primary benefit of crop rotation in organic farming?",
        ),
        options: [
          ml("Faster growth"),
          ml("Soil nutrient balance & pest reduction"),
          ml("Higher water usage"),
          ml("Reduced labor"),
        ],
        correctIndex: 1,
        explanation: ml(
          "Crop rotation helps maintain soil fertility by alternating nutrient demands and breaks pest and disease cycles naturally.",
        ),
      },
      {
        id: "q2",
        question: ml(
          "Which of the following is NOT an organic pest control method?",
        ),
        options: [
          ml("Companion planting"),
          ml("Synthetic pesticide spray"),
          ml("Neem oil application"),
          ml("Introducing beneficial insects"),
        ],
        correctIndex: 1,
        explanation: ml(
          "Synthetic pesticides are prohibited in organic farming. Organic methods rely on natural alternatives.",
        ),
      },
      {
        id: "q3",
        question: ml("What is composting?"),
        options: [
          ml("Burning crop waste"),
          ml("Decomposing organic matter into nutrient-rich soil amendment"),
          ml("Adding chemical fertilizers"),
          ml("Flooding fields with water"),
        ],
        correctIndex: 1,
        explanation: ml(
          "Composting is the natural process of recycling organic matter into a valuable fertilizer that enriches soil.",
        ),
      },
      {
        id: "q4",
        question: ml("Which practice helps conserve water in organic farming?"),
        options: [
          ml("Flood irrigation"),
          ml("Mulching"),
          ml("Removing all vegetation"),
          ml("Using plastic ground cover"),
        ],
        correctIndex: 1,
        explanation: ml(
          "Mulching retains soil moisture, reduces evaporation, and suppresses weeds naturally.",
        ),
      },
      {
        id: "q5",
        question: ml("What does organic certification ensure?"),
        options: [
          ml("Products are locally grown"),
          ml("No synthetic chemicals used in production"),
          ml("Products are cheaper"),
          ml("Faster delivery"),
        ],
        correctIndex: 1,
        explanation: ml(
          "Organic certification verifies that products are grown and processed without synthetic chemicals, GMOs, or artificial additives.",
        ),
      },
    ],
  },
  {
    id: "quiz-2",
    title: ml("Beekeeping Knowledge Check"),
    description: ml(
      "How much do you know about bees and beekeeping? Find out!",
    ),
    category: "beekeeping",
    questionCount: 5,
    duration: "10 min",
    difficulty: "medium",
    questions: [
      {
        id: "q6",
        question: ml("How many queen bees are typically in a healthy hive?"),
        options: [ml("None"), ml("One"), ml("Two"), ml("Many")],
        correctIndex: 1,
        explanation: ml(
          "A healthy hive has exactly one queen bee who is responsible for laying all the eggs.",
        ),
      },
      {
        id: "q7",
        question: ml("What do bees primarily collect from flowers?"),
        options: [
          ml("Water"),
          ml("Nectar and pollen"),
          ml("Seeds"),
          ml("Leaves"),
        ],
        correctIndex: 1,
        explanation: ml(
          "Bees collect nectar (for honey) and pollen (for protein) from flowers, pollinating plants in the process.",
        ),
      },
      {
        id: "q8",
        question: ml("What is the waggle dance?"),
        options: [
          ml("A mating ritual"),
          ml("A communication method to indicate food sources"),
          ml("A defense mechanism"),
          ml("A sign of illness"),
        ],
        correctIndex: 1,
        explanation: ml(
          "The waggle dance is how forager bees communicate the direction and distance of food sources to other bees.",
        ),
      },
      {
        id: "q9",
        question: ml("What is beeswax used for?"),
        options: [
          ml("Building honeycomb cells"),
          ml("Feeding larvae"),
          ml("Storing water"),
          ml("Protecting the queen"),
        ],
        correctIndex: 0,
        explanation: ml(
          "Worker bees produce beeswax to build the hexagonal comb cells used for storing honey and raising brood.",
        ),
      },
      {
        id: "q10",
        question: ml("When is the best time to harvest honey in Rwanda?"),
        options: [
          ml("During heavy rains"),
          ml("At the end of a flowering season"),
          ml("In winter"),
          ml("At night"),
        ],
        correctIndex: 1,
        explanation: ml(
          "Honey is best harvested at the end of a flowering season when bees have had time to produce surplus honey.",
        ),
      },
    ],
  },
];
