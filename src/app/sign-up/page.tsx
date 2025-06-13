"use client";

import { SignUp } from "@/components/auth/SignUp";

export default function SignUpPage() {
  return (    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8">
        <div className="w-12 h-12 mx-auto mb-4">
          <img src="/images/logo.png" alt="Ztrike Logo" className="w-full h-full" />
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-900">Join ZTRIKE</h1>
        <p className="text-gray-600 text-center mt-2">Connect with the sports community</p>
      </div>
      <SignUp />
      <p className="mt-4 text-center text-gray-600">
        Already have an account?{" "}
        <a href="/sign-in" className="text-blue-600 hover:text-blue-800 font-medium">
          Sign in
        </a>
      </p>
    </div>
  );
}
