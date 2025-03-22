"use client";

import { useEffect, useState } from "react";
import LoadingBar from "react-top-loading-bar";
import { usePathname } from "next/navigation";


export default function LoadingBarComponent({ 
  color = "#00ff00" // Default to glowing green

}) {
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();
  
  // Only using pathname for route change detection
  // Avoiding useSearchParams() which requires Suspense
  useEffect(() => {
    // When route changes, set progress to show loading
    setProgress(40);

    // After a small delay, complete the loading
    const timeout = setTimeout(() => {
      setProgress(100);
    }, 100);

    return () => clearTimeout(timeout);
  }, [pathname]);

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
