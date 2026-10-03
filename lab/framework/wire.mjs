import { flattenLabs } from "./parse-catalog.mjs";
import { loadCatalog } from "./registry.mjs";
import { loadInstance } from "./extract.mjs";

/**
 * Wire manifest: how portal, Dify, and mock services connect for an instance.
 */
export function buildWireManifest(instanceId) {
  const instance = loadInstance(instanceId);
  const catalog = loadCatalog();
  const allLabs = flattenLabs(catalog);
  const enabledIds = new Set(
    instance.enabled_labs.filter((e) => e.enabled).map((e) => e.catalog_id),
  );

  const labs = allLabs
    .filter((lab) => enabledIds.has(lab.id))
    .map((lab) => ({
      catalog_id: lab.id,
      module: lab.module,
      title: lab.title,
      tier: lab.tier,
      portal_slug: lab.portal_slug ?? null,
      portal_chat_path: lab.portal_slug
        ? `/labs/${lab.portal_slug}/chat`
        : null,
      dify_mode: lab.dify_mode ?? null,
      blueprint_id: lab.blueprint_id ?? null,
      mock_tools: lab.module >= 3 ? ["claims_lookup", "prior_auth_lookup"] : [],
    }));

  return {
    instance_id: instance.instance_id,
    generated_at: new Date().toISOString(),
    endpoints: {
      dify_public_url: instance.environment.dify_public_url,
      portal_base: instance.environment.portal_base,
      mock_claims_base: instance.environment.mock_claims_base,
      dify_service_api: `${instance.environment.dify_public_url.replace(/\/$/, "")}/v1/chat-messages`,
    },
    tenancy: {
      user_prefix: "student:",
      note: "Portal BFF must set user=student:<portal_user_id> on every Service API call",
    },
    labs,
  };
}

// CLI
if (process.argv[1]?.endsWith("wire.mjs")) {
  const idx = process.argv.indexOf("--instance");
  const instanceId = idx >= 0 ? process.argv[idx + 1] : "cohort-default";
  console.log(JSON.stringify(buildWireManifest(instanceId), null, 2));
}
