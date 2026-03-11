import {
  partners as seedPartners,
  partnerApplications as seedPartnerApplications,
  type Partner,
  type PartnerAgreement,
  type PartnerApplication,
} from "@/data/community";

const PARTNERS_KEY = "agriEco.partners";
const PARTNER_APPLICATIONS_KEY = "agriEco.partnerApplications";

type NewPartnerInput = {
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  type: Partner["type"];
  aboutBusiness: string;
  status: Partner["status"];
  networkStatus: Partner["networkStatus"];
  commissionRate: number;
  partnerSharePercent: number;
  platformSharePercent: number;
  grossRevenue: number;
  totalBookings: number;
  payoutCycle: Partner["payoutCycle"];
  payoutStatus: Partner["payoutStatus"];
  notes?: string;
};

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

export function getPartners(): Partner[] {
  if (!hasWindow()) return clone(seedPartners);
  return parseJson<Partner[]>(
    window.localStorage.getItem(PARTNERS_KEY),
    clone(seedPartners),
  );
}

export function savePartners(next: Partner[]): void {
  if (!hasWindow()) return;
  window.localStorage.setItem(PARTNERS_KEY, JSON.stringify(next));
}

export function getPartnerApplications(): PartnerApplication[] {
  if (!hasWindow()) return clone(seedPartnerApplications);
  return parseJson<PartnerApplication[]>(
    window.localStorage.getItem(PARTNER_APPLICATIONS_KEY),
    clone(seedPartnerApplications),
  );
}

export function savePartnerApplications(next: PartnerApplication[]): void {
  if (!hasWindow()) return;
  window.localStorage.setItem(PARTNER_APPLICATIONS_KEY, JSON.stringify(next));
}

export function createPartnerAgreement(
  title: string,
  termsSummary: string,
): PartnerAgreement {
  const today = new Date().toISOString().slice(0, 10);
  return {
    id: makeId("agr"),
    title,
    status: "active",
    version: "v1.0",
    effectiveDate: today,
    termsSummary,
    updatedAt: today,
  };
}

export function createPartnerFromInput(input: NewPartnerInput): Partner {
  const today = new Date().toISOString().slice(0, 10);
  const platformShare = Math.max(0, input.platformSharePercent);
  const partnerShare = Math.max(0, input.partnerSharePercent);
  const grossRevenue = Math.max(0, input.grossRevenue);

  const platformEarnings = Math.round((grossRevenue * platformShare) / 100);
  const partnerEarnings = Math.round((grossRevenue * partnerShare) / 100);

  return {
    id: makeId("p"),
    businessName: input.businessName,
    contactPerson: input.contactPerson,
    email: input.email,
    phone: input.phone,
    type: input.type,
    aboutBusiness: input.aboutBusiness,
    status: input.status,
    networkStatus: input.networkStatus,
    commissionRate: input.commissionRate,
    partnerSharePercent: partnerShare,
    platformSharePercent: platformShare,
    grossRevenue,
    partnerEarnings,
    platformEarnings,
    payoutCycle: input.payoutCycle,
    payoutStatus: input.payoutStatus,
    totalBookings: Math.max(0, input.totalBookings),
    totalRevenue: grossRevenue,
    joinedDate: today,
    contractStartDate: today,
    notes: input.notes,
    agreements: [
      createPartnerAgreement(
        "Default Partnership Agreement",
        "Baseline commercial and compliance terms for partner onboarding.",
      ),
    ],
    packages: [],
  };
}

export function createPartnerFromApplication(
  application: PartnerApplication,
): Partner {
  return createPartnerFromInput({
    businessName: application.businessName,
    contactPerson: application.contactPerson,
    email: application.email,
    phone: application.phone,
    type: application.type,
    aboutBusiness: application.aboutBusiness,
    status: "active",
    networkStatus: "onboarding",
    commissionRate: 10,
    partnerSharePercent: 90,
    platformSharePercent: 10,
    grossRevenue: 0,
    totalBookings: 0,
    payoutCycle: "monthly",
    payoutStatus: "pending",
    notes: "Created automatically from partner application approval.",
  });
}

export function appendPartnerApplication(
  payload: Omit<PartnerApplication, "id" | "status" | "appliedDate">,
): PartnerApplication {
  const next: PartnerApplication = {
    id: makeId("partner-app"),
    status: "pending",
    appliedDate: new Date().toISOString().slice(0, 10),
    ...payload,
  };

  const current = getPartnerApplications();
  current.unshift(next);
  savePartnerApplications(current);
  return next;
}
