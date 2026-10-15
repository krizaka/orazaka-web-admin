import { z } from "zod";

/**
 * What the conversation service's operator surface returns, parsed on arrival: a console that misreads a shape shows a
 * wrong health or a wrong switch. The wire shapes are the records of `StatusController`, `ModelController` and
 * `FeatureController`.
 */
export const HealthSchema = z.object({
  status: z.string(),
  pgVectorConnected: z.boolean(),
  pgVectorExtensionInstalled: z.boolean(),
  ollamaConnected: z.boolean(),
  ollamaModels: z.array(z.string()).default([]),
  defaultProvider: z.string(),
  message: z.string().nullish(),
});
export type Health = z.infer<typeof HealthSchema>;

export const InfrastructureSchema = z.object({ video: z.boolean(), image: z.boolean() });
export type Infrastructure = z.infer<typeof InfrastructureSchema>;

export const ModelEntrySchema = z.object({
  id: z.number().nullish(),
  modelName: z.string(),
  modelLabel: z.string().nullish(),
  category: z.string(),
  providerName: z.string().nullish(),
  isDefault: z.boolean().nullish(),
  compatible: z.boolean().default(true),
  incompatibleReason: z.string().nullish(),
  description: z.string().nullish(),
});
export type ModelEntry = z.infer<typeof ModelEntrySchema>;

export const CapabilitySchema = z.object({
  featureKey: z.string(),
  handlerKey: z.string(),
  routingKey: z.string(),
  billableUnit: z.string().nullish(),
  billableCapability: z.string().nullish(),
  latencyClass: z.string().nullish(),
  enabled: z.boolean(),
});
export type Capability = z.infer<typeof CapabilitySchema>;
