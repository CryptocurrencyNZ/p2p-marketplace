'use client';

import { useEffect, useState } from "react";
import LoadingBar from "react-top-loading-bar";
import { usePathname, useSearchParams } from "next/navigation";

export default function LoadingBarComponent({ 
  color = "#00ff00" // Default to glowing green, but you can change the color
}) {
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track route changes using App Router hooks
  useEffect(() => {
    // When route changes, set progress to show loading
    setProgress(40);

    // After a small delay, complete the loading
    const timeout = setTimeout(() => {
      setProgress(100);
    }, 100);

    return () => clearTimeout(timeout);
  }, [pathname, searchParams]);

  return (
    <LoadingBar
      color={color}
      progress={progress}
      waitingTime={400}
      height={3}
      shadow={true}
      shadowStyle={{
        boxShadow: `0 0 10px ${color}, 0 0 5px ${color}`,
      }}
      onLoaderFinished={() => {
        setProgress(0);
      }}
    />
  );
}