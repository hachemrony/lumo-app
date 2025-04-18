import React, { useRef, useState } from 'react';
import { useEffect } from 'react';
import jsPDF from 'jspdf';

type SlideProps = {
    title: string;
    content: string;
    slides: { title: string; content: string }[];
    onNext: () => void;
    onPrevious: () => void;
    isFirst: boolean;
    isLast: boolean;
    currentSlideIndex: number;
    selectedLanguage: string;
};
  
export default function Slide({
    title,
    content,
    slides,
    onNext,
    onPrevious,
    isFirst,
    isLast,
    currentSlideIndex,
    selectedLanguage,
}: SlideProps) {
    
    const cleanText = (raw: string): string => {
        return raw
          .replace(/[\u{1F300}-\u{1F6FF}]/gu, '') // remove emojis
          .replace(/[\u{2600}-\u{26FF}]/gu, '')   // remove misc symbols
          .replace(/[\u{2700}-\u{27BF}]/gu, '')   // remove dingbats
          .replace(/[^ -~\n\r]/g, '')             // remove non-ASCII
          .replace(/([,.-])/g, '$1 ')             // add a slight pause after punctuation
          .replace(/\s+/g, ' ');                  // collapse extra spaces
      };
      
      const handleSpeak = () => {
        stopNarration();
      
        const titleClean = cleanText(title);
        const contentClean = cleanText(content);
      
        const voiceText = `${titleClean}. ... ${contentClean}`;
      
        const speakNow = () => {
          const voices = window.speechSynthesis.getVoices();
      
          const preferredVoice =
            voices.find((v) => v.name.includes("Microsoft") && v.name.toLowerCase().includes("female")) ||
            voices.find((v) => v.lang === "en-GB" && v.name.toLowerCase().includes("female")) ||
            voices.find((v) => v.name.toLowerCase().includes("zira")) ||
            voices.find((v) => v.name.toLowerCase().includes("jenny")) ||
            null;
      
          const utter = new SpeechSynthesisUtterance(voiceText);
          utter.voice = preferredVoice;
          utter.lang = preferredVoice?.lang || 'en-US';
          utter.rate = 0.85;
      
          window.speechSynthesis.speak(utter);
        };
      
        const loadVoices = () => {
          const voices = window.speechSynthesis.getVoices();
          if (voices.length > 0) {
            speakNow();
          } else {
            setTimeout(loadVoices, 100);
          }
        };
      
        loadVoices();
      };
      
      
      
    
      const stopNarration = () => {
        window.speechSynthesis.cancel();
      };
      

      const handleStop = () => {
        window.speechSynthesis.cancel(); // ✅ This is now the only thing we need
      };    
          
      
    const handleDownload = () => {
        const doc = new jsPDF();
        slides.forEach((slide: { title: string; content: string }, index: number) => {
          if (index !== 0) doc.addPage();
          doc.setFontSize(16);
          doc.text(slide.title, 10, 20);
          doc.setFontSize(12);
          doc.text(doc.splitTextToSize(slide.content, 180), 10, 30);
        });
      
        doc.save('Lesson-Slides.pdf');
      };
      const slideRef = useRef<HTMLDivElement>(null);
    
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [question, setQuestion] = React.useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [answer, setAnswer] = useState('');
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
          if (event.key === 'ArrowRight') {
            onNext();
          } else if (event.key === 'ArrowLeft') {
            onPrevious();
          }
        };
      
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
      }, [onNext, onPrevious]);
      
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [notes, setNotes] = useState<{ [index: number]: string }>({});


    const handleFullscreen = () => {
        const el = slideRef.current;
        if (!el) return;

        if (!document.fullscreenElement) {
          el.requestFullscreen().catch(err => {
            console.error("❌ Failed to enter full screen:", err);
          });
        } else {
          document.exitFullscreen();
        }
    };

    const handleAskClick = () => {
        setQuestion('');
        setAnswer('');
        setIsModalOpen(true);
      };
      
      const handleSubmitQuestion = async () => {
        if (!question.trim()) return;
      
        setIsLoading(true);
        setAnswer('');
      
        try {
          const response = await fetch('http://localhost:5007/api/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question, context: content }),
          });
          const data = await response.json();
          setAnswer(data.answer);
      
          // 🗣️ Narrate ONLY the AI's answer
          const utter = new SpeechSynthesisUtterance(data.answer);

          utter.lang = 'en-US';
          utter.voice =
           window.speechSynthesis.getVoices().find((v) =>
           ["Samantha", "Microsoft Zira", "Google US English"].includes(v.name)
          ) || null;


          utter.rate = 0.85;


          setAnswer(data.answer);
        } catch (err) {
          setAnswer('Something went wrong. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };
      
      const handleSave = async () => {
        const fileData = {
          title,
          slides,
          notes, // ✅ Include the user notes
        };
      
        const blob = new Blob([JSON.stringify(fileData, null, 2)], { type: 'application/json' });
      
        try {
          const fileHandle = await (window as any).showSaveFilePicker({
            suggestedName: 'lesson.json',
            types: [
              {
                description: 'Lesson File',
                accept: { 'application/json': ['.json'] },
              },
            ],
          });
      
          const writable = await fileHandle.createWritable();
          await writable.write(blob);
          await writable.close();
      
          alert('✅ File saved successfully!');
        } catch (err) {
          console.error('❌ Save canceled or failed', err);
        }
      };
      
      
      const handleExit = () => {
        // eslint-disable-next-line no-restricted-globals
        const shouldSave = confirm("Do you want to save your work before exiting?");
        if (shouldSave) {
          handleSave();
        }
        window.location.href = '/'; // or use a router redirect
      };
      useEffect(() => {
        const messages = [
          "Empowering Education with AI",
          "Instantly Summarized",
          "Multilingual Support",
          "Visual Learning Made Easy"
        ];
      
        let i = 0;
        const taglineEl = document.getElementById("tagline-text");
      
        const rotate = () => {
          if (taglineEl) {
            taglineEl.style.opacity = '0';
            setTimeout(() => {
              taglineEl.innerText = messages[i];
              taglineEl.style.opacity = '1';
              i = (i + 1) % messages.length;
            }, 500);
          }
        };
      
        const interval = setInterval(rotate, 3000);
        rotate();
      
        return () => clearInterval(interval);
      }, []);
      
  return (
    <div
      ref={slideRef}
      className="relative bg-white px-8 py-12 rounded-2xl shadow-lg border border-gray-200 w-full max-w-5xl mx-auto min-h-[500px] flex flex-col justify-between"
    >
      <div
       className="flex flex-col gap-2 overflow-hidden"
       style={{ height: '400px' }}
      >

      <h2 className="text-2xl font-bold text-left flex-shrink-0">{title}</h2>
      <div
        className="flex-1 overflow-y-auto pr-2 text-lg whitespace-pre-line"
        style={{
         textAlign: 'left',
         lineHeight: '1.6',
        }}
      >
        {content}
      </div>
    </div>


      <div className="mt-4">
  <label htmlFor="slide-note" className="block text-sm font-medium text-gray-700 mb-1">
    📝 Your Notes for This Slide:
  </label>
  <textarea
    id="slide-note"
    value={notes[currentSlideIndex] || ''}
    onChange={(e) =>
      setNotes((prev) => ({ ...prev, [currentSlideIndex]: e.target.value }))
    }
    rows={3}
    className="w-full p-2 border border-gray-300 rounded-md"
    placeholder="Type your notes here..."
  />
</div>

      <div className="absolute top-4 right-4 z-50">
  <div className="relative">
    <button
      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      className="text-gray-700 hover:text-black focus:outline-none"
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>

    {isDropdownOpen && (
      <div
        className="absolute right-0 top-8 w-40 bg-white border rounded shadow-lg py-1 text-sm"
      >
        <button
          onClick={handleSave}
          className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
        >
          💾 Save
        </button>
        <button
          onClick={handleDownload}
          className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
        >
          📄 Download PDF
        </button>
        <button
          onClick={handleExit}
          className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
        >
          🚪 Exit
        </button>
      </div>
    )}
  </div>
</div>


      <div className="mt-auto flex justify-between pt-8">
  {/* ❓ Ask Button on the far left */}
  <button
    onClick={handleAskClick}
    className="bg-green-100 hover:bg-green-200 text-green-900 px-4 py-2 rounded-md shadow text-sm"
  >
    ❓ Ask a Question
  </button>

  {/* Navigation & action buttons on the far right */}
  <div className="flex gap-4">
    <button
      onClick={onPrevious}
      className="p-2 hover:opacity-80"
    >
      <img src="/Icons/next.png" alt="Previous" className="w-6 h-6 transform rotate-180" />

    </button>

    <button
      onClick={onNext}
      className="p-2 hover:opacity-80"
    >
      <img src="/Icons/next.png" alt="Next" className="w-6 h-6" />

    </button>

    <button
      onClick={handleSpeak}
      className="p-2 hover:opacity-80"
    >
      <img src="/Icons/speaker.png" alt="Speaker" className="w-6 h-6" />

    </button>

    <button onClick={stopNarration} className="p-2 hover:opacity-80">
      <img src="/Icons/stop.png" alt="Stop" className="w-6 h-6" />
    </button>

    <button
      onClick={handleFullscreen}
      className="p-2 hover:opacity-80"
    >
      <img src="/Icons/fullscreen.png" alt="Fullscreen" className="w-6 h-6" />

    </button>
  </div>
</div>


      {/* ✅ Modal goes here — paste below */}
      {isModalOpen && (
       <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
        <h3 className="text-xl font-semibold mb-4">
         {selectedLanguage === 'fr'
          ? "Posez une question sur cette diapositive"
          : "Ask a Question About This Slide"}
        </h3>

          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={4}
            className="w-full p-2 border border-gray-300 rounded mb-4"
            placeholder={
            selectedLanguage === 'fr'
             ? "Tapez votre question ici..."
             : "Type your question here..."
            }
          />
          <div className="flex justify-end space-x-2 mt-4">
           <button
            onClick={() => {
             setQuestion('');
             setAnswer('');
            }}
            className="px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-900 rounded"
           >
            🔄 Clear
           </button>

           <button
            onClick={() => setIsModalOpen(false)}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
           >
            Close
           </button>

           <button
             onClick={handleSubmitQuestion}
             className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
           >
            Ask
          </button>

          </div>

          {isLoading ? (
  <p className="text-sm text-gray-600 mt-4">Thinking... 🤖</p>
) : answer && (
  <div className="mt-4 flex flex-col gap-2">
    <button
      onClick={() => {
        if (!answer) return;
      
        const chunks = answer.match(/[^.!?]+[.!?]+/g) || [answer]; // Split into sentences
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice =
         voices.find((v) => v.name.includes("Microsoft") && v.name.toLowerCase().includes("female")) ||
         voices.find((v) => v.lang === "en-GB" && v.name.toLowerCase().includes("female")) ||
         voices.find((v) => v.name.toLowerCase().includes("zira")) ||
         voices.find((v) => v.name.toLowerCase().includes("jenny")) ||
         null;

                      
        chunks.forEach((sentence, index) => {
          const utter = new SpeechSynthesisUtterance(sentence.trim());
          utter.lang = 'en-US';
          utter.rate = 0.85;
          if (preferredVoice) utter.voice = preferredVoice;

      
          // Add delay between sentences
          setTimeout(() => {
            window.speechSynthesis.speak(utter);
          }, index * 1500); // adjust delay if needed
        });
      }}
      
      className="self-start p-1 hover:opacity-80"
      title="Play Answer"
    >
      <img
        src="/Icons/speaker.png"
        alt="Speaker"
        className="w-6 h-6 object-contain"
      />
    </button>
    
    <button
     onClick={handleStop}
     title="Stop Narration"
     className="self-start p-1 hover:opacity-80"
    >
     <img
      src="/Icons/stop.png"
      alt="Stop"
      className="w-6 h-6 object-contain"
     />
    </button>


    <p className="text-sm text-gray-800 whitespace-pre-line text-left">
    {answer}
    </p>
  </div>
)}


       </div>
      </div>
    )}
  </div>
 );  
}
