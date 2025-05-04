import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Slide from '../components/Slide';
import translations from '../i18n/translations';
import Lottie from "lottie-react";
import LumoAvatar from '../components/LumoAvatar';
import analyzingAnimation from '../lottie/analyzing.json';

export default function HomePage() {
  const [lumoCharacter, setLumoCharacter] = useState<any>(null); // ✅ INSIDE here

  useEffect(() => {
    fetch('/lottie/lumo-character.json')
      .then((res) => res.json())
      .then((data) => setLumoCharacter(data));
  }, []);

  const [dotsBackground, setDotsBackground] = useState<any>(null);

  useEffect(() => {
   fetch('/lottie/dots-background.json')
    .then((res) => res.json())
    .then((data) => setDotsBackground(data));
  }, []);
  
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  

  const [slides, setSlides] = useState<{ title: string; content: string }[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [text, setText] = useState('');
  const [typedSubject, setTypedSubject] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('middle');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUploadSuccess, setShowUploadSuccess] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem('selectedLanguage') || 'en';
  });
  const [isQuickHelpOpen, setIsQuickHelpOpen] = useState(false);
  const [quickHelpQuestion, setQuickHelpQuestion] = useState('');
  const [quickHelpAnswer, setQuickHelpAnswer] = useState('');
  const [isQuickHelpLoading, setIsQuickHelpLoading] = useState(false);


  const storedName = localStorage.getItem('userName');
  const welcomeText = storedName
    ? `${translations.welcomeText[selectedLanguage as 'en' | 'fr']} ${storedName.toLowerCase()}`
    : translations.welcomeText[selectedLanguage as 'en' | 'fr'];

  useEffect(() => {
    const shouldLoad = localStorage.getItem('loadDraftOnStart');
    const saved = localStorage.getItem('lessonDraft');
    if (shouldLoad === 'true' && saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.slides) setSlides(parsed.slides);
        if (parsed.text) setText(parsed.text);
        if (parsed.typedSubject) setTypedSubject(parsed.typedSubject);
        if (parsed.selectedGrade) setSelectedGrade(parsed.selectedGrade);
        if (parsed.currentSlideIndex !== undefined) setCurrentSlideIndex(parsed.currentSlideIndex);
      } catch (err) {
        console.error('❌ Failed to load draft:', err);
      }
    }
  }, []);

  useEffect(() => {
    const draft = { slides, text, typedSubject, selectedGrade, currentSlideIndex };
    localStorage.setItem('lessonDraft', JSON.stringify(draft));
  }, [slides, text, typedSubject, selectedGrade, currentSlideIndex]);

  const handleSummarize = async () => {
    const user = localStorage.getItem('userName');
    if (!user) {
      alert('❌ You must be logged in to generate a lesson.');
      return;
    }
    if (!text.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch('http://localhost:5007/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, grade: selectedGrade, language: selectedLanguage }),
      });
      const data = await res.json();
      setSlides(data.slides || []);
      setCurrentSlideIndex(0);
  
      // ✅ This is the missing part
      navigate('/lesson', {
        state: { slides: data.slides || [] },
      });
  
    } catch {
      alert('Failed to summarize text');
    } finally {
      setIsAnalyzing(false);
    }
  };
  

  const handleSubjectSubmit = async () => {
    const user = localStorage.getItem('userName');
    if (!user) {
      alert('❌ You must be logged in to generate a lesson.');
      return;
    }
    if (!typedSubject.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch('http://localhost:5007/api/subject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: typedSubject, grade: selectedGrade, language: selectedLanguage }),
      });
      const data = await res.json();
      setSlides(data.slides || []);
      setCurrentSlideIndex(0);
      // ✅ Navigate to lesson page with slides
      navigate('/lesson', {
       state: { slides: data.slides || [] },
      });
    } catch {
      alert('Failed to generate slides');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('http://127.0.0.1:5007/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      console.log("📄 Uploaded text content:", data.text);
      setText(data.text || '');
      setShowUploadSuccess(true);
      setTimeout(() => setShowUploadSuccess(false), 3000);
    } catch {
      alert('File upload failed');
    }
  };

  const handleQuickHelpSubmit = async () => {
    if (!quickHelpQuestion.trim()) return;
  
    setIsQuickHelpLoading(true);
    setQuickHelpAnswer('');
    
    try {
      const res = await fetch('http://localhost:5007/api/quick-help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: quickHelpQuestion }),
      });
  
      const data = await res.json();
      setQuickHelpAnswer(data.answer);
    } catch (err) {
      setQuickHelpAnswer('❌ Failed to get an answer. Try again later.');
      console.error(err);
    } finally {
      setIsQuickHelpLoading(false);
    }
  };
  

  const handleOpenSavedFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = JSON.parse(e.target?.result as string);
        if (content.slides && Array.isArray(content.slides)) {
          setSlides(content.slides);
          setCurrentSlideIndex(content.currentSlideIndex || 0);
          setSelectedGrade(content.selectedGrade || 'middle');
          localStorage.setItem('loadDraftOnStart', 'false');
          alert('✅ Lesson loaded successfully!');
        } else {
          alert('❌ Invalid file format.');
        }
      } catch (err) {
        console.error('❌ JSON parsing failed:', err);
        alert('❌ Failed to read file.');
      }
    };
    reader.readAsText(file);
  };

  if (slides.length > 0 && slides[currentSlideIndex]) {
    return (
      <Slide
        title={slides[currentSlideIndex].title}
        content={slides[currentSlideIndex].content}
        slides={slides}
        onPrevious={() => setCurrentSlideIndex((i) => Math.max(i - 1, 0))}
        onNext={() => setCurrentSlideIndex((i) => Math.min(i + 1, slides.length - 1))}
        isFirst={currentSlideIndex === 0}
        isLast={currentSlideIndex === slides.length - 1}
        currentSlideIndex={currentSlideIndex}
        selectedLanguage={selectedLanguage}
      />
    );
  }

  return (
   
    <>
    {lumoCharacter && (
     <div style={{ paddingTop: '60px' }}>
       <Lottie animationData={lumoCharacter} loop={true} style={{ width: 120, height: 120 }} />
     </div>
    )}

    {dotsBackground && (
     <Lottie
      animationData={dotsBackground}
      loop
      style={{
       position: 'fixed',
       top: 0,
       left: 0,
       width: '100%',
       height: '100%',
       zIndex: -1,
       pointerEvents: 'none',
       opacity: 0.2,
      }}
     />
    )}

      {showUploadSuccess && (
      <div style={{ 
        marginTop: '20px', 
        textAlign: 'center', 
        color: 'green', 
        fontWeight: 'bold', 
        fontSize: '1rem',
        backgroundColor: '#e6ffe6',
        border: '1px solid #8bc34a',
        borderRadius: '8px',
        padding: '10px',
        maxWidth: '400px',
        marginLeft: 'auto',
        marginRight: 'auto'
      }}>
        ✅ Document uploaded successfully!
      </div>
    )}
      {/* Language Switch */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 20 }}>
        <button
          onClick={() => {
            const newLang = selectedLanguage === 'en' ? 'fr' : 'en';
            setSelectedLanguage(newLang);
            localStorage.setItem('selectedLanguage', newLang);
          }}
          style={{
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: '6px',
            padding: '5px 10px',
            cursor: 'pointer',
            fontWeight: '400',
            fontSize: '0.9rem',
          }}
        >
          {selectedLanguage === 'en' ? 'FR' : 'EN'}
        </button>
      </div>

      {/* Menu */}
      <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 20 }}>
        <button
          onClick={() => setIsMenuOpen((prev) => !prev)}
          style={{
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: '6px',
            padding: '8px 12px',
            cursor: 'pointer',
            fontWeight: 400,
          }}
        >
          ☰
        </button>
        {isMenuOpen && (
          <div style={{
           position: 'absolute',
           right: 0,
           marginTop: '8px',
           background: '#fff',
           border: '1px solid #ccc',
           borderRadius: '6px',
           boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
           width: '180px',
          }}>
           <button style={menuButtonStyle} onClick={() => navigate('/signup')}>Sign Up</button>
           <button style={menuButtonStyle} onClick={() => navigate('/login')}>Log In</button>
           <button style={menuButtonStyle} onClick={() => {
            localStorage.removeItem('userName');
            localStorage.removeItem('userPassword');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userRole'); {/* 🛡️ Fix: clear role */}
            window.location.reload();
           }}>Sign Out</button>
           <button style={menuButtonStyle} onClick={() => fileInputRef.current?.click()}>Open Saved File</button>
           <input type="file" accept=".json" ref={fileInputRef} style={{ display: 'none' }} onChange={handleOpenSavedFile} />

           {/* 🛡️ Upload Curriculum: visible for ALL (but check on click) */}
           <button
            style={menuButtonStyle}
            onClick={() => {
             const role = localStorage.getItem('userRole');
             if (role === 'admin') {
              navigate('/upload');
             } else {
              navigate('/adminsignup');
             }
            }}
           >
            Upload Curriculum
           </button>

           {/* 🛡️ Manage Lessons: ONLY show if Admin */}
           {localStorage.getItem('userRole') === 'admin' && (
            <button
             style={menuButtonStyle}
             onClick={() => navigate('/manage')}
            >
             Manage Lessons
            </button>
           )}
         </div>
        )}
      </div>

      {/* Main Content */}
      <div className="animated-bg"></div>
      <div className="App" style={{ padding: 20, position: 'relative', zIndex: 1 }}>
        {/* Welcome Title */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: 'bold',
            fontStyle: 'italic',
            color: '#2a4d8f',
            letterSpacing: '2px',
          }}>
            {welcomeText.split('').map((char, i) => (
              <span 
               key={i} 
               style={{
                opacity: 0,
                animation: 'fadeIn 0.5s ease forwards',
                animationDelay: `${i * 0.2}s`,
                display: 'inline-block',
                whiteSpace: 'pre',
               }}
              >
                {char}
              </span>
            ))}
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#333' }}>
            {translations.welcomeSubtitle[selectedLanguage as 'en' | 'fr']}
          </p>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: 30 }}>
          <label className="custom-button">
            <input type="file" accept=".pdf,.docx,.txt" onChange={handleFileUpload} style={{ display: 'none' }} />
            {translations.uploadDocument[selectedLanguage as 'en' | 'fr']}
          </label>
          <input
            type="text"
            placeholder={translations.typeSubject[selectedLanguage as 'en' | 'fr']}
            value={typedSubject}
            onChange={(e) => setTypedSubject(e.target.value)}
            className="subject-input"
          />
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="custom-button"
          >
            <option value="elementary">{translations.elementary[selectedLanguage as 'en' | 'fr']}</option>
            <option value="middle">{translations.middle[selectedLanguage as 'en' | 'fr']}</option>
            <option value="high">{translations.high[selectedLanguage as 'en' | 'fr']}</option>
          </select>
        </div>

        {/* Generate Button */}
        <div style={{ textAlign: 'center' }}>
         <button
          onClick={typedSubject ? handleSubjectSubmit : handleSummarize}
          className="custom-button"
         >
            {translations.generate[selectedLanguage as 'en' | 'fr']}
          </button>
        </div>

        {/* Divider Line */}
        <hr style={{ margin: '40px auto 30px auto', width: '100%', maxWidth: '820px', borderTop: '1px solid #ccc' }} />

        {/* Explore Curriculum Button */}
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
         <button
          onClick={() => navigate('/explore')}
          className="custom-button"
         >
          {translations.exploreCurriculum[selectedLanguage as 'en' | 'fr']}
         </button>

        </div>
          {/* Divider Line */}
          <hr style={{ margin: '35px auto 35px auto', width: '100%', maxWidth: '820px', borderTop: '1px solid #bbb' }} />

          {/* Quick Help Button */}
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
           <button
            onClick={() => setIsQuickHelpOpen(true)}
            className="custom-button"
           >
            {translations.quickHelp[selectedLanguage as 'en' | 'fr']}
           </button>
          </div>


        {/* Tagline Animation */}
        <div className="tagline-wrapper">
          <div className="tagline-track">
            <span className="tagline-text">{translations.tagline[selectedLanguage as 'en' | 'fr']}</span>
            <span className="tagline-text">{translations.tagline[selectedLanguage as 'en' | 'fr']}</span>
          </div>
        </div>

        {/* Footer Logo */}
        <footer style={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2
        }}>

   <div style={{ textAlign: 'center', marginBottom: '10px' }}>
     <LumoAvatar />
     <img
      src={process.env.PUBLIC_URL + "/logo.png"}
      alt="Lumo Logo"
      style={{ height: '14px', opacity: 0.7, marginTop: '-10px' }}
     />
   </div>
        </footer>
      </div>
      {isAnalyzing && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999
  }}>
    <div style={{
      background: 'white',
      padding: '24px 36px',
      borderRadius: '12px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      textAlign: 'center',
      animation: 'fadeInPopup 0.3s ease-in-out'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
       <div style={{ width: 120, height: 120 }}>
        <Lottie animationData={analyzingAnimation} loop={true} />
       </div>
       <p
        style={{
         fontSize: '1rem',
         color: '#2a4d8f',
         marginTop: '16px',
         fontWeight: 500,
        }}
       >
        {translations.analyzing[selectedLanguage as 'en' | 'fr']}
       </p>
      </div>

    </div>
  </div>
)}

