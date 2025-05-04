import * as React from "react";
import { motion } from "framer-motion";
import { BookOpen, Volume2 } from "lucide-react";

// Get background color based on keywords
const getMoodColorClass = (keywords: string[] = []) => {
  const moodMap: { [key: string]: string } = {
    chlorophyll: "bg-green-50",
    sunlight: "bg-yellow-50",
    "carbon dioxide": "bg-green-50",
    photosynthesis: "bg-green-100",
    oxygen: "bg-green-50",
    glucose: "bg-yellow-100",
    ecosystem: "bg-emerald-50",
  };

  // Normalize keywords and find the first match
  const keywordMatch = keywords.find((k) => {
    const key = k.trim().toLowerCase();
    return moodMap[key];
  });

  // If match found, apply its color, else fallback to white
  const color = keywordMatch
    ? moodMap[keywordMatch.trim().toLowerCase()]
    : "bg-white";

  console.log("🌈 Keywords:", keywords, "→ BG Color:", color);
  return color;
};

interface SlideSummaryCardProps {
  title: string;
  summary: string;
  keywords?: string[];
  setCurrentSlideIndex: React.Dispatch<React.SetStateAction<number>>;
  currentSlideIndex: number;
  totalSlides: number;
}

const SlideSummaryCard = ({
  title,
  summary,
  keywords = [],
  setCurrentSlideIndex,
  currentSlideIndex,
  totalSlides,
}: SlideSummaryCardProps) => {
  const bgColor = getMoodColorClass(keywords);

  const speak = async (title: string, summary: string, keywords: string[]) => {
    const fullText = `
      Title: ${title}. 
      Summary: ${summary}.
      Key terms: ${keywords.join(", ")}.
    `;
  
    try {
      const response = await fetch("http://localhost:5003/api/narrate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: fullText }),
      });
  
      if (!response.ok) {
        throw new Error("Narration request failed");
      }
  
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      console.error("🔇 Voice playback error:", error);
      alert("Voice failed to play. Please try again.");
    }
  };
  

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
          return prevIndex < totalSlides - 1 ? prevIndex + 1 : prevIndex;  // Prevent going past the last slide
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
  

  return (
    <motion.div
      className={`${bgColor} rounded-2xl shadow-lg p-6 w-full max-w-xl mx-auto mb-6 border border-gray-200 hover:shadow-xl transition`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-indigo-500" />
          {title}
        </h2>

        {/* Button to trigger voice narration */}
        <button className="slush-btn" onClick={() => speak(title, summary, keywords)}>
          <Volume2 className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Displaying the summary */}
      <p className="text-gray-700 text-base leading-relaxed">{summary}</p>

      {/* Voice Navigation Button */}
      <button className="slush-btn" onClick={startVoiceRecognition}>
        Start Voice Navigation
      </button>

      {keywords.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm text-gray-500 uppercase tracking-wider mb-1">
            Key Terms
          </h4>
          <div className="flex flex-wrap gap-2">
            {keywords.map((word, idx) => (
              <span
                key={idx}
                className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-1 rounded-full"
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};


export default SlideSummaryCard;
