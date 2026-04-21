"use client";

import {
  deliveryAgents,
  initialDeliveryOrders,
  initialReturns,
  type DeliveryOrder,
  type DeliveryStatus,
  type ReturnRequest,
  type ReturnStatus,
} from "@/data/operations-mock";

const RETURNS_KEY = "agri-eco.mock.returns";
const DELIVERIES_KEY = "agri-eco.mock.deliveries";

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export async function listReturns(): Promise<ReturnRequest[]> {
  const rows = readLocal<ReturnRequest[]>(RETURNS_KEY, initialReturns);
  // Auto-heal older mock payloads so delivery-agent pages always show seeded returns.
  if (!rows.some((r) => r.assignedAgent)) {
    writeLocal(RETURNS_KEY, initialReturns);
    return initialReturns;
  }
  return rows;
}

export async function createReturn(input: {
  orderId: string;
  product: string;
  buyer: string;
  reason: string;
  amount: number;
}) {
  const rows = await listReturns();
  const next: ReturnRequest = {
    id: `RET-${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    status: "Pending",
    ...input,
  };
  const updated = [next, ...rows];
  writeLocal(RETURNS_KEY, updated);
  return next;
}

export async function appealReturn(id: string, appealNote: string) {
  const rows = await listReturns();
  const updated = rows.map((r) =>
    r.id === id ? { ...r, status: "Appealed" as ReturnStatus, appealNote } : r,
  );
  writeLocal(RETURNS_KEY, updated);
}

export async function reviewReturn(input: {
  id: string;
  status: ReturnStatus;
  adminNote?: string;
}) {
  const rows = await listReturns();
  const updated = rows.map((r) =>
    r.id === input.id
      ? { ...r, status: input.status, adminNote: input.adminNote ?? r.adminNote }
      : r,
  );
  writeLocal(RETURNS_KEY, updated);
}

export async function assignReturnToAgent(id: string, agent: string) {
  const rows = await listReturns();
  const updated = rows.map((r) =>
    r.id === id ? { ...r, assignedAgent: agent, agentStatus: "Pending pickup" } : r,
  );
  writeLocal(RETURNS_KEY, updated);
}

export async function updateAgentReturnStatus(
  id: string,
  status: "Pending pickup" | "Picked up" | "Returned to warehouse",
) {
  const rows = await listReturns();
  const updated = rows.map((r) => (r.id === id ? { ...r, agentStatus: status } : r));
  writeLocal(RETURNS_KEY, updated);
}

export async function listDeliveryOrders(agent?: string): Promise<DeliveryOrder[]> {
  const rows = readLocal<DeliveryOrder[]>(DELIVERIES_KEY, initialDeliveryOrders);
  if (!agent) return rows;
  return rows.filter((o) => o.assignedAgent === agent);
}

export async function updateDeliveryOrderStatus(id: string, status: DeliveryStatus) {
  const rows = readLocal<DeliveryOrder[]>(DELIVERIES_KEY, initialDeliveryOrders);
  const updated = rows.map((o) => (o.id === id ? { ...o, status } : o));
  writeLocal(DELIVERIES_KEY, updated);
}

export async function listDeliveryOrdersPaginated(params: {
  agent?: string;
  search?: string;
  status?: DeliveryStatus | "all";
  page?: number;
  limit?: number;
}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const all = await listDeliveryOrders(params.agent);
  const q = (params.search ?? "").toLowerCase().trim();
  const filtered = all.filter((o) => {
    const statusOk =
      !params.status || params.status === "all" || o.status === params.status;
    if (!statusOk) return false;
    if (!q) return true;
    return (
      o.orderId.toLowerCase().includes(q) ||
      o.customer.toLowerCase().includes(q) ||
      o.address.toLowerCase().includes(q)
    );
  });
  const start = (page - 1) * limit;
  return {
    data: filtered.slice(start, start + limit),
    pagination: {
      total: filtered.length,
      page,
      limit,
      pages: Math.max(1, Math.ceil(filtered.length / limit)),
      hasNext: start + limit < filtered.length,
      hasPrev: page > 1,
    },
  };
}

export async function getDeliveryOrderById(id: string) {
  const rows = await listDeliveryOrders();
  return rows.find((o) => o.id === id || o.orderId === id) ?? null;
}

export async function addDeliveryOrderNote(id: string, note: string) {
  const rows = readLocal<DeliveryOrder[]>(DELIVERIES_KEY, initialDeliveryOrders);
  const updated = rows.map((o) =>
    o.id === id
      ? {
          ...o,
          agentNotes: [
            ...(o.agentNotes ?? []),
            { id: `NOTE-${Date.now()}`, text: note, createdAt: new Date().toISOString() },
          ],
        }
      : o,
  );
  writeLocal(DELIVERIES_KEY, updated);
}

export async function addDeliveryOrderProofImage(id: string, file: File) {
  const rows = readLocal<DeliveryOrder[]>(DELIVERIES_KEY, initialDeliveryOrders);
  const dataUrl = await fileToDataUrl(file);
  const updated = rows.map((o) =>
    o.id === id
      ? {
          ...o,
          proofImages: [...(o.proofImages ?? []), { name: file.name, dataUrl }],
        }
      : o,
  );
  writeLocal(DELIVERIES_KEY, updated);
}

export async function removeDeliveryOrderProofImage(id: string, imageName: string) {
  const rows = readLocal<DeliveryOrder[]>(DELIVERIES_KEY, initialDeliveryOrders);
  const updated = rows.map((o) =>
    o.id === id
      ? {
          ...o,
          proofImages: (o.proofImages ?? []).filter((p) => p.name !== imageName),
        }
      : o,
  );
  writeLocal(DELIVERIES_KEY, updated);
}

export async function verifyDeliveryByQr(id: string, qr: string) {
  const rows = readLocal<DeliveryOrder[]>(DELIVERIES_KEY, initialDeliveryOrders);
  const target = rows.find((o) => o.id === id);
  if (!target) return false;
  const ok = qr.trim() === `${target.orderId}-QR` || qr.trim() === target.orderId;
  if (!ok) return false;
  const updated = rows.map((o) =>
    o.id === id ? { ...o, status: "Delivered" as DeliveryStatus, qrVerified: true } : o,
  );
  writeLocal(DELIVERIES_KEY, updated);
  return true;
}

export async function listAssignedReturnsForAgent(
  agent: string,
  params?: { search?: string; page?: number; limit?: number },
) {
  const rows = (await listReturns()).filter((r) => r.assignedAgent === agent);
  const q = (params?.search ?? "").toLowerCase().trim();
  const filtered = rows.filter((r) => {
    if (!q) return true;
    return (
      r.id.toLowerCase().includes(q) ||
      r.orderId.toLowerCase().includes(q) ||
      r.product.toLowerCase().includes(q)
    );
  });
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const start = (page - 1) * limit;
  return {
    data: filtered.slice(start, start + limit),
    pagination: {
      total: filtered.length,
      page,
      limit,
      pages: Math.max(1, Math.ceil(filtered.length / limit)),
      hasNext: start + limit < filtered.length,
      hasPrev: page > 1,
    },
  };
}

export async function getReturnById(id: string) {
  const rows = await listReturns();
  return rows.find((r) => r.id === id) ?? null;
}

export async function addReturnAgentNote(id: string, note: string) {
  const rows = await listReturns();
  const updated = rows.map((r) =>
    r.id === id
      ? {
          ...r,
          agentNotes: [
            ...(r.agentNotes ?? []),
            { id: `NOTE-${Date.now()}`, text: note, createdAt: new Date().toISOString() },
          ],
        }
      : r,
  );
  writeLocal(RETURNS_KEY, updated);
}

export async function addReturnProofImage(id: string, file: File) {
  const rows = await listReturns();
  const dataUrl = await fileToDataUrl(file);
  const updated = rows.map((r) =>
    r.id === id
      ? {
          ...r,
          proofImages: [...(r.proofImages ?? []), { name: file.name, dataUrl }],
        }
      : r,
  );
  writeLocal(RETURNS_KEY, updated);
}

export async function removeReturnProofImage(id: string, imageName: string) {
  const rows = await listReturns();
  const updated = rows.map((r) =>
    r.id === id
      ? {
          ...r,
          proofImages: (r.proofImages ?? []).filter((p) => p.name !== imageName),
        }
      : r,
  );
  writeLocal(RETURNS_KEY, updated);
}

export async function verifyReturnByQr(id: string, qr: string) {
  const rows = await listReturns();
  const target = rows.find((r) => r.id === id);
  if (!target) return false;
  const ok = qr.trim() === `${target.id}-QR` || qr.trim() === target.id;
  if (!ok) return false;
  const updated = rows.map((r) =>
    r.id === id
      ? { ...r, qrVerified: true, agentStatus: "Returned to warehouse" as const }
      : r,
  );
  writeLocal(RETURNS_KEY, updated);
  return true;
}

export async function assignOrderToDeliveryAgent(order: {
  orderId: string;
  customer: string;
  address: string;
  phone: string;
  amount: number;
  items: string;
  agent: string;
}) {
  const rows = readLocal<DeliveryOrder[]>(DELIVERIES_KEY, initialDeliveryOrders);
  const exists = rows.some((r) => r.orderId === order.orderId);
  if (exists) return;
  rows.unshift({
    id: `DLV-${Date.now()}`,
    orderId: order.orderId,
    customer: order.customer,
    address: order.address,
    phone: order.phone,
    items: order.items,
    amount: order.amount,
    eta: "TBD",
    status: "Assigned",
    assignedAgent: order.agent,
    distanceKm: 0,
  });
  writeLocal(DELIVERIES_KEY, rows);
}

export { deliveryAgents };
