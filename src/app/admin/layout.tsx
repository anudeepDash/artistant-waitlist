import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false,
    noimageindex: true,
    "max-snippet": -1,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
