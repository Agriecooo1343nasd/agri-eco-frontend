import { ml, type MultiLangValue } from "@/components/admin/MultiLangInput";

export interface BlogPost {
  id: string;
  title: MultiLangValue;
  excerpt: MultiLangValue;
  content: MultiLangValue;
  author: string;
  authorAvatar?: string;
  category: string;
  tags: string[];
  image: string;
  publishedAt: string;
  readTime: number;
  status: "draft" | "published" | "archived";
  featured: boolean;
}

export const blogCategories = [
  "Farming Tips",
  "Sustainability",
  "Recipes",
  "Community Stories",
  "Market Updates",
  "Beekeeping",
  "Education",
];

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: ml("10 Tips for Starting Your Organic Garden"),
    excerpt: ml(
      "Learn the essential steps to transform your backyard into a thriving organic garden with practical advice from local farmers.",
    ),
    content: ml(
      "Starting an organic garden can be one of the most rewarding experiences. Here are ten proven tips from Rwanda's experienced farmers...\n\n1. Start with healthy soil. Composting is key to building nutrient-rich soil.\n2. Choose native and adapted varieties that thrive in your local climate.\n3. Practice crop rotation to maintain soil health.\n4. Use companion planting to naturally deter pests.\n5. Water deeply but less frequently to encourage strong root growth.",
    ),
    author: "Dr. Marie Uwimana",
    category: "Farming Tips",
    tags: ["organic", "gardening", "beginners"],
    image: "/assets/tours/farm-banner.jpg",
    publishedAt: "2025-01-15",
    readTime: 8,
    status: "published",
    featured: true,
  },
  {
    id: "2",
    title: ml("The Sweet Science of Rwandan Honey"),
    excerpt: ml(
      "Discover how local beekeepers are producing some of the finest organic honey in East Africa.",
    ),
    content: ml(
      "Rwanda's unique climate and diverse flora create perfect conditions for producing exceptional honey. Our beekeepers combine traditional knowledge with modern sustainable practices...",
    ),
    author: "Prof. Jean Ndayisaba",
    category: "Beekeeping",
    tags: ["honey", "beekeeping", "sustainability"],
    image: "/assets/hero-banner.jpg",
    publishedAt: "2025-01-10",
    readTime: 6,
    status: "published",
    featured: false,
  },
  {
    id: "3",
    title: ml("Building Resilient Communities Through Agriculture"),
    excerpt: ml(
      "How cooperative farming models are strengthening rural communities across Rwanda.",
    ),
    content: ml(
      "Agriculture has always been the backbone of Rwandan communities. Today, innovative cooperative models are taking this connection to new heights...",
    ),
    author: "Eng. Patrick Kagabo",
    category: "Community Stories",
    tags: ["community", "cooperatives", "rural development"],
    image: "/assets/tours/educational.jpg",
    publishedAt: "2025-01-05",
    readTime: 10,
    status: "published",
    featured: true,
  },
];
