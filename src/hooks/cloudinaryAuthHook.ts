import { CloudConfig } from "./cloudConfig.js";
import { BeforeRequestContext, BeforeRequestHook } from "./types.js";

/**
 * Attaches Cloudinary authentication to every outgoing request.
 *
 * Priority:
 *   1. OAuth2 Bearer token (if provided via security source)
 *   2. Basic auth (apiKey:apiSecret)
 */
export class CloudinaryAuthHook implements BeforeRequestHook {
    private readonly config: CloudConfig;

    constructor(config: CloudConfig) {
        this.config = config;
    }

    async beforeRequest(
        hookCtx: BeforeRequestContext,
        request: Request,
    ): Promise<Request> {
        // Substitute the {cloud_name} server-variable default ("CLOUD_NAME")
        // with the value resolved from CLOUDINARY_URL / CLOUDINARY_CLOUD_NAME.
        const { cloudName } = this.config;
        if (cloudName && request.url.includes("/CLOUD_NAME/")) {
            request = new Request(
                request.url.replace("/CLOUD_NAME/", `/${cloudName}/`),
                request,
            );
        }

        const security = await this.resolveSecurity(hookCtx.securitySource);

        // 1. OAuth2 Bearer token takes priority
        if (this.isOAuth2Token(security)) {
            request.headers.set("Authorization", `Bearer ${security.oauth2}`);
            return request;
        }

        // 2. Resolve API key / secret (env → security overrides)
        const { apiKey, apiSecret } = this.resolveCredentials(security);
        if (!apiKey || !apiSecret) {
            return request;
        }

        const encoded = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
        request.headers.set("Authorization", `Basic ${encoded}`);

        return request;
    }

    // --- Security resolution ---

    private async resolveSecurity(source: unknown): Promise<unknown> {
        return typeof source === "function" ? source() : source;
    }

    private isOAuth2Token(
        security: unknown,
    ): security is { oauth2: string } {
        return (
            typeof security === "object"
            && security !== null
            && "oauth2" in security
            && typeof (security as any).oauth2 === "string"
            && (security as any).oauth2.length > 0
        );
    }

    private resolveCredentials(security: unknown): {
        apiKey: string;
        apiSecret: string;
    } {
        let { apiKey, apiSecret } = this.config;

        if (!security || typeof security !== "object") {
            return { apiKey, apiSecret };
        }

        const sec = security as Record<string, any>;

        // cloudinaryAuth format (camelCase and snake_case)
        if (sec["cloudinaryAuth"]) {
            const auth = sec["cloudinaryAuth"];
            apiKey = auth.apiKey || auth.api_key || apiKey;
            apiSecret = auth.apiSecret || auth.api_secret || apiSecret;
        }
        // Standard SDK security format (used by MCP server)
        else if ("apiKey" in sec || "apiSecret" in sec) {
            apiKey = sec["apiKey"] || apiKey;
            apiSecret = sec["apiSecret"] || apiSecret;
        }

        return { apiKey, apiSecret };
    }
}
