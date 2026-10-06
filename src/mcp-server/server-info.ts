/*
 * Server metadata and instructions returned in the MCP initialize response.
 */

import type { Implementation } from "@modelcontextprotocol/sdk/types.js";

const ICON_BASE =
  "https://cloudinary-res.cloudinary.com/image/upload/docsite/brand-assets";

export const serverInfo: Omit<Implementation, "name" | "version"> = {
  title: "Cloudinary Analysis",
  description:
    "Run AI-powered analysis on images including moderation, captioning, tagging, and more.",
  websiteUrl: "https://cloudinary.com/documentation/cloudinary_llm_mcp",
  icons: [32, 96, 192].map((size) => ({
    src: `${ICON_BASE}/cloudinary_favicon_${size}x${size}.png`,
    mimeType: "image/png",
    sizes: [`${size}x${size}`],
  })),
};

export const instructions =
  `Cloudinary Analysis: run AI analysis on images stored in the user's Cloudinary account or at any public URL.

- Input: every analyze-* tool takes source as {uri} (a public image URL) or {asset_id} (an asset in the account; the Asset Management server's search-assets returns it). Local files are not accepted.
- Choosing a tool: analyze-ai-vision-general answers free-form questions about an image (describe it, check it against guidelines, extract details). For structured output, put a JSON schema in the prompt; the JSON comes back as a string in the value field. analyze-ai-vision-tagging applies your own tag definitions, analyze-captioning returns a caption, analyze-image-quality scores quality, and analyze-watermark-detection flags watermarks and banners. coco, lvis, unidet, cld-fashion, cld-text, human-anatomy and shop-classifier detect objects from fixed vocabularies.
- prompts, rejection_questions and tag_definitions accept 1 to 10 items.
- Calls are synchronous by default. With async: true the results go only to a webhook; tasks-get-status reports status, not results.
- Docs: https://cloudinary.com/documentation/analyze_api_guide.md; all Cloudinary docs: https://cloudinary.com/documentation/llms.txt`;