{isQuickHelpOpen && (
  <div
    style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}
  >
    <div
      style={{
        background: 'white',
        padding: '24px',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '540px',
        maxHeight: '80vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      }}
    >
      <h2 style={{ marginBottom: '12px', textAlign: 'center' }}>🧠 Ask Anything</h2>

      <textarea
        rows={4}
        value={quickHelpQuestion}
        onChange={(e) => setQuickHelpQuestion(e.target.value)}
        placeholder="Paste your quiz question or anything..."
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid #ccc',
          marginBottom: '16px',
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '12px' }}>
        <button
          onClick={() => {
            setIsQuickHelpOpen(false);
            setQuickHelpQuestion('');
            setQuickHelpAnswer('');
          }}
          style={{
            padding: '6px 12px',
            background: '#ddd',
            border: 'none',
            borderRadius: '6px',
          }}
        >
          Close
        </button>
        <button
          onClick={handleQuickHelpSubmit}
          style={{
            padding: '6px 12px',
            background: '#2a4d8f',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
          }}
        >
          Ask
        </button>
      </div>

      <div
        style={{
          flexGrow: 1,
          overflowY: 'auto',
          paddingRight: '6px',
          borderTop: '1px solid #eee',
        }}
      >
        {isQuickHelpLoading && <p style={{ marginTop: '16px' }}>⏳ Thinking...</p>}
        {quickHelpAnswer && (
          <p
            style={{
              marginTop: '16px',
              textAlign: 'left',
              whiteSpace: 'pre-line',
              backgroundColor: '#f4f4f4',
              padding: '12px',
              borderRadius: '6px',
            }}
          >
            {quickHelpAnswer}
          </p>
        )}
      </div>
    </div>
  </div>
)}



    </>
  );
}

// Menu Button Styles
const menuButtonStyle = {
  display: 'block',
  width: '100%',
  padding: '12px 20px',
  textAlign: 'left' as const,
  borderBottom: '1px solid #eee',
  background: 'none',
  cursor: 'pointer',
  fontWeight: 400,
};
