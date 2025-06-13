import { Inter } from "next/font/google";
import "./globals.css";
import AuthLayout from "@/components/auth/AuthLayout";
import { ChatbotWrapper } from "@/components/ChatbotWrapper";
import { Toaster } from "@/components/ui/toaster";
import { metadata } from './metadata';

const inter = Inter({ subsets: ["latin"] });

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
        <ChatbotWrapper />
        <Toaster />
      </body>
    </html>
  );
}
