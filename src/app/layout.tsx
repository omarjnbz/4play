import type { Metadata, Viewport } from "next";
import { Archivo, Instrument_Serif, Geist_Mono } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "4PLAY — Nikunj Sharma · DJ & Producer, New Delhi",
  description:
    "4PLAY is the DJ persona of Nikunj Sharma: hypnotic techno, rominimal, deep grooves and psychedelic textures from New Delhi to the Himalayas.",
  keywords: [
    "4PLAY DJ",
    "Nikunj Sharma",
    "Techno DJ New Delhi",
    "Hypnotic Techno",
    "Rominimal DJ India",
    "Psytech",
    "Hard Groove",
  ],
  openGraph: {
    title: "4PLAY — Nikunj Sharma",
    description: "Hypnotic techno, deep grooves and psychedelic textures. DJ & producer from New Delhi.",
    images: ["/media/booth-hd.jpg"],
    type: "website",
  },
  twitter: { card: "summary_large_image", images: ["/media/booth-hd.jpg"] },
};

export const viewport: Viewport = {
  themeColor: "#08090a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${archivo.variable} ${instrument.variable} ${geistMono.variable} antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
