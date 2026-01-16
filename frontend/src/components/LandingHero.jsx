import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import VideoBackground from './VideoBackground';

export default function LandingHero() {
    return (
        <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
            <VideoBackground overlayOpacity={0.5} />

            <div className="relative z-10 w-full max-w-[1024px] px-6 flex flex-col items-center text-center">
                {/* Animated Reveal Container */}
                <div className="animate-reveal">
                    <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light text-sm font-medium text-white/80">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                        <span>Invest in the Future of Energy</span>
                    </div>

                    <h1 className="text-hero text-white mb-6">
                        Invest in <br />
                        <span className="text-white/90">Renewable Energy</span>
                    </h1>

                    <p className="text-body-large text-white/80 max-w-2xl mx-auto mb-10">
                        Tokenized solar, wind, and battery storage assets.
                        Institutional-grade infrastructure with transparent NAV and automated yield.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/subscribe"
                            className="glass-button h-14 px-8 rounded-full flex items-center justify-center text-lg font-medium group"
                        >
                            Start Investing
                            <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                        </Link>

                        <Link
                            to="/projects"
                            className="glass-button h-14 px-8 rounded-full flex items-center justify-center text-lg font-medium hover:bg-white/10"
                        >
                            View Projects
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
