"use client";

import NextTopLoader from "nextjs-toploader";

export default function TopLoader() {
  return (
    <NextTopLoader 
      color="#4f46e1"
      showSpinner={false}
      height={3}
      shadow="0 0 10px #4f46e1,0 0 5px #4f46e1"
    />
  );
}