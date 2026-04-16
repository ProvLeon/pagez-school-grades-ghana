import { CheckCircle2, Zap, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import VideoTeaser from "./VideoTeaser";

interface VideoTeaserSectionProps {
  dark?: boolean;
  youtubeId?: string;
  videoUrl?: string;
  vimeoId?: string;
}

const VideoTeaserSection = ({
  dark = false,
  youtubeId,
  videoUrl,
  vimeoId,
}: VideoTeaserSectionProps) => {
  // Build a single videoUrl string — VideoTeaser detects YouTube/Vimeo internally
  const resolvedVideoUrl = youtubeId
    ? `https://www.youtube.com/watch?v=${youtubeId}`
    : vimeoId
      ? `https://vimeo.com/${vimeoId}`
      : videoUrl || "";

  const features = [
    {
      icon: Zap,
      label: "Instant Reports",
      description: "Generate result sheets in seconds",
    },
    {
      icon: Shield,
      label: "Secure & Reliable",
      description: "Bank-grade security for your data",
    },
    {
      icon: CheckCircle2,
      label: "BECE-Standard",
      description: "Aligned with Ghana's grading standards",
    },
  ];

  return (
    <section
      className={cn(
        "py-20 md:py-32 relative overflow-hidden",
        dark ? "bg-slate-900" : "bg-gradient-to-b from-white via-blue-50/30 to-white"
      )}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {!dark && (
          <>
            <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-100/20 rounded-full blur-3xl" />
          </>
        )}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16 md:mb-20">
          <div className="flex justify-center mb-6">
            <div
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border",
                dark
                  ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
                  : "border-blue-200 bg-blue-50 text-blue-700"
              )}
            >
              <span className="w-2 h-2 rounded-full bg-current" />
              See it in Action
            </div>
          </div>

          <h2
            className={cn(
              "text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.15] tracking-tight mb-6",
              dark ? "text-white" : "text-gray-900"
            )}
          >
            Watch How e-Results GH Transforms
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              School Results Management
            </span>
          </h2>

          <p
            className={cn(
              "text-lg md:text-xl max-w-2xl mx-auto",
              dark ? "text-slate-400" : "text-gray-600"
            )}
          >
            A quick walkthrough of how schools across Ghana are streamlining their
            results management with e-Results GH. Simple, secure, and built for Ghanaian
            education.
          </p>
        </div>

        {/* Video Teaser */}
        <div className="mb-20">
          <VideoTeaser
            videoUrl={resolvedVideoUrl}
            title="See e-Results GH in Action"
            description="Streamline your school's results management in minutes"
            dark={dark}
          />
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.label}
                className={cn(
                  "flex flex-col items-center text-center p-8 rounded-2xl transition-all duration-300",
                  dark
                    ? "bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-800"
                    : "bg-white/60 backdrop-blur-sm border border-white/80 shadow-sm hover:shadow-lg hover:border-blue-200"
                )}
              >
                <div
                  className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors",
                    dark
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-blue-100 text-blue-600"
                  )}
                >
                  <Icon className="w-7 h-7" />
                </div>
                <h3
                  className={cn(
                    "text-lg font-bold mb-2",
                    dark ? "text-white" : "text-gray-900"
                  )}
                >
                  {feature.label}
                </h3>
                <p
                  className={cn(
                    "text-sm leading-relaxed",
                    dark ? "text-slate-400" : "text-gray-600"
                  )}
                >
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Trust indicators */}
        <div className="mt-16 pt-12 border-t border-slate-200/50 flex flex-col sm:flex-row items-center justify-center gap-8">
          {[
            "✓ No credit card required",
            "✓ 14-day free trial",
            "✓ Cancel anytime",
          ].map((item) => (
            <p
              key={item}
              className={cn(
                "text-sm font-medium",
                dark ? "text-slate-400" : "text-gray-600"
              )}
            >
              {item}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VideoTeaserSection;
