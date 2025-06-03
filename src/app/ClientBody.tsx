"use client";

import { useEffect, useState } from "react";

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
    document.body.className = "antialiased";
  }, []);

  // Show nothing until hydrated to prevent hydration mismatch
  if (!isHydrated) {
    return null;
  }

  return <div className="antialiased">{children}</div>;
}
