import Navbar from "../components/LandingPage/Navbar/Navbar";
import Hero from "../components/LandingPage/Hero/Hero";
import Features from "../components/LandingPage/Features/Features";
import Footer from "../components/LandingPage/Footer/Footer";

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <Features />
      </main>
      <Footer />
    </div>
  );
};

export default Landing;