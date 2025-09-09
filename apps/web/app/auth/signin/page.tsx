"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const SignInPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md bg-white/70 dark:bg-black/60 backdrop-blur-md rounded-2xl shadow-xl p-8 space-y-6 transition-transform hover:scale-[1.02]">
        {/* App Name */}
        <h1 className="text-3xl font-extrabold text-center text-[#605ebc] tracking-wide">
          Collabydraw
        </h1>
        <p className="text-center text-sm text-gray-700 dark:text-gray-300">
          Sign in to continue
        </p>

        {/* Form */}
        <form className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#8d8bd6] focus:border-[#8d8bd6]"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#8d8bd6] focus:border-[#8d8bd6]"
            />
          </div>

          <Button
            type="submit"
            className="w-full py-3 rounded-lg font-semibold text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
            style={{
              background: "linear-gradient(to right, #8d8bd6 0%, #605ebc 100%)",
            }}
          >
            Sign In
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-700 dark:text-gray-300">
          Don’t have an account?{" "}
          <a
            href="/auth/signup"
            className="text-[#605ebc] font-medium hover:underline hover:text-[#8d8bd6] transition-colors"
          >
            Create one
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignInPage;
