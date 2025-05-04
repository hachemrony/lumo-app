import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Slide from '../components/Slide';
import translations from '../i18n/translations';

export default function LessonPage() {
  const location = useLocation();

  const [slides, setSlides] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem('selectedLanguage') || 'en';
  });

  // ✅ Load slides from location.state or localStorage
  useEffect(() => {
    let rawSlides = location.state?.slides;
    console.log("🟡 Received from location.state.slides:", rawSlides);

    if (!rawSlides) {
      const stored = localStorage.getItem('exploreSlides');
      console.log("🟠 Loaded from localStorage:", stored);
      if (stored) {
        try {
          rawSlides = JSON.parse(stored);
        } catch (err) {
          console.error("❌ Failed to parse exploreSlides:", err);
          rawSlides = [];
        }
      }
    }

    const parsedSlides = Array.isArray(rawSlides) ? rawSlides : [];
console.log("✅ Final slides parsed:", parsedSlides);
setSlides(parsedSlides);

localStorage.removeItem('lessonDraft');
localStorage.setItem('loadDraftOnStart', 'false');

// ⏳ Delay cleanup by 1 second
setTimeout(() => {
  localStorage.removeItem('exploreSlides');
}, 1000);

  }, [location.state]);

  // ✅ Keep selectedLanguage synced
  useEffect(() => {
    const interval = setInterval(() => {
      const storedLanguage = localStorage.getItem('selectedLanguage') || 'en';
      setSelectedLanguage(storedLanguage);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // 🚨 If no valid slides, show fallback
  if (!slides.length) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl text-gray-600">
          {translations.noSlidesTitle[selectedLanguage as 'en' | 'fr']}
        </h2>
        <p className="text-gray-500 mt-2">
          {translations.noSlidesSubtitle[selectedLanguage as 'en' | 'fr']}
        </p>
      </div>
    );
  }

  
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <Slide
        title={slides[currentIndex].title}
        content={slides[currentIndex].content}
        slides={slides}
        onPrevious={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
        onNext={() => setCurrentIndex((i) => Math.min(i + 1, slides.length - 1))}
        isFirst={currentIndex === 0}
        isLast={currentIndex === slides.length - 1}
        currentSlideIndex={currentIndex}
        selectedLanguage={selectedLanguage}
      />
    </div>
  );
}
