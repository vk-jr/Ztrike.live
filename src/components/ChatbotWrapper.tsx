'use client';

import { usePathname } from "next/navigation";
import { Chatbot } from "./Chatbot";

export function ChatbotWrapper() {
  const pathname = usePathname();
  const isAuthPage = pathname === '/sign-in' || pathname === '/sign-up';

  if (isAuthPage) {
    return null;
  }

  return <Chatbot />;
}
