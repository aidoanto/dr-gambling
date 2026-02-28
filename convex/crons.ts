import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Tick the simulation every 30 seconds
// At 10x speed: 30 real seconds = 5 simulated minutes
crons.interval("simulation tick", { seconds: 30 }, internal.simulation.tick);

export default crons;
