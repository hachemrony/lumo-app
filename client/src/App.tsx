import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, } from 'react-router-dom';
import AnalyzeAndExpandPage from './pages/AnalyzeAndExpandPage';
import LessonPage from './pages/LessonPage';
import Slide from './components/Slide';
import './App.css';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import RequireAuth from './components/RequireAuth';
import NotFoundPage from './pages/NotFoundPage'; // 🆕



function HomePage() {
  const [slides, setSlides] = useState<{ title: string; content: string }[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [text, setText] = useState('');
  const [typedSubject, setTypedSubject] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('middle');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const storedName = localStorage.getItem('userName');
  const welcomeText = storedName ? `welcome ${storedName.toLowerCase()}` : 'welcome';
  const navigate = useNavigate();
  const [showUploadSuccess, setShowUploadSuccess] = useState(false);
  const [selectedLanguage] = useState('en');
  const fileInputRef = React.useRef<HTMLInputElement>(null);



  React.useEffect(() => {
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
        console.error("❌ Failed to load draft:", err);
      }
    }
  }, []);
  

  const handleClearDraft = () => {
    localStorage.removeItem('draftSubject');
    setTypedSubject('');
  };


  const handleSummarize = async () => {
    console.log("🟢 handleSummarize triggered with text:", text);
    console.log("📄 Text from file:", text);

    const user = localStorage.getItem('userName');
    if (!user) {
     alert('❌ You must be logged in to generate a lesson.');
     return;
    }
    
    if (!text) return;
    setIsAnalyzing(true);

    try {
      const res = await fetch('http://localhost:5007/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, grade: selectedGrade, language: selectedLanguage }),

      });
      const data = await res.json();
      if (!data.summary || !Array.isArray(data.summary)) {
        throw new Error("Invalid summary data from server.");
      }      
      setSlides(data.summary);
      setCurrentSlideIndex(0);
    } catch (error) {
      alert('Failed to summarize text');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubjectSubmit = async () => {
    console.log("🟡 handleSubjectSubmit triggered with subject:", typedSubject);

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
      if (!data.summary || !Array.isArray(data.summary)) {
        throw new Error("Invalid summary data from server.");
      }      
      setSlides(data.summary);
      setCurrentSlideIndex(0);
    } catch (error) {
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
      setText(data.text || '');
      setShowUploadSuccess(true);
      setTimeout(() => setShowUploadSuccess(false), 3000); // 👈 3 sec timeout
          } catch (error) {
      alert('File upload failed');
    }
  };

  const handleOpenSavedFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.warn("🟡 No file selected.");
      return;
    }
  
    const reader = new FileReader();
  
    reader.onload = (e) => {
      try {
        const content = JSON.parse(e.target?.result as string);
        if (content.slides && Array.isArray(content.slides)) {
          setSlides(content.slides);
          setCurrentSlideIndex(content.currentSlideIndex || 0);
          setSelectedGrade(content.selectedGrade || "middle");
  
          // ✅ Prevent auto-loading again on refresh
          localStorage.setItem('loadDraftOnStart', 'false');
  
          alert("✅ Lesson loaded successfully!");
        } else {
          alert("❌ Invalid file format. Please select a valid lesson file.");
        }
      } catch (err) {
        console.error("❌ JSON parsing failed:", err);
        alert("❌ Failed to read file. Make sure it’s a valid lesson file.");
      }
    };
  
    reader.onerror = (err) => {
      console.error("❌ FileReader error:", err);
      alert("❌ Error reading the file.");
    };
  
    reader.readAsText(file);
  };
  
  
  
  // Auto-save data to localStorage when any relevant state changes
  React.useEffect(() => {
   const draft = {
    slides,
    text,
    typedSubject,
    selectedGrade,
    currentSlideIndex,
   };
   localStorage.setItem('lessonDraft', JSON.stringify(draft));
  }, [slides, text, typedSubject, selectedGrade, currentSlideIndex]);

  useEffect(() => {
    const draft = {
      slides,
      text,
      typedSubject,
      selectedGrade,
    };
    localStorage.setItem('lessonDraft', JSON.stringify(draft));
  }, [slides, text, typedSubject, selectedGrade]);


  return (
    <>
      {/* ☰ Menu button and dropdown */}
      {!Array.isArray(slides) || slides.length === 0 ? (
        <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}>
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            style={{
              background: '#fff',
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
              width: '160px'
            }}>
              <button
               style={{
                display: 'block',
                width: '100%',
                padding: '10px 16px',
                textAlign: 'left',
                borderBottom: '1px solid #eee',
                background: 'none',
                cursor: 'pointer',
                fontWeight: 200,
               }}
               onClick={() => navigate('/signup')}
              >
               Sign Up
              </button>

            <button
             style={{
              display: 'block',
              width: '100%',
              padding: '10px 16px',
              textAlign: 'left',
              borderBottom: '1px solid #eee',
              background: 'none',
              cursor: 'pointer',
              fontWeight: 200,
             }}
  
             onClick={() => navigate('/login')}
            >
             Log In
            </button>

            <button
             onClick={() => {
               localStorage.removeItem('userName');
               localStorage.removeItem('userPassword');
               localStorage.removeItem('userEmail');
               // ✅ Keep registered accounts like 'allUsers' untouched
               window.location.reload();
             }}
             style={{
               display: 'block',
               width: '100%',
               padding: '10px 16px',
               textAlign: 'left',
               borderBottom: '1px solid #eee',
               background: 'none',
               cursor: 'pointer',
               fontWeight: 200,
             }}
            >
              Sign Out
            </button>

            <button
             onClick={() => fileInputRef.current?.click()}
             style={{
              display: 'block',
              width: '100%',
              padding: '10px 16px',
              textAlign: 'left',
              borderBottom: '1px solid #eee',
              background: 'none',
              cursor: 'pointer',
              fontWeight: 200,
             }}
            >
              Open Saved File
            </button>

              <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleOpenSavedFile}
              />
            </div>
          )}
        </div>
      ) : null}
  
      {/* Background */}
      <div className="animated-bg"></div>
  
      <div className="App" style={{ padding: '20px', position: 'relative', zIndex: 1 }}>
        {Array.isArray(slides) && slides.length > 0 && slides[currentSlideIndex] ? (
          <>
        
          {/* Slide View */}
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
        </>
        
        ) : (
          <>
            {/* Welcome Header */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h1 style={{
                fontSize: '4rem',
                fontWeight: 'bold',
                fontStyle: 'italic',
                color: '#2a4d8f',
                letterSpacing: '2px',
                whiteSpace: 'pre',
              }}>
                {welcomeText.split('').map((char, i) => (
                  <span key={i} style={{
                    opacity: 0,
                    animation: `fadeIn 0.5s ease forwards`,
                    animationDelay: `${i * 0.2}s`,
                    display: 'inline-block',
                  }}>{char}</span>
                ))}
              </h1>
              <p style={{ fontSize: '1.1rem', color: '#333' }}>
                Please upload a document or type a subject before clicking Generate.
              </p>
            </div>
  
            {/* Controls */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '34px',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '30px'
            }}>
              <label className="custom-button" style={{ cursor: 'pointer' }}>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                📤 Upload Document
              </label>
  
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="type a subject"
                  value={typedSubject}
                  onChange={(e) => setTypedSubject(e.target.value)}
                  className="subject-input"
                  style={{ marginBottom: '4px' }}
                />
                {typedSubject && (
                  <span
                    onClick={handleClearDraft}
                    style={{
                      fontSize: '0.75rem',
                      color: '#555',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    🗑️ Clear Draft
                  </span>
                )}
              </div>
  
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="custom-button"
              >
                <option value="elementary">🎓 Elementary</option>
                <option value="middle">🎓 Middle</option>
                <option value="high">🎓 High</option>
              </select>
            </div>
  
            {showUploadSuccess && (
              <p style={{ textAlign: 'center', color: 'green', fontWeight: 300 }}>
                ✅ Document uploaded successfully!
              </p>
            )}
  
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
              <button
                onClick={typedSubject ? handleSubjectSubmit : handleSummarize}
                className="custom-button"
                style={{
                  backgroundColor: '#eee',
                  minWidth: '200px',
                  height: '36px',
                  padding: '8px 24px',
                  border: '1px solid #555'
                }}
              >
                ✨ Generate
              </button>
            </div>
          </>
        )}
  
        {/* Spinner */}
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
                <div className="global-spinner" />
                <p style={{
                  fontSize: '1rem',
                  color: '#2a4d8f',
                  marginTop: '16px',
                  fontWeight: 500
                }}>
                  ⏳ {selectedLanguage === 'fr' ? "Analyse en cours..." : "Analyzing in progress..."}
                </p>
              </div>
            </div>
          </div>
        )}
  
        {/* Tagline */}
        <div className="tagline-wrapper">
          <div className="tagline-track">
            <span className="tagline-text">
              empowering education with ai · instantly summarized · visual learning made easy · 
            </span>
            <span className="tagline-text">
              empowering education with ai · instantly summarized · visual learning made easy · 
            </span>
          </div>
        </div>
  
        {/* Footer */}
        <footer style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2,
        }}>
          <img
            src="/icons/logo.png"
            alt="Your Brand Logo"
            style={{
              height: '70px',
              opacity: 0.6,
            }}
          />
        </footer>
      </div>
    </>
  );
  
} 
  
function App() {
  return (
    <Router>
      <Routes>
       <Route path="/" element={<HomePage />} />
       <Route path="/signup" element={<SignUpPage />} />
       <Route path="/login" element={<LoginPage />} />

       {/* ✅ Protected Routes */}
       <Route path="/analyze" element={
        <RequireAuth>
         <AnalyzeAndExpandPage />
        </RequireAuth>
       } />

       <Route path="/lesson" element={
        <RequireAuth>
         <LessonPage />
        </RequireAuth>
       } />

       {/* 🛑 Catch-all 404 route */}
       <Route path="*" element={<NotFoundPage />} />
      </Routes>

    </Router>
  );
}

export default App;
