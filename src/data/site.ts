export interface AboutTeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  bio: string;
  email?: string;
  phone?: string;
}

export interface AboutGalleryImage {
  id: string;
  url: string;
  caption?: string;
}

export const aboutTeamMembers: AboutTeamMember[] = [
  {
    id: "about-team-1",
    name: "Dr. Samuel Green",
    role: "Founder & CEO",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&h=400&auto=format&fit=crop",
    bio: "With 20 years in sustainable agriculture, Dr. Samuel started Agri-Eco to bridge the gap between rural farmers and urban families.",
    email: "samuel.green@agrieco.market",
  },
  {
    id: "about-team-2",
    name: "Sarah Richards",
    role: "Head of Quality Control",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&h=400&auto=format&fit=crop",
    bio: "Sarah ensures every product that leaves our warehouse meets the highest organic certifications and freshness standards.",
    email: "sarah.richards@agrieco.market",
  },
  {
    id: "about-team-3",
    name: "David Nkurunziza",
    role: "Farmer Relations Manager",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&h=400&auto=format&fit=crop",
    bio: "David works directly with over 50 local farms, ensuring fair trade practices and helping them transition to organic methods.",
    phone: "+250 788 555 210",
  },
  {
    id: "about-team-4",
    name: "Elena Martinez",
    role: "Logistics Director",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&h=400&auto=format&fit=crop",
    bio: "The 'Engine' of Agri-Eco, Elena manages our supply chain to guarantee next-day delivery for our fresh produce.",
    email: "elena.martinez@agrieco.market",
  },
];

export const aboutGalleryImages: AboutGalleryImage[] = [
  {
    id: "about-gallery-1",
    url: "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?q=80&w=600&auto=format&fit=crop",
    caption: "Sunrise over our main vegetable fields.",
  },
  {
    id: "about-gallery-2",
    url: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=600&auto=format&fit=crop",
    caption: "Local farmers harvesting the morning produce.",
  },
  {
    id: "about-gallery-3",
    url: "https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=600&auto=format&fit=crop",
    caption: "Children visiting our educational demo farm.",
  },
  {
    id: "about-gallery-4",
    url: "https://images.unsplash.com/photo-1592419044706-39796d40f98c?q=80&w=600&auto=format&fit=crop",
    caption: "Sorting and quality checks inside the pack house.",
  },
  {
    id: "about-gallery-5",
    url: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=600&auto=format&fit=crop",
    caption: "Community gathering during a weekend farm tour.",
  },
  {
    id: "about-gallery-6",
    url: "https://images.unsplash.com/photo-1495570689269-d883b1224443?q=80&w=600&auto=format&fit=crop",
    caption: "Fresh produce ready to ship to Kigali.",
  },
];

