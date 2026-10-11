import { JobPageSchema, type JobPage } from "@krizaka/orazaka-shared";

/**
 * Stateless adapter for the job service's operator surface, through the BFF (`/api/v1/**`, AGENTS.md §8). Responses
 * are parsed (`@krizaka/orazaka-shared`): a supervision screen that misreads a shape shows a wrong health.
 */
async function read(path: string): Promise<unknown> {
  const response = await fetch(path);
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
} as const;
