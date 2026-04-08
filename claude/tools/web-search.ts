/**
 * Claude Tool Definitions
 *
 * Tools are capabilities you give Claude to use during a conversation.
 * Add new tools here and pass them into callClaudeWithSearch().
 *
 * Docs: https://docs.anthropic.com/en/docs/tool-use
 */

/** Live web search — used by all 3 RestaurantIQ modules */
export const webSearchTool = {
  type: "web_search_20250305",
  name: "web_search",
} as const;

/**
 * TOOLS YOU COULD ADD LATER:
 *
 * Computer Use tool — lets Claude control a browser to scrape pages directly
 * {
 *   type: "computer_20251022",
 *   name: "computer",
 *   display_width_px: 1280,
 *   display_height_px: 800,
 * }
 *
 * Custom function tool — lets Claude call your own API/database
 * {
 *   name: "get_restaurant_data",
 *   description: "Fetch restaurant data from our internal database",
 *   input_schema: {
 *     type: "object",
 *     properties: {
 *       restaurant_id: { type: "string" }
 *     },
 *     required: ["restaurant_id"]
 *   }
 * }
 */
