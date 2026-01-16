import VideoBackground from './VideoBackground';

export default function LandingSection({
    children,
    className = "",
    videoOpacity = 0.4,
    noVideo = false
}) {
    return (
        <section className={`relative w-full py-32 md:py-56 overflow-hidden ${className}`}>
            {/* Background Video */}
            {!noVideo && <VideoBackground overlayOpacity={0.7} />}

            {/* Content Container */}
            <div className="relative z-10 w-full max-w-[1024px] mx-auto px-6">
                {children}
            </div>
        </section>
    );
}
