import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart, GraduationCap, Users } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "Student Management",
      description: "Effortlessly manage student records, enrollment, and attendance.",
    },
    {
      icon: <GraduationCap className="w-8 h-8 text-primary" />,
      title: "Academic Performance",
      description: "Track grades, generate reports, and analyze student performance.",
    },
    {
      icon: <BarChart className="w-8 h-8 text-primary" />,
      title: "Analytics & Reporting",
      description: "Gain insights with powerful analytics and customizable reports.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-20 md:py-32 bg-gradient-to-br from-background to-primary/10">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent">
              PB Pagez School System
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              A comprehensive and intuitive platform for academic excellence and efficient school administration.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('/login')}
                size="lg"
                className="gap-2"
              >
                Login to Dashboard
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/student-reports')}
              >
                Access Student Reports
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Key Features</h2>
              <p className="text-muted-foreground mt-4">
                Discover the powerful tools that make our system the best choice for your institution.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="p-8 border rounded-lg text-center bg-card/50">
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
