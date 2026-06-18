import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Oware – Ancient African Board Game",
  description: "Play the traditional Ghanaian Oware (Mancala) game online, against an AI or a friend.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
