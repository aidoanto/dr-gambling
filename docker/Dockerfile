# =============================================================================
# Dr. Gambling's Computer
# Ubuntu-based container with Node.js, Python, Pi coding agent, and sudo.
# This is where Dr. Gambling lives.
# =============================================================================

# Stage 1: Build frontend and install deps
FROM node:22-bookworm AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile || npm install

# Copy source and build frontend
COPY . .
RUN npx vite build

# Stage 2: Runtime — Dr. Gambling's actual computer
FROM node:22-bookworm

# Install system tools — Dr. Gambling has sudo and full access
RUN apt-get update && apt-get install -y \
    sudo curl wget vim nano htop git \
    python3 python3-pip python3-venv \
    net-tools procps less jq \
    && rm -rf /var/lib/apt/lists/*

# Create Dr. Gambling's user with full sudo access
RUN useradd --create-home --shell /bin/bash dr_gambling && \
    echo "dr_gambling ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Install Pi coding agent globally
RUN npm install -g @mariozechner/pi-coding-agent || echo "Pi install skipped — may need manual setup"

WORKDIR /app

# Copy node_modules and built frontend from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Copy source (for Convex functions, agent code, etc.)
COPY convex ./convex
COPY agent ./agent
COPY src ./src

# Copy Pi configuration to Dr. Gambling's home
COPY .pi /home/dr_gambling/.pi

# Fix ownership
RUN chown -R dr_gambling:dr_gambling /app /home/dr_gambling

# Create persistent directories
RUN mkdir -p /app/data /app/logs && \
    chown -R dr_gambling:dr_gambling /app/data /app/logs

USER dr_gambling

# Install Convex skills for Pi (may fail during build if network restricted)
RUN pi install git:github.com/waynesutton/convexskills 2>/dev/null || true

# Environment
ENV PATH="/app/node_modules/.bin:$PATH"
ENV NODE_ENV=production

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:${BRUNO_PORT:-3000}/health || exit 1

# Start: serve the built frontend (Pi runs separately or alongside)
CMD ["npx", "vite", "preview", "--port", "3000", "--host"]
