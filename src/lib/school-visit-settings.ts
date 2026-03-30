import type { MultiLangValue } from "@/components/admin/MultiLangInput";
import type { SchoolVisitConfig } from "@/data/education";
import { schoolVisitConfig } from "@/data/education";
import type {
  AdminSchoolVisitSettings,
  MultiLangText,
} from "@/lib/api/education";

/** Normalize API multi-lang fields to full MultiLangValue for UI / t(). */
export function toMultiLangValue(
  m?: Partial<MultiLangText> | null,
): MultiLangValue {
  const en = m?.en ?? "";
  return {
    en,
    rw: m?.rw ?? en,
    fr: m?.fr ?? en,
    sw: m?.sw ?? en,
  };
}

function bySort<T extends { sortOrder?: number }>(arr: T[] | undefined): T[] {
  return [...(arr ?? [])].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  );
}

/** Labels for program detail rows (static UI). */
export const schoolVisitDetailLabels = {
  duration: {
    en: "Duration",
    rw: "Igihe",
    fr: "Durée",
    sw: "Muda",
  },
  pricePerStudent: {
    en: "Price per student",
    rw: "Igiciro ku mwana",
    fr: "Prix par élève",
    sw: "Bei kwa mwanafunzi",
  },
  groupSize: {
    en: "Group size",
    rw: "Umubare w'abanyeshuri",
    fr: "Taille du groupe",
    sw: "Ukubwa wa kikundi",
  },
} satisfies Record<string, MultiLangText>;

export const schoolVisitSectionTitles = {
  whatsIncluded: {
    en: "What's included",
    rw: "Ibintu birimo",
    fr: "Inclus",
    sw: "Kinachojumuishwa",
  },
  programDetails: {
    en: "Program details",
    rw: "Ibisobanuro by'urutonde",
    fr: "Détails du programme",
    sw: "Maelezo ya programu",
  },
} satisfies Record<string, MultiLangText>;

/** Sidebar callout cards (static copy; group size line interpolates min/max). */
export const schoolVisitMetaCopy = {
  advanceBookingTitle: {
    en: "Advance booking",
    rw: "Kwandika mbere",
    fr: "Réservation anticipée",
    sw: "Uhifadhi mapema",
  },
  advanceBookingBody: {
    en: "Submit requests at least 2 weeks before your preferred visit date.",
    rw: "Ohereza ibisabwa by'igihe nibura by'ibyumweru 2 mbere y'itariki wifuza.",
    fr: "Envoyez votre demande au moins 2 semaines avant la date souhaitée.",
    sw: "Wasilisha maombi angalau wiki 2 kabla ya tarehe unayotaka.",
  },
  groupSizeTitle: {
    en: "Group size",
    rw: "Umubare w'ikipe",
    fr: "Taille du groupe",
    sw: "Ukubwa wa kikundi",
  },
  groupSizeBetween: {
    en: "Visits support groups of",
    rw: "Urugendo rwemewe rw'abanyeshuri",
    fr: "Les visites accueillent des groupes de",
    sw: "Ziwezesha vikundi vya",
  },
  studentsWord: {
    en: "students.",
    rw: "abanyeshuri.",
    fr: "élèves.",
    sw: "wanafunzi.",
  },
  confirmationTitle: {
    en: "Confirmation window",
    rw: "Igihe cyo kwemeza",
    fr: "Délai de confirmation",
    sw: "Dirisha la uthibitisho",
  },
  confirmationBody: {
    en: "We review requests and confirm schedules within 48 hours.",
    rw: "Dusuzuma ibisabwa no kwemeza igihe mu masaha 48.",
    fr: "Nous examinons les demandes et confirmons sous 48 heures.",
    sw: "Tunakagua maombi na kuthibitisha ratiba ndani ya saa 48.",
  },
} satisfies Record<string, MultiLangText>;

/**
 * Maps GET /school-visits/settings to the same shape as static `schoolVisitConfig`
 * for hub + booking page. Sorts inclusion/subject/grade arrays by `sortOrder`.
 */
export function mergeSchoolVisitSettings(
  settings: AdminSchoolVisitSettings | null | undefined,
): SchoolVisitConfig {
  if (!settings) return schoolVisitConfig;

  const subjects = bySort(settings.subjects);
  const gradeLevels = bySort(settings.gradeLevels);
  const inclusionList = bySort(settings.inclusions).map((i) =>
    toMultiLangValue(i.text),
  );

  return {
    heading: toMultiLangValue(settings.sectionHeading),
    subheading: toMultiLangValue(settings.sectionSubheading),
    whatsIncluded: inclusionList.length
      ? inclusionList
      : schoolVisitConfig.whatsIncluded,
    details: [
      {
        label: toMultiLangValue(schoolVisitDetailLabels.duration),
        value: toMultiLangValue({ en: settings.duration }),
      },
      {
        label: toMultiLangValue(schoolVisitDetailLabels.pricePerStudent),
        value: toMultiLangValue({
          en: `${Number(settings.pricePerStudent ?? 0)} RWF`,
        }),
      },
      {
        label: toMultiLangValue(schoolVisitDetailLabels.groupSize),
        value: toMultiLangValue({
          en: `${settings.minStudents} – ${settings.maxStudents} students`,
        }),
      },
    ],
    curriculumSubjects: subjects.length
      ? subjects.map((subject, index) => ({
          id: `subject-${index + 1}`,
          name: toMultiLangValue(subject.name),
          description: subject.description
            ? toMultiLangValue(subject.description)
            : undefined,
        }))
      : schoolVisitConfig.curriculumSubjects,
    gradeLevels: gradeLevels.length
      ? gradeLevels.map((g, index) => ({
          value: `grade-${index + 1}`,
          label: toMultiLangValue(g.label),
        }))
      : schoolVisitConfig.gradeLevels,
  };
}
