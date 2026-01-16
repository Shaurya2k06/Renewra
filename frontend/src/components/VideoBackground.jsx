import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

const VIDEO_POOL = [
    "https://customer-cbeadsgr09pnsezs.cloudflarestream.com/90bb1b34646b81b3b63e5a854ea00da3/manifest/video.m3u8",
    "https://customer-cbeadsgr09pnsezs.cloudflarestream.com/df176a2fb2ea2b64bd21ae1c10d3af6a/manifest/video.m3u8",
    "https://customer-cbeadsgr09pnsezs.cloudflarestream.com/12a9780eeb1ea015801a5f55cf2e9d3d/manifest/video.m3u8",
    "https://customer-cbeadsgr09pnsezs.cloudflarestream.com/964cb3eddff1a67e3772aac9a7aceea2/manifest/video.m3u8",
    "https://customer-cbeadsgr09pnsezs.cloudflarestream.com/dd17599dfa77f41517133fa7a4967535/manifest/video.m3u8",
    "https://customer-cbeadsgr09pnsezs.cloudflarestream.com/408ad52e3f15bc8f01ae69d194a8cf3a/manifest/video.m3u8",
    "https://customer-cbeadsgr09pnsezs.cloudflarestream.com/e923e67d71fed3e0853ec57f0348451e/manifest/video.m3u8",
    "https://customer-cbeadsgr09pnsezs.cloudflarestream.com/136a8a211c6c3b1cc1fd7b1c7d836c58/manifest/video.m3u8",
    "https://customer-cbeadsgr09pnsezs.cloudflarestream.com/c9ddd33ac3d964e5d33b31ce849e8f95/manifest/video.m3u8",
    "https://customer-cbeadsgr09pnsezs.cloudflarestream.com/257c7359efd4b4aaebcc03aa8fc78a36/manifest/video.m3u8",
    "https://customer-cbeadsgr09pnsezs.cloudflarestream.com/697945ca6b876878dba3b23fbd2f1561/manifest/video.m3u8"
];

const getRandomVideo = () => VIDEO_POOL[Math.floor(Math.random() * VIDEO_POOL.length)];

export default function VideoBackground({
    videoUrl,
    overlayOpacity = 0.4,
    className = "",
    autoRandomize = true
}) {
    const videoRef = useRef(null);
    const hlsRef = useRef(null);
    // Initialize with a random video if one isn't provided, otherwise use the provided one
    const [sourceUrl] = useState(() => videoUrl || (autoRandomize ? getRandomVideo() : VIDEO_POOL[0]));

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // Use the provided url if it changes, otherwise keep the initial random one
        const currentSource = videoUrl || sourceUrl;

        if (Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
            });
            hlsRef.current = hls;

            hls.loadSource(currentSource);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play().catch(e => console.log('Autoplay prevented:', e));
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Native HLS support (Safari)
            video.src = currentSource;
            video.addEventListener('loadedmetadata', () => {
                video.play().catch(e => console.log('Autoplay prevented:', e));
            });
        }

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
            }
        };
    }, [videoUrl, sourceUrl]);

    return (
        <div className={`video-bg-container ${className}`}>
            <video
                ref={videoRef}
                className="video-element"
                muted
                loop
                playsInline
                autoPlay
                style={{ opacity: 1 }} // Controlled by parent container or overlay
            />
            {/* Overlay for text contrast */}
            <div
                className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-300"
                style={{ opacity: overlayOpacity }}
            />
        </div>
    );
}
