import { JobPageSchema, type JobPage } from "@krizaka/orazaka-shared";
import { z } from "zod";
import {
  CapabilitySchema,
  HealthSchema,
  InfrastructureSchema,
  ModelEntrySchema,
  type Capability,
  type Health,
  type Infrastructure,
  type ModelEntry,
} from "./platform.schemas";

/**
 * Stateless adapter for the job service's operator surface, through the BFF (`/api/v1/**`, AGENTS.md §8). Responses
 * are parsed (`@krizaka/orazaka-shared`): a supervision screen that misreads a shape shows a wrong health.
 */
async function read(path: string): Promise<unknown> {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

async function write(path: string, method: "PUT" | "POST", body?: unknown): Promise<unknown> {
  const response = await fetch(path, { method, body: body === undefined ? undefined : JSON.stringify(body) });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

export const PlatformAdminApi = {
  /** The latest jobs of every workspace (an administrator's token lists them all), newest first. */
  fetchJobs: async (size = 200): Promise<JobPage> => JobPageSchema.parse(await read(`/api/v1/jobs?page=0&size=${size}`)),

  /** How many job streams (SSE) are open right now: people watching their work. */
  activeConnections: async (): Promise<number> => {
    const value = Number(await read("/api/v1/jobs/active-connections"));
    return Number.isFinite(value) ? value : 0;
  },

  /** Readiness of the conversation service's dependencies (database, pgvector, Ollama, default provider). */
  health: async (): Promise<Health> => HealthSchema.parse(await read("/api/v1/status/health")),

  /** Whether the local video and image engines answer. */
  infrastructure: async (): Promise<Infrastructure> => InfrastructureSchema.parse(await read("/api/v1/status/infrastructure")),

  /** The model registry (catalogue with host compatibility). */
  models: async (): Promise<ModelEntry[]> => z.array(ModelEntrySchema).parse(await read("/api/v1/models/catalog")),

  /** The providers the registry knows. */
  providers: async (): Promise<string[]> => z.array(z.string()).parse(await read("/api/v1/models/providers")),

  /** Every capability, enabled or not (administrator only). */
  capabilities: async (): Promise<Capability[]> => z.array(CapabilitySchema).parse(await read("/api/v1/features/all")),

  /** Enables or disables one capability: a disabled one is not dispatched. */
  setCapability: async (featureKey: string, isEnabled: boolean): Promise<Capability> =>
    CapabilitySchema.parse(await write(`/api/v1/features/${encodeURIComponent(featureKey)}`, "PUT", { isEnabled })),
} as const;
