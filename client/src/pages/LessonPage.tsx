import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Slide from '../components/Slide';

export default function LessonPage() {
  const location = useLocation();
  const incomingSlides = location.state?.slides || [];
  const [selectedLanguage] = useState('en');


  const slides = incomingSlides.map((raw: string, index: number) => {
    let title = `Slide ${index + 1}`;
    let content = raw.replace(/[“”]/g, '"'); // normalize quotes
  
    // Try to extract a proper title if present
    const titleMatch = content.match(/Title:\s*"(.*?)"/i);
    if (titleMatch) {
      title = titleMatch[1];
    }
  
    // Clean content (remove visual lines, image notes, dashes, text tags)
    content = content
      .replace(/Title:\s*".*?"/i, '')
      .replace(/Image:\s*\[.*?\]/i, '') // remove visuals
      .replace(/Visual:\s*.*?(?=(Text:|[-–—]|"|\n|$))/i, '') // backup visual line
      .replace(/Bullet Points:/i, '')
      .replace(/Text:\s*/i, '')
      .replace(/\[.*?\]/g, '') // remove anything in brackets
      .replace(/^[-–—]+\s*/gm, '') // remove all leading dashes
      .trim();
  
    return { title, content };
  });  

  const [currentIndex, setCurrentIndex] = useState(0);

  // If there are no slides, show fallback message
  if (slides.length === 0) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl text-gray-600">No slides found</h2>
        <p className="text-gray-500 mt-2">Please go back and upload a document first.</p>
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
