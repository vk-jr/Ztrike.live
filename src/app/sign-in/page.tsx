"use client";

import { SignIn } from "@/components/auth/SignIn.new";

export default function SignInPage() {
  return (    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8">
        <div className="w-12 h-12 mx-auto mb-4">
          <img src="/images/logo.png" alt="Ztrike Logo" className="w-full h-full" />
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-900">Welcome to ZTRIKE</h1>
        <p className="text-gray-600 text-center mt-2">Connect with athletes, teams, and leagues</p>
      </div>
      <SignIn />
      <p className="mt-4 text-center text-gray-600">
        Don&apos;t have an account?{" "}
        <a href="/sign-up" className="text-blue-600 hover:text-blue-800 font-medium">
          Sign up
        </a>
      </p>
    </div>
  );
}
