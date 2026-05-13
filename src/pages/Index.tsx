import { Helmet } from "react-helmet";
import LandingNav from "@/components/landing/LandingNav";
import HeroSection from "@/components/landing/HeroSection";
import StatsBar from "@/components/landing/StatsBar";
import FeaturesSection from "@/components/landing/FeaturesSection";
import WhyChooseSection from "@/components/landing/WhyChooseSection";
import VideoTeaserSection from "@/components/landing/VideoTeaserSection";
import PricingSection from "@/components/landing/PricingSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import FAQSection from "@/components/landing/FAQSection";
import CTASection from "@/components/landing/CTASection";
import LandingFooter from "@/components/landing/LandingFooter";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>e-Results GH - School Results Management Platform for Ghana</title>
        <meta
          name="description"
          content="The most advanced grading engine built specifically for Ghanaian schools. Automate reports, protect data integrity, and deliver results parents trust."
        />
        <meta
          name="keywords"
          content="school results, grading system, BECE grading, Ghana schools, report cards, academic management"
        />
        <meta property="og:title" content="e-Results GH - School Results Management" />
        <meta
          property="og:description"
          content="Automate school result reporting with Ghana's leading academic management platform."
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://eresultsgh.com" />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground">
        {/* Navigation */}
        <LandingNav />

        {/* Hero Section */}
        <HeroSection />

        {/* Stats Bar */}
        <StatsBar />

        {/* Features Section */}
        <FeaturesSection />

        {/* Why Choose Section */}
        <WhyChooseSection />

        {/* Video Teaser Section - Optimal position: post-awareness, pre-pricing decision */}
        <VideoTeaserSection videoUrl="https://youtu.be/46zpjmruErA" />

        {/* Pricing Section */}
        <PricingSection />

        {/* Testimonials Section */}
        <TestimonialsSection />

        {/* FAQ Section */}
        <FAQSection />

        {/* Final CTA Section */}
        <CTASection />

        {/* Footer */}
        <LandingFooter />
      </div>
    </>
  );
};

export default Index;
