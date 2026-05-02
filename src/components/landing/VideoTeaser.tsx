import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Play, X } from "lucide-react";

interface VideoTeaserProps {
  videoUrl: string;
  thumbnail?: string;
  title?: string;
  description?: string;
  autoPlay?: boolean;
  controls?: boolean;
  className?: string;
  dark?: boolean;
}

const VideoTeaser: React.FC<VideoTeaserProps> = ({
  videoUrl,
  thumbnail,
  title = "Product Demo",
  description,
  autoPlay = false,
  controls = true,
  className,
  dark = false,
}) => {
  const [showModal, setShowModal] = useState(false);

  // Determine video source type
  const isYouTube = videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");
  const isVimeo = videoUrl.includes("vimeo.com");

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.includes("youtu.be")
      ? url.split("/").pop()
      : new URLSearchParams(new URL(url).search).get("v");
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  };

  const getVimeoEmbedUrl = (url: string) => {
    const videoId = url.split("/").pop();
    return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
  };

  const embedUrl = isYouTube ? getYouTubeEmbedUrl(videoUrl) : isVimeo ? getVimeoEmbedUrl(videoUrl) : null;

  return (
    <>
      {/* Video Teaser Container */}
      <div
        className={cn(
          "relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl group",
          "border",
          dark ? "border-slate-700" : "border-gray-200",
          className
        )}
      >
        {/* Thumbnail/Poster Background */}
        <div
          className={cn(
            "relative w-full bg-gradient-to-br from-slate-900 to-slate-950 aspect-video",
            "flex items-center justify-center overflow-hidden"
          )}
          style={
            thumbnail
              ? {
                backgroundImage: `url(${thumbnail})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
              : {}
          }
        >
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />

          {/* Animated play button */}
          <button
            onClick={() => setShowModal(true)}
            className={cn(
              "relative z-10 flex items-center justify-center",
              "w-24 h-24 rounded-full bg-white text-[#2563EB]",
              "hover:bg-blue-50 hover:scale-110 hover:shadow-3xl",
              "transition-all duration-300 shadow-2xl cursor-pointer",
              "group-hover:scale-105"
            )}
            aria-label="Play video"
          >
            <Play className="w-10 h-10 fill-current ml-0.5" />
          </button>

          {/* Title and description overlay */}
          {title && (
            <div className="absolute bottom-0 left-0 right-0 z-20 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white">
              <h3 className="text-2xl md:text-3xl font-bold">{title}</h3>
              {description && (
                <p className="text-sm md:text-base text-gray-100 mt-2 max-w-2xl">{description}</p>
              )}
            </div>
          )}
        </div>

        {/* Duration/Info badge */}
        <div className="absolute top-4 right-4 z-20 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold">
          ▶ Watch Demo
        </div>
      </div>

      {/* Video Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="relative w-full max-w-5xl">
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className={cn(
                "absolute -top-12 right-0 p-2 rounded-lg transition-all",
                "text-white hover:text-gray-300 hover:bg-white/10",
                "focus:outline-none focus:ring-2 focus:ring-blue-500"
              )}
              aria-label="Close video"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Video Container */}
            <div className="relative w-full bg-black rounded-xl overflow-hidden shadow-2xl aspect-video">
              {embedUrl ? (
                // Embedded iframe for YouTube/Vimeo
                <iframe
                  src={embedUrl}
                  title={title}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                // HTML5 video for local files
                <video
                  src={videoUrl}
                  autoPlay
                  controls={controls}
                  className="w-full h-full"
                  controlsList="nodownload"
                />
              )}
            </div>

            {/* Video info below modal */}
            {title && (
              <div className="mt-6 text-white">
                <h3 className="text-2xl font-bold">{title}</h3>
                {description && <p className="text-base text-gray-300 mt-2">{description}</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default VideoTeaser;
