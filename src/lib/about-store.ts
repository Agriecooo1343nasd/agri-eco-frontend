import {
  aboutGalleryImages as seedGalleryImages,
  aboutTeamMembers as seedTeamMembers,
  type AboutGalleryImage,
  type AboutTeamMember,
} from "@/data/site";

const ABOUT_TEAM_KEY = "agriEco.about.team";
const ABOUT_GALLERY_KEY = "agriEco.about.gallery";

function parseJson<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function hasWindow(): boolean {
  return typeof window !== "undefined";
}

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

// In-memory clones to replace localStorage
let memoryTeam: AboutTeamMember[] = clone(seedTeamMembers);
let memoryGallery: AboutGalleryImage[] = clone(seedGalleryImages);

export function getAboutTeamMembers(): AboutTeamMember[] {
  return clone(memoryTeam);
}

export function saveAboutTeamMembers(next: AboutTeamMember[]): void {
  memoryTeam = clone(next);
}

export function getAboutGalleryImages(): AboutGalleryImage[] {
  return clone(memoryGallery);
}

export function saveAboutGalleryImages(next: AboutGalleryImage[]): void {
  memoryGallery = clone(next);
}

export type NewTeamMemberInput = Omit<AboutTeamMember, "id">;

export function createTeamMember(input: NewTeamMemberInput): AboutTeamMember {
  return {
    id: makeId("team"),
    ...input,
  };
}

export type NewGalleryImageInput = Omit<AboutGalleryImage, "id">;

export function createGalleryImage(
  input: NewGalleryImageInput,
): AboutGalleryImage {
  return {
    id: makeId("gallery"),
    ...input,
  };
}

