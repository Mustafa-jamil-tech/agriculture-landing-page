import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { motion } from 'framer-motion';

const App: React.FC = () => {
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [videosLoaded, setVideosLoaded] = useState([false, false, false]);
  
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const videoSources = [
    '/assets/videos/farmer-spray.mp4',
    '/assets/videos/buffalo-feed.mp4',
    '/assets/videos/milking.mp4'
  ];

  const handleVideoLoaded = useCallback((index: number) => {
    setVideosLoaded(prev => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      try {
        const scrollTop = window.scrollY;
        const maxScroll = Math.max(
          document.documentElement.scrollHeight - window.innerHeight,
          1
        );
        const progress = Math.min(Math.max(scrollTop / maxScroll, 0), 1);
        
        let newIndex = 0;
        if (progress >= 0.66) {
          newIndex = 2;
        } else if (progress >= 0.33) {
          newIndex = 1;
        } else {
          newIndex = 0;
        }
        
        setActiveVideoIndex(newIndex);
        
        const activeVideo = videoRefs.current[newIndex];
        if (activeVideo && videosLoaded[newIndex]) {
          try {
            const duration = activeVideo.duration;
            if (duration && isFinite(duration) && duration > 0) {
              let sectionProgress = 0;
              if (newIndex === 0) {
                sectionProgress = progress / 0.33;
              } else if (newIndex === 1) {
                sectionProgress = (progress - 0.33) / 0.33;
              } else {
                sectionProgress = (progress - 0.66) / 0.34;
              }
              
              sectionProgress = Math.min(Math.max(sectionProgress, 0), 1);
              const targetTime = sectionProgress * duration;
              
              if (isFinite(targetTime) && targetTime >= 0) {
                activeVideo.currentTime = targetTime;
              }
            }
          } catch (error) {
            console.debug('Video scrubbing error:', error);
          }
        }
      } catch (error) {
        console.debug('Scroll handler error:', error);
      }
    };

    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, [videosLoaded]);

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      
      try {
        if (index === activeVideoIndex && videosLoaded[index]) {
          if (video.ended) {
            video.currentTime = 0;
          }
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {});
          }
          video.style.opacity = '1';
          video.style.zIndex = '2';
        } else {
          video.pause();
          video.style.opacity = '0';
          video.style.zIndex = '1';
        }
      } catch (error) {
        console.debug('Video playback error:', error);
      }
    });
  }, [activeVideoIndex, videosLoaded]);

  const TypewriterText = ({ text, delay = 100 }: { text: string; delay?: number }) => {
    const [displayText, setDisplayText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
      const timer = setTimeout(() => {
        if (currentIndex < text.length) {
          setDisplayText(prev => prev + text[currentIndex]);
          setCurrentIndex(prev => prev + 1);
        } else {
          setIsComplete(true);
        }
      }, delay);

      return () => clearTimeout(timer);
    }, [currentIndex, text, delay]);

    return (
      <span>
        {displayText}
        {!isComplete && (
          <span className="inline-block w-1 h-6 bg-white/70 animate-pulse ml-1"></span>
        )}
      </span>
    );
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="fixed inset-0 w-full h-full overflow-hidden bg-white">
        {videoSources.map((src, index) => (
          <video
            key={index}
            ref={el => {
              videoRefs.current[index] = el;
            }}
            src={src}
            muted
            playsInline
            preload="auto"
            loop
            onLoadedMetadata={() => handleVideoLoaded(index)}
            className="absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out"
            style={{
              opacity: index === activeVideoIndex && videosLoaded[index] ? 1 : 0,
              zIndex: index === activeVideoIndex ? 2 : 1,
              pointerEvents: 'none',
              backgroundColor: 'white',
            }}
          />
        ))}
        
        {!videosLoaded.every(loaded => loaded) && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-50">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-lg text-gray-700">ویڈیوز لوڈ ہو رہی ہیں...</p>
            </div>
          </div>
        )}
      </div>

      <div className="relative z-10">
        {/* Section 1: Crops Spray */}
        <section className="h-screen flex items-center px-4 sm:px-8 md:px-16 lg:px-24">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-lg"
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 sm:p-10 md:p-12 border border-white/20 shadow-2xl shadow-black/5">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 text-right drop-shadow-lg">
                <TypewriterText text="فصلوں کی حفاظت" delay={100} />
              </h1>
              <p className="text-lg sm:text-xl text-white/90 leading-relaxed text-right drop-shadow-md">
                <TypewriterText text="جدید سپرے اور کیڑے مار ادویات" delay={80} />
              </p>
              <div className="mt-6 flex flex-wrap gap-3 justify-end">
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white border border-white/20">
                  🌿 ماحول دوست
                </span>
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white border border-white/20">
                  🛡️ مکمل تحفظ
                </span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Section 2: Buffalo Feed */}
        <section className="h-screen flex items-center justify-end px-4 sm:px-8 md:px-16 lg:px-24">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-lg"
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 sm:p-10 md:p-12 border border-white/20 shadow-2xl shadow-black/5">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 text-right drop-shadow-lg">
                <TypewriterText text="بہترین بھینسوں کی خوراک" delay={100} />
              </h1>
              <p className="text-lg sm:text-xl text-white/90 leading-relaxed text-right drop-shadow-md">
                <TypewriterText text="کھل اور چوکر - دودھ میں اضافہ" delay={80} />
              </p>
              <div className="mt-6 flex flex-wrap gap-3 justify-end">
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white border border-white/20">
                  🐃 اعلیٰ پروٹین
                </span>
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white border border-white/20">
                  🥛 دودھ 2x
                </span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Section 3: Premium Feed */}
        <section className="h-screen flex items-center px-4 sm:px-8 md:px-16 lg:px-24">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-lg w-full"
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 sm:p-10 md:p-12 border border-white/20 shadow-2xl shadow-black/5">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 text-right drop-shadow-lg">
                <TypewriterText text="پریمیم کھل اور چوکر" delay={100} />
              </h1>
              <p className="text-lg sm:text-xl text-white/90 leading-relaxed text-right drop-shadow-md">
                <TypewriterText text="مکمل غذائیت - زیادہ دودھ" delay={80} />
              </p>
              <div className="mt-6 flex flex-wrap gap-3 justify-end">
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white border border-white/20">
                  🐃 دودھ میں اضافہ
                </span>
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white border border-white/20">
                  🌾 100% قدرتی
                </span>
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white border border-white/20">
                  💪 صحت مند
                </span>
              </div>
            </div>
          </motion.div>
        </section>
      </div>

      {/* Floating WhatsApp Button */}
      <motion.a
        href="https://wa.me/923155788455?text=Salam!%20Mujhe%20aapki%20shop%20se%20kuch%20products%20order%20karne%20hain."
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
        className="fixed bottom-6 right-6 z-50 bg-green-500 text-white p-4 rounded-full shadow-2xl hover:shadow-green-500/50 transition-all duration-300 hover:scale-110 hover:bg-green-600"
      >
        <FaWhatsapp className="w-8 h-8" />
      </motion.a>
    </div>
  );
};

export default App;