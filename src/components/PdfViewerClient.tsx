"use client";

import dynamic from "next/dynamic";

const Viewer = dynamic(
  () => import("@react-pdf-viewer/core").then((mod) => mod.Viewer),
  { ssr: false }
);

export default function PdfViewerClient(props: any) {
  return <Viewer {...props} />;
}