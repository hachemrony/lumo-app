import React, { useRef, useState } from 'react';
import { useEffect } from 'react';
import jsPDF from 'jspdf';
import translations from '../i18n/translations';


type SlideProps = {
    title: string;
    content: string;
    slides: {
      title: string;
      content?: string;
      text?: string;
      imageUrl?: string;
    }[];
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
     
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isVisualModalOpen, setIsVisualModalOpen] = useState(false);
    const [visualPrompt, setVisualPrompt] = useState('');
    const [visualImage, setVisualImage] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isExitModalOpen, setIsExitModalOpen] = useState(false);



    const cleanText = (raw: string): string => {
        if (!raw) return ''; // ✅ Failsafe: prevent .replace on undefined/null

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
        narrationCancelledRef.current = false;
        setIsSpeaking(true);
      
        const titleClean = cleanText(title);
        const currentSlide = slides[currentSlideIndex];
        const contentClean = cleanText(currentSlide?.text || currentSlide?.content || '');

      
        const fullText = `${titleClean}. ${contentClean}`;
      
        const speakNow = () => {
          const voices = window.speechSynthesis.getVoices();
      
          let preferredVoice: SpeechSynthesisVoice | null = null;
      
          if (selectedLanguage === 'fr') {
            preferredVoice =
              voices.find((v) => v.name.includes('Amelie')) ||
              voices.find((v) => v.name.includes('Thomas')) ||
              voices.find((v) => v.lang === 'fr-FR' || v.lang === 'fr-CA') ||
              null;
          } else {
            preferredVoice =
              voices.find((v) => v.name.includes('Microsoft') && v.name.toLowerCase().includes('female')) ||
              voices.find((v) => v.lang === 'en-GB' && v.name.toLowerCase().includes('female')) ||
              voices.find((v) => v.name.toLowerCase().includes('zira')) ||
              voices.find((v) => v.name.toLowerCase().includes('jenny')) ||
              null;
          }

          narrationCancelledRef.current = false;
      
          const chunks = fullText.match(/[^.!?]+[.!?]+(\s|$)/g) || [fullText]; // Split by sentences
          const pauseBetweenSentences = selectedLanguage === 'fr' ? 3000 : 2000;

      
          chunks.forEach((sentence, index) => {
            const utter = new SpeechSynthesisUtterance(sentence.trim());
            utter.voice = preferredVoice;
            utter.lang = preferredVoice?.lang || (selectedLanguage === 'fr' ? 'fr-FR' : 'en-US');
            utter.rate = 0.75;
          
            setTimeout(() => {
              if (!narrationCancelledRef.current) {
                window.speechSynthesis.speak(utter);
              }
            }, index * pauseBetweenSentences);
          });
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
      
      const narrationCancelledRef = useRef(false);
      
      const stopNarration = () => {
        narrationCancelledRef.current = true;
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      };
          
    const handleDownload = () => {
      const doc = new jsPDF();
      slides.forEach((slide, index) => {
        if (index !== 0) doc.addPage();
        doc.setFontSize(16);
        doc.text(slide.title, 10, 20);
    
        const slideText = slide.text || slide.content || '';
        doc.setFontSize(12);
        doc.text(doc.splitTextToSize(slideText, 180), 10, 30);
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
    const [practiceQuestion, setPracticeQuestion] = useState<null | {
      question: string;
      choices: string[];
      answer: string;
    }> (null);
    
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    
    const handleMorePractice = async () => {
      try {
        const res = await fetch('http://localhost:5007/api/more-practice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: slides[0]?.title || 'General Topic',
            grade: 'Grade 6', // Replace later with actual selectedGrade
            language: selectedLanguage,
          }),
        });
    
        const data = await res.json();
    
        // If backend is returning JSON as a string, parse it
        const parsed =
          typeof data.prompt === 'string' ? JSON.parse(data.prompt) : data.prompt;
    
        setPracticeQuestion(parsed);
        setSelectedAnswer(null); // reset selection each time
      } catch (err) {
        console.error('❌ Could not load practice question:', err);
        alert('❌ Practice unavailable right now.');
      }
    };
    
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


          utter.rate = 0.75;


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
        setIsExitModalOpen(true);
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

      <h2 className="text-2xl font-medium text-left flex-shrink-0">{title}</h2>
      <div
       className="flex-1 overflow-y-auto pr-2 text-lg whitespace-pre-line"
       style={{
        textAlign: 'left',
        lineHeight: '1.6',
       }}
      >
         {slides[currentSlideIndex]?.text || content}
      </div>

    </div>

      <div className="mt-4">
  <label htmlFor="slide-note" className="block text-sm font-medium text-gray-700 mb-1">
     {translations.yourNotesLabel[selectedLanguage as 'en' | 'fr']}
  </label>
  <textarea
    id="slide-note"
    value={notes[currentSlideIndex] || ''}
    onChange={(e) =>
      setNotes((prev) => ({ ...prev, [currentSlideIndex]: e.target.value }))
    }
    rows={3}
    className="w-full p-2 border border-gray-300 rounded-md"
    placeholder={translations.typeNotesPlaceholder[selectedLanguage as 'en' | 'fr']}
  />
</div>
{practiceQuestion && (
  <div className="mt-6 p-4 border rounded-md bg-gray-50 shadow">
    <h3 className="text-lg font-semibold mb-2 text-blue-900">🧠 Practice Question</h3>
    <p className="mb-4 text-gray-800">{practiceQuestion.question}</p>

    <div className="grid gap-3">
      {practiceQuestion.choices.map((choice, index) => {
        const isCorrect = selectedAnswer === practiceQuestion.answer;
        const isSelected = selectedAnswer === choice;

        const buttonStyle = isSelected
          ? isCorrect
            ? 'bg-green-100 text-green-900 border-green-400'
            : 'bg-red-100 text-red-900 border-red-400'
          : 'bg-white text-gray-800 hover:bg-blue-50';

        return (
          <button
            key={index}
            onClick={() => setSelectedAnswer(choice)}
            className={`w-full text-left px-4 py-2 rounded border ${buttonStyle} transition duration-150`}
            disabled={!!selectedAnswer}
          >
            {choice}
          </button>
        );
      })}
    </div>

    {selectedAnswer && (
      <p className="mt-4 text-sm text-gray-600">
        {selectedAnswer === practiceQuestion.answer
          ? '✅ Correct!'
          : `❌ Incorrect. Correct answer: ${practiceQuestion.answer}`}
      </p>
    )}
  </div>
)}


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
          Save
        </button>
        <button
          onClick={handleDownload}
          className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
        >
          Download PDF
        </button>
        <button
          onClick={handleExit}
          className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
        >
          Exit
        </button>
      </div>
    )}
  </div>
