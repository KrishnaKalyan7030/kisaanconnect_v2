import { useState, useRef } from "react";

const VIDEOS = [
  {
    src: "/assets/videos/farmer1.mp4",
    title: "शेतकरी यशोगाथा",
    duration: "2:15",
  },
  {
    src: "/assets/videos/adv.mp4",
    title: "शिल्पा शेट्टी",
    duration: "0:45",
  },
];

export default function VideoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);

  const current = VIDEOS[currentIndex];

  function goTo(index) {
    setCurrentIndex(index);
    setPlaying(false);
  }

  function nextVideo() {
    goTo((currentIndex + 1) % VIDEOS.length);
  }

  function prevVideo() {
    goTo((currentIndex - 1 + VIDEOS.length) % VIDEOS.length);
  }

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  }

  return (
    <section className="py-12 md:py-20 bg-emerald-900 text-white">
      <div className="max-w-7xl mx-auto px-5">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">KisaanConnect Stories</h2>
        <p className="text-emerald-200 text-center mb-10">Real stories from our farmers</p>
        <div className="grid md:grid-cols-12 gap-6">
          <div className="md:col-span-8">
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
              <video
                ref={videoRef}
                key={current.src}
                src={current.src}
                className="w-full aspect-video"
                controls
                onEnded={nextVideo}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
              />
              <div className="p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <h3 className="font-semibold text-lg text-emerald-900">{current.title}</h3>
                  <p className="text-emerald-600 text-sm">{current.duration}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={prevVideo} className="p-4 hover:bg-emerald-100 rounded-2xl text-emerald-700">
                    <i className="fas fa-step-backward"></i>
                  </button>
                  <button onClick={togglePlay} className="p-4 hover:bg-emerald-100 rounded-2xl text-emerald-700">
                    <i className={`fas ${playing ? "fa-pause" : "fa-play"}`}></i>
                  </button>
                  <button onClick={nextVideo} className="p-4 hover:bg-emerald-100 rounded-2xl text-emerald-700">
                    <i className="fas fa-step-forward"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="md:col-span-4">
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
              {VIDEOS.map((video, index) => (
                <div
                  key={video.src}
                  onClick={() => goTo(index)}
                  className={`p-3 rounded-xl cursor-pointer text-white ${
                    index === currentIndex ? "bg-white/20" : "bg-white/10 hover:bg-white/20"
                  }`}
                >
                  <p className="font-medium">{video.title}</p>
                  <p className="text-sm text-emerald-200">{video.duration}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
