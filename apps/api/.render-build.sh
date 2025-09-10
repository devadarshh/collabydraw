#!/usr/bin/env bash

# Go to monorepo root
cd ..

# Install pnpm globally
npm install -g pnpm

# Install all dependencies in the workspace
pnpm install --frozen-lockfile

# Build the API
cd apps/api
pnpm run build