</div>


      <div className="mt-auto flex justify-between pt-8">
  {/* ❓ Ask Button on the far left */}
  <button
    onClick={handleAskClick}
    className="w-80 border border-blue-600 text-blue-600 bg-transparent hover:bg-blue-600 hover:text-white px-4 py-2 rounded-md transition-colors duration-200"
  >
    {translations.askQuestionButton[selectedLanguage as 'en' | 'fr']}
  </button>
  
  <button
    onClick={() => {
      setIsVisualModalOpen(true);
      setVisualPrompt('');
      setVisualImage(null);
    }}
    className="w-80 border border-blue-600 text-blue-600 bg-transparent hover:bg-blue-600 hover:text-white px-4 py-2 rounded-md transition-colors duration-200"
  >
    Generate Visual
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
      <img 
        src="/Icons/speaker.png" 
        alt="Speaker" 
        className={`w-6 h-6 transition-transform duration-500 ${isSpeaking ? "scale-125 animate-pulse" : ""}`}  
      />


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
{isLast && (
 <div className="mt-6 w-full">
  <button
    onClick={handleMorePractice}
    className="w-full border border-purple-700 text-purple-700 bg-transparent hover:bg-purple-700 hover:text-white px-4 py-2 rounded-md transition-colors duration-200"

  >
    🔁 Practice
  </button>
</div>

)}


