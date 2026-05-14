import { useEffect } from "react";
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
import { Schema } from "@/components/seo/Schema";
import { organizationSchema, websiteSchema, softwareApplicationSchema } from "@/components/seo/schemas";

const Index = () => {
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const id = hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 150);
      }
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>e-Results GH - School Results Management Platform for Ghana | WAEC BECE Grading</title>
        <meta
          name="description"
          content="The most advanced grading engine built specifically for Ghanaian schools. Automate report sheets, protect data integrity, and deliver WAEC-BECE standard results. Join 500+ schools using e-Results GH."
        />
        <meta
          name="keywords"
          content="eresults, eresultsgh, e-results gh, school results Ghana, BECE grading, WAEC results, report cards, school management platform, Ghana, digital grading, academic management"
        />
        <meta property="og:title" content="e-Results GH - Ghana's Leading School Results Platform" />
        <meta
          property="og:description"
          content="Automate school result reporting with the most advanced grading system built for Ghanaian schools. WAEC and BECE compliant."
        />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://eresultsgh.com/og-banner.png" />
        <meta property="og:url" content="https://eresultsgh.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@eresultsgh" />
        <meta name="twitter:title" content="e-Results GH - School Results Management Platform" />
        <meta
          name="twitter:description"
          content="Ghana's leading SaaS platform for school administration. Automate report sheets, protect data integrity, and deliver WAEC-BECE standard grading."
        />
        <meta name="twitter:image" content="https://eresultsgh.com/og-banner.png" />
        <link rel="canonical" href="https://eresultsgh.com" />
        <meta name="author" content="PB Pagez LTD" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <meta property="og:site_name" content="e-Results GH" />
        <meta name="copyright" content="© 2024 PB Pagez LTD. All rights reserved." />
      </Helmet>

      {/* Structured Data */}
      <Schema data={organizationSchema} />
      <Schema data={websiteSchema} />
      <Schema data={softwareApplicationSchema} />

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

        {/* Video Teaser Section */}
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
