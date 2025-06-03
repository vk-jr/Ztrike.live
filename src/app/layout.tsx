import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthLayout from "@/components/auth/AuthLayout";
import { Chatbot } from "@/components/Chatbot";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ZTRIKE - Sports Social Network",
  description: "Connect with athletes, coaches, and sports professionals",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthLayout>
          {children}
        </AuthLayout>
        <Chatbot />
        <Toaster />
      </body>
    </html>
  );
}