<>
  {isModalOpen && !isVisualModalOpen && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
        <h3 className="text-xl font-normal mb-4">
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
            className="px-10 py-2 bg-tranparent hover:bg-yellow-100 text-blue-600 border border-blue-600 rounded"

          >
            {translations.clearButton[selectedLanguage as 'en' | 'fr']}
          </button>

          <button
            onClick={() => setIsModalOpen(false)}
            className="px-14 py-2 bg-tranparent hover:bg-gray-100 text-blue-600 border border-blue-600 rounded"

          >
            {translations.closeButton[selectedLanguage as 'en' | 'fr']}
          </button>

          <button
            onClick={handleSubmitQuestion}
            className="px-14 py-2 bg-tranparent hover:bg-green-100 text-blue-600 border border-blue-600 rounded"

          >
            {translations.askButton[selectedLanguage as 'en' | 'fr']}
          </button>
        </div>

        {isLoading ? (
          <p className="text-sm text-gray-600 mt-4">
            {translations.thinkingText[selectedLanguage as 'en' | 'fr']}
          </p>
        ) : answer && (
          <div className="mt-4 text-sm text-gray-800 whitespace-pre-line text-left">
            {answer}
          </div>
        )}
      </div>
    </div>
  )}

  {isVisualModalOpen && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
        <h3 className="text-xl font-normal mb-4">Generate a Visual</h3>
        <textarea
          value={visualPrompt}
          onChange={(e) => setVisualPrompt(e.target.value)}
          rows={3}
          className="w-full p-2 border border-gray-300 rounded mb-4"
          placeholder="Describe the image you want based on this lesson..."
        />
        <p className="text-sm text-gray-500 mt-1">
          💡 Try describing the image clearly (e.g., “a girl coding on a laptop in a classroom”) instead of using brand names or famous artworks.
        </p>


        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={() => {
              setIsVisualModalOpen(false);
              setVisualPrompt('');
              setVisualImage(null);
            }}
            className="w-full py-2 bg-tranparent hover:bg-gray-100 text-blue-600 border border-blue-600 rounded"

          >
            Close
          </button>
          <button
            onClick={async () => {
              if (!visualPrompt.trim()) return;
              setIsGenerating(true);
              try {
                const res = await fetch("http://localhost:5007/api/custom-visual", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    prompt: `${visualPrompt}. Create a high-quality, realistic, classroom-appropriate image. Avoid distortions.`,
                  }),
                  
                });
                const data = await res.json();
                if (data.imageUrl) {
                  setVisualImage(data.imageUrl);
                } else {
                  alert("❌ No image returned. Try a different description.");
                }
                
              } catch (err) {
                alert('❌ Failed to generate image');
                console.error(err);
              } finally {
                setIsGenerating(false);
              }
            }}
            className="w-full py-2 bg-tranparent hover:bg-green-100 text-blue-600 border border-blue-600 rounded"
            
          >
            Generate
          </button>
        </div>

        {isGenerating && (
          <p className="mt-4 text-sm text-gray-600">🎨 Generating image...</p>
        )}
        {visualImage && !isGenerating && (
         <div className="mt-4 text-center">
          <a href={visualImage} target="_blank" rel="noopener noreferrer">
           <img
            src={visualImage}
            alt="Generated Visual"
            className="mx-auto max-w-full max-h-64 rounded-lg shadow cursor-pointer"
           />
          </a>
         </div>
        )}
      </div>
    </div>
  )}
  {isExitModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-center">
      <h3 className="text-xl font-normal mb-4">
        {selectedLanguage === 'fr'
          ? 'Voulez-vous enregistrer votre travail avant de quitter ?'
          : 'Do you want to save your work before exiting?'}
      </h3>
      <div className="flex justify-center gap-3 mt-6">
        <button
          onClick={async () => {
            await handleSave();
            window.location.href = '/';
          }}
          className="px-2 py-2 border border-green-600 text-green-600 rounded hover:bg-green-100"
        >
          {selectedLanguage === 'fr' ? 'Enregistrer et quitter' : 'Save & Exit'}
        </button>
        <button
          onClick={() => (window.location.href = '/')}
          className="px-2 py-2 border border-red-600 text-red-600 rounded hover:bg-red-100"
        >
          {selectedLanguage === 'fr' ? 'Quitter sans enregistrer' : 'Exit Without Saving'}
        </button>
        <button
          onClick={() => setIsExitModalOpen(false)}
          className="px-6 py-2 border border-gray-500 text-gray-700 rounded hover:bg-gray-100"
        >
          {selectedLanguage === 'fr' ? 'Retour' : 'Back'}
        </button>
      </div>
    </div>
  </div>
)}

</>

  </div>
 );  
}
