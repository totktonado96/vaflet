import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Projects from "@/components/Projects";
import Services from "@/components/Services";
import Manifesto from "@/components/Manifesto";
import Founders from "@/components/Founders";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <Marquee />
      <Projects />
      <Services />
      <Manifesto />
      <Founders />
      <Footer />
    </main>
  );
}
