"use client";

import React, { Suspense, useState } from "react";
import axios from "axios";
import { Input } from "@/components/room/ui/input";
import { Button } from "@/components/room/ui/button";
import { Label } from "@/components/room/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/auth/useAuthStore"; // ✅ Zustand auth store

const SignInPage = () => {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  // handleLoginUser
  const handleLoginUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/login`,
        formData
      );

      const userData = res.data.data;
      const token = res.data.token;

      const user = {
        name: userData.name,
        email: userData.email,
      };

      login(user, token); // ✅ save both user and token

      toast.success("Signed in successfully!");
      router.push("/");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md bg-white/70 dark:bg-black/60 backdrop-blur-md rounded-2xl shadow-xl p-8 space-y-6 transition-transform hover:scale-[1.02]">
          <h1 className="text-3xl font-extrabold text-center text-[#605ebc] tracking-wide">
            Collabydraw
          </h1>
          <p className="text-center text-sm text-gray-700 dark:text-gray-300">
            Sign in to continue
          </p>

          {/* Form */}
          <form onSubmit={handleLoginUser} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#8d8bd6] focus:border-[#8d8bd6]"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                className="rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#8d8bd6] focus:border-[#8d8bd6]"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
              style={{
                background:
                  "linear-gradient(to right, #8d8bd6 0%, #605ebc 100%)",
              }}
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

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
    </Suspense>
  );
};

export default SignInPage;
