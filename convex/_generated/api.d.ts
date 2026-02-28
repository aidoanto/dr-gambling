/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agent from "../agent.js";
import type * as auth from "../auth.js";
import type * as brain from "../brain.js";
import type * as characters from "../characters.js";
import type * as chat from "../chat.js";
import type * as crons from "../crons.js";
import type * as http from "../http.js";
import type * as market from "../market.js";
import type * as patients from "../patients.js";
import type * as portfolio from "../portfolio.js";
import type * as seed from "../seed.js";
import type * as seedCharacters from "../seedCharacters.js";
import type * as simulation from "../simulation.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  agent: typeof agent;
  auth: typeof auth;
  brain: typeof brain;
  characters: typeof characters;
  chat: typeof chat;
  crons: typeof crons;
  http: typeof http;
  market: typeof market;
  patients: typeof patients;
  portfolio: typeof portfolio;
  seed: typeof seed;
  seedCharacters: typeof seedCharacters;
  simulation: typeof simulation;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
