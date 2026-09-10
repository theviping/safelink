import { Routes, Route } from "react-router-dom";

import Navbar from "./components/landing/Navbar";
import Hero from "./components/landing/Hero";
import Features from "./components/landing/Features";
import HowItWorks from "./components/landing/HowItWorks";
import About from "./components/landing/About";
import EmergencyCTA from "./components/landing/EmergencyCTA";
import Footer from "./components/landing/Footer";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

const Home = () => {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-white">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <About />
      <EmergencyCTA />
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;