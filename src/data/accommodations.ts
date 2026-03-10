import { LangCode } from "@/i18n/config";

export type AccommodationType =
  | "standard"
  | "premium"
  | "family"
  | "eco-lodge"
  | "campsite";
export type AccommodationStatus =
  | "available"
  | "maintenance"
  | "occupied"
  | "hidden";

export interface MultiLangValue {
  en: string;
  rw: string;
  fr: string;
  sw: string;
}

export interface Accommodation {
  id: string;
  name: string; // Internal name or EN name
  translatedName: MultiLangValue;
  type: AccommodationType;
  pricePerNight: number;
  capacity: number;
  images: string[];
  description: MultiLangValue;
  amenities: string[];
  status: AccommodationStatus;
  createdAt: string;
}

export const accommodations: Accommodation[] = [
  {
    id: "acc-1",
    name: "Garden View Cottage",
    translatedName: {
      en: "Garden View Cottage",
      rw: "Inzu Ireba Ubusitani",
      fr: "Chalet Vue Jardin",
      sw: "Bustani View Cottage",
    },
    type: "standard",
    pricePerNight: 45000,
    capacity: 2,
    images: ["/assets/accommodations/cottage-1.jpg"],
    description: {
      en: "Cozy cottage overlooking the organic gardens. Features a private porch and eco-friendly amenities.",
      rw: "Inzu nziza ireba ubusitani bwacu bwa kimeza. Ifite urubaraza rwigenga n'ibikoresho bitangiza ibidukikije.",
      fr: "Chalet confortable surplombant les jardins biologiques. Dispose d'un porche privé et d'équipements écologiques.",
      sw: "Nyumba ndogo yenye starehe inayotazama bustani za kikaboni. Ina ukumbi wa kibinafsi na huduma rafiki kwa mazingira.",
    },
    amenities: [
      "Private Porch",
      "Eco-toilet",
      "Solar Lighting",
      "Mosquito Net",
    ],
    status: "available",
    createdAt: "2025-01-10",
  },
  {
    id: "acc-2",
    name: "Hillside Lodge",
    translatedName: {
      en: "Hillside Lodge",
      rw: "Inzu yo ku Musozi",
      fr: "Pavillon à flanc de colline",
      sw: "Hillside Lodge",
    },
    type: "premium",
    pricePerNight: 75000,
    capacity: 2,
    images: ["/assets/accommodations/lodge-1.jpg"],
    description: {
      en: "Spacious lodge with panoramic valley views. Includes a king-sized bed and outdoor rainfall shower.",
      rw: "Inzu nini ifite amashusho meza y'ikibaya. Ifite imenyekanisha nini n'ubwogero bwo hanze.",
      fr: "Pavillon spacieux avec vue panoramique sur la vallée. Comprend un lit king-size et une douche à effet pluie extérieure.",
      sw: "Nyumba kubwa yenye mandhari nzuri ya bonde. Inajumuisha kitanda kikubwa na bafu ya mvua ya nje.",
    },
    amenities: [
      "Valley View",
      "King Bed",
      "Rainfall Shower",
      "Solar Power",
      "Wifi",
    ],
    status: "available",
    createdAt: "2025-01-12",
  },
  {
    id: "acc-3",
    name: "Family Farmhouse",
    translatedName: {
      en: "Family Farmhouse",
      rw: "Inzu y'Umuryango",
      fr: "Ferme familiale",
      sw: "Nyumbani kwa Familia",
    },
    type: "family",
    pricePerNight: 95000,
    capacity: 6,
    images: ["/assets/accommodations/farmhouse-1.jpg"],
    description: {
      en: "Full farmhouse with kitchen, perfect for families. Located near the harvesting fields.",
      rw: "Inzu yose ifite igikoni, ikwiriye imiryango. Iherereye hafi y'imirima y'isarura.",
      fr: "Ferme complète avec cuisine, parfaite pour les familles. Située à proximité des champs de récolte.",
      sw: "Nyumba nzima ya shambani yenye jiko, kamili kwa familia. Iko karibu na mashamba ya kuvuna.",
    },
    amenities: ["Full Kitchen", "3 Bedrooms", "Private Garden", "Laundry"],
    status: "maintenance",
    createdAt: "2025-01-15",
  },
];
