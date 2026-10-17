import { Artist } from "@/components/Artist";
import { Booking } from "@/components/Booking";
import { FeaturedLive } from "@/components/FeaturedLive";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { LatestSets } from "@/components/LatestSets";
import { LightDesk } from "@/components/LightDesk";
import { MediaProvider } from "@/components/Media";
import { Motion } from "@/components/Motion";
import { Nav } from "@/components/Nav";
import { Preloader } from "@/components/Preloader";
import { Quote } from "@/components/Quote";
import { TriangleWipe } from "@/components/TriangleWipe";
import { Venues } from "@/components/Venues";

export default function Home() {
  return (
    <MediaProvider>
      <Preloader />
      <Nav />
      <main>
        <Hero />
        <Venues />
        <FeaturedLive />
        <TriangleWipe />
        <LatestSets />
        <LightDesk />
        <Quote />
        <Artist />
        <Booking />
      </main>
      <Footer />
      <Motion />
    </MediaProvider>
  );
}
