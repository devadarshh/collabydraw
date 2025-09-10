"use client";

import React, { useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuthStore"; // ✅ import store

const RegisterPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const login = useAuthStore((state) => state.login); // ✅ use store action

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/register`,
        formData
      );

      const userData = res.data.data;
      const token = res.data.token;

      const user = {
        name: userData.name,
        email: userData.email,
      };

      toast.success("Account created successfully!");
      router.push("/");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md bg-white/70 dark:bg-black/60 backdrop-blur-md rounded-2xl shadow-xl p-8 space-y-6">
        <h1 className="text-3xl font-extrabold text-center text-[#605ebc]">
          Collabydraw
        </h1>
        <p className="text-center text-sm text-gray-700 dark:text-gray-300">
          Create your account
        </p>

        {/* Form */}
        <form onSubmit={handleRegisterUser} className="space-y-4">
          <div>
            <Label htmlFor="name">Username</Label>
            <Input
              id="name"
              type="text"
              placeholder="Choose a username"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter a password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold text-white"
            style={{
              background: "linear-gradient(to right, #8d8bd6, #605ebc)",
            }}
          >
            {loading ? "Creating..." : "Sign Up"}
          </Button>
        </form>

        <p className="text-center text-sm">
          Already have an account?{" "}
          <a href="/auth/signin" className="text-[#605ebc] hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
