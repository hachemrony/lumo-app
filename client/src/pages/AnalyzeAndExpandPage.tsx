import React, { useState, useEffect } from "react";
import SlideSummaryCard from "../components/SlideSummaryCard"; // Adjust the import if necessary

const dummySlides = [
  {
    title: "Photosynthesis Basics",
    summary:
      "Photosynthesis is the process by which green plants use sunlight to make their own food from carbon dioxide and water.",
    keywords: ["Chlorophyll", "Sunlight", "Carbon Dioxide"],
  },
  {
    title: "Importance of Photosynthesis",
    summary:
      "It is the foundation of life on Earth, providing oxygen and energy to all living organisms.",
    keywords: ["Oxygen", "Glucose", "Ecosystem"],
  },
];

export default function AnalyzeAndExpandPage() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Define the startVoiceRecognition function
  const startVoiceRecognition = () => {
    const recognition = new (window.SpeechRecognition || (window as any).webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const command = event.results[0][0].transcript.toLowerCase();
      console.log("Voice Command:", command);

      if (command.includes("next")) {
        console.log("Next Slide Command recognized");
        setCurrentSlideIndex((prevIndex: number) => {
          return prevIndex < dummySlides.length - 1 ? prevIndex + 1 : prevIndex;  // Prevent going past the last slide
        });
      } else if (command.includes("previous")) {
        console.log("Previous Slide Command recognized");
        setCurrentSlideIndex((prevIndex: number) => {
          return prevIndex > 0 ? prevIndex - 1 : prevIndex;  // Prevent going before the first slide
        });
      } else if (command.includes("pause")) {
        console.log("Pause Command recognized");
        speechSynthesis.pause();  // Pause the current narration
      } else {
        console.log("Command not recognized:", command);  // Log unknown commands
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Voice recognition error:", event.error);
    };

    recognition.start();
  };

  // Start voice recognition once the component mounts
  useEffect(() => {
    startVoiceRecognition();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-center mb-8 text-indigo-700">
        Slide Summary
      </h1>
      {dummySlides.map((slide, index) => (
        <SlideSummaryCard
          key={index}
          title={slide.title}
          summary={slide.summary}
          keywords={slide.keywords}
          setCurrentSlideIndex={setCurrentSlideIndex}
          currentSlideIndex={currentSlideIndex}
          totalSlides={dummySlides.length}
        />
      ))}
    </div>
  );
}
