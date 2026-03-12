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

export function getAboutTeamMembers(): AboutTeamMember[] {
  if (!hasWindow()) return clone(seedTeamMembers);
  return parseJson<AboutTeamMember[]>(
    window.localStorage.getItem(ABOUT_TEAM_KEY),
    clone(seedTeamMembers),
  );
}

export function saveAboutTeamMembers(next: AboutTeamMember[]): void {
  if (!hasWindow()) return;
  window.localStorage.setItem(ABOUT_TEAM_KEY, JSON.stringify(next));
}

export function getAboutGalleryImages(): AboutGalleryImage[] {
  if (!hasWindow()) return clone(seedGalleryImages);
  return parseJson<AboutGalleryImage[]>(
    window.localStorage.getItem(ABOUT_GALLERY_KEY),
    clone(seedGalleryImages),
  );
}

export function saveAboutGalleryImages(next: AboutGalleryImage[]): void {
  if (!hasWindow()) return;
  window.localStorage.setItem(ABOUT_GALLERY_KEY, JSON.stringify(next));
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

