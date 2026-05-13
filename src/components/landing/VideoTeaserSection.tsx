import { CheckCircle2, Zap, Shield, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import VideoTeaser from "./VideoTeaser";
import { useState, useEffect } from "react";

interface RecommendedVideo {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  duration?: string;
}

interface VideoTeaserSectionProps {
  dark?: boolean;
  youtubeId?: string;
  videoUrl?: string;
  vimeoId?: string;
  channelHandle?: string;
  showRecommendedVideos?: boolean;
}

const VideoTeaserSection = ({
  dark = false,
  youtubeId,
  videoUrl,
  vimeoId,
  channelHandle = "pbpagez4480",
  showRecommendedVideos = true,
}: VideoTeaserSectionProps) => {
  const [recommendedVideos, setRecommendedVideos] = useState<RecommendedVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<RecommendedVideo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (showRecommendedVideos && channelHandle) {
      fetchChannelVideos();
    }
  }, [channelHandle, showRecommendedVideos]);

  const fetchChannelVideos = async () => {
    setIsLoading(true);
    try {
      const sampleVideos: RecommendedVideo[] = [
        {
          id: "dQw4w9WgXcQ",
          title: "Quick Tutorial: Getting Started with e-Results GH",
          thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
          url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          duration: "5:30",
        },
        {
          id: "jNQXAC9IVRw",
          title: "Advanced Features: Result Sheets & Reports",
          thumbnail: "https://img.youtube.com/vi/jNQXAC9IVRw/mqdefault.jpg",
          url: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
          duration: "8:15",
        },
        {
          id: "ZF_4tRCfJqw",
          title: "Security & Data Protection Overview",
          thumbnail: "https://img.youtube.com/vi/ZF_4tRCfJqw/mqdefault.jpg",
          url: "https://www.youtube.com/watch?v=ZF_4tRCfJqw",
          duration: "4:45",
        },
      ];
      setRecommendedVideos(sampleVideos);
    } catch (error) {
      console.error("Failed to fetch channel videos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const videoToPlay = selectedVideo
    ? selectedVideo.url
    : youtubeId
      ? `https://www.youtube.com/watch?v=${youtubeId}`
      : vimeoId
        ? `https://vimeo.com/${vimeoId}`
        : videoUrl || "";

  const videoTitle = selectedVideo
    ? selectedVideo.title
    : "See e-Results GH in Action";

  const videoDescription = selectedVideo
    ? "Watch this tutorial from our channel"
    : "Streamline your school's results management in minutes";

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
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {!dark && (
          <>
            <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-100/20 rounded-full blur-3xl" />
          </>
        )}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

        <div className="mb-8 md:mb-12">
          <VideoTeaser
            videoUrl={videoToPlay}
            title={videoTitle}
            description={videoDescription}
            thumbnail="/thumbnail.jpg"
            dark={dark}
          />
        </div>


      </div>
    </section>
  );
};

export default VideoTeaserSection;
