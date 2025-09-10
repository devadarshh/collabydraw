#!/usr/bin/env bash

# Install pnpm
npm install -g pnpm

# Install all dependencies in the workspace
pnpm install --frozen-lockfile

# Build TypeScript
pnpm run build
