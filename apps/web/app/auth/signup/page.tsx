"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface FormData {
  name: string;
  email: string;
  password: string;
}

const RegisterPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleRegisterUser = async (
    e: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/register`,
        formData
      );
      toast.success("Account created successfully!");
      router.push("/auth/signin");
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-purple-300 via-indigo-200 to-pink-300 px-4">
      <div className="w-full max-w-md bg-white/80 dark:bg-black/70 backdrop-blur-xl rounded-3xl shadow-2xl p-12 space-y-10 transform transition-all duration-300 hover:scale-105">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-[#8d8bd6] to-[#605ebc] rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">C</span>
          </div>
          <h1 className="text-4xl font-extrabold text-center text-[#605ebc] tracking-tight">
            Collabydraw
          </h1>
          <p className="text-center text-sm text-gray-700 dark:text-gray-300">
            Create your account
          </p>
        </div>

        <form onSubmit={handleRegisterUser} className="space-y-8">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="name">Username</Label>
            <Input
              id="name"
              type="text"
              placeholder="Choose a username"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 rounded-xl border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#8d8bd6] focus:border-[#8d8bd6] hover:shadow-md transition-all duration-200"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 rounded-xl border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#8d8bd6] focus:border-[#8d8bd6] hover:shadow-md transition-all duration-200"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter a password"
              value={formData.password}
              onChange={handleChange}
              required
              className="mt-1 rounded-xl border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#8d8bd6] focus:border-[#8d8bd6] hover:shadow-md transition-all duration-200"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
            style={{
              background: "linear-gradient(to right, #8d8bd6 0%, #605ebc 100%)",
            }}
          >
            {loading ? "Creating..." : "Sign Up"}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-700 dark:text-gray-300 mt-4">
          Already have an account?{" "}
          <a
            href="/auth/signin"
            className="text-[#605ebc] font-medium hover:underline hover:text-[#8d8bd6] cursor-pointer transition-colors"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
