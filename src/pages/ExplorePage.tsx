import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import translations from '../i18n/translations';
import Lottie from "lottie-react";
import LumoAvatar from '../components/LumoAvatar';
import analyzingAnimation from '../lottie/analyzing.json';


const ExplorePage = () => {
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lumoCharacter, setLumoCharacter] = useState<any>(null);

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

  const [lessons, setLessons] = useState<{ grade: string; subject: string; unit: string; lessonTitle: string; uploadedAt: string }[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    const storedLessons = JSON.parse(localStorage.getItem('curriculumUploads') || '[]');
    setLessons(storedLessons);
  }, []);

  const uniqueGrades = Array.from(new Set(lessons.map(lesson => lesson.grade)));
  const uniqueSubjects = selectedGrade
    ? Array.from(new Set(lessons.filter(lesson => lesson.grade === selectedGrade).map(lesson => lesson.subject)))
    : [];

  const uniqueUnits = selectedSubject
    ? Array.from(new Set(lessons.filter(lesson => lesson.grade === selectedGrade && lesson.subject === selectedSubject).map(lesson => lesson.unit)))
    : [];

  const uniqueLessonTitles = selectedUnit
    ? Array.from(new Set(lessons.filter(lesson => lesson.grade === selectedGrade && lesson.subject === selectedSubject && lesson.unit === selectedUnit).map(lesson => lesson.lessonTitle)))
    : [];

  const [selectedLanguage] = useState(() => {
    return localStorage.getItem('selectedLanguage') || 'en';
  });

  const handleStartLearning = async () => {
    // If no lesson and no typed subject, show alert
    if (!selectedLesson && !selectedSubject) {
      alert('❗ Please select a lesson or type a subject.');
      return;
    }
  
    setIsAnalyzing(true);
  
    try {
      let endpoint = 'http://localhost:5007/api/analyze';
      let payload: any = {
        subject: selectedSubject,
        unit: selectedUnit,
        lessonTitle: selectedLesson,
        grade: selectedGrade,
        language: selectedLanguage,
      };
  
      // 🧠 Check if it's a free-typed subject (e.g., Mona Lisa)
      const isTypedSubjectOnly = selectedSubject && !selectedLesson && !selectedUnit;
  
      if (isTypedSubjectOnly) {
        endpoint = 'http://localhost:5007/api/subject';
        payload = {
          subject: selectedSubject,
          grade: selectedGrade,
          language: selectedLanguage,
        };
      }
  
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
  
      const data = await res.json();
  
      const slides = data.slides || data.summary || [];
  
      if (Array.isArray(slides) && slides.length > 0) {
        localStorage.setItem('exploreSlides', JSON.stringify(slides));
        navigate('/lesson');
      } else {
        alert('❌ No slides were returned. Please try a different topic.');
      }
  
    } catch (error) {
      alert('❌ Failed to generate lesson.');
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  return (
    <>
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
  
      {isAnalyzing && (
       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white px-8 py-6 rounded-lg shadow-md flex flex-col items-center">
         <div style={{ width: 120, height: 120 }}>
          <Lottie animationData={analyzingAnimation} loop={true} />
         </div>
         <p className="text-lg font-medium text-blue-900 mt-4">
           Analyzing in progress...
         </p>
        </div>
       </div>
      )}
  
      {/* Home Button */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10 }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '1rem',
            cursor: 'pointer',
            fontWeight: 400,
          }}
        >
          Home
        </button>
      </div>
  
      {/* Page Content */}
      <div
        style={{
          minHeight: '100vh',
          padding: '40px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'transparent',
        }}
      >
        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: 'normal',
            color: '#2a4d8f',
            marginBottom: '20px',
          }}
        >
          {translations.exploreTitle[selectedLanguage as 'en' | 'fr']}
        </h1>
  
        <div
          style={{
            width: '100%',
            maxWidth: '500px',
            marginTop: '30px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {/* Dropdowns */}
          <select value={selectedGrade} onChange={(e) => {
            setSelectedGrade(e.target.value);
            setSelectedSubject('');
            setSelectedUnit('');
            setSelectedLesson('');
          }} style={selectStyle}>
            <option value="">{translations.selectGrade[selectedLanguage as 'en' | 'fr']}</option>
            {uniqueGrades.map((grade) => (
              <option key={grade} value={grade}>{grade}</option>
            ))}
          </select>
  
          {selectedGrade && (
            <select value={selectedSubject} onChange={(e) => {
              setSelectedSubject(e.target.value);
              setSelectedUnit('');
              setSelectedLesson('');
            }} style={selectStyle}>
              <option value="">{translations.selectSubject[selectedLanguage as 'en' | 'fr']}</option>
              {uniqueSubjects.map((subject) => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          )}
  
          {selectedSubject && (
            <select value={selectedUnit} onChange={(e) => {
              setSelectedUnit(e.target.value);
              setSelectedLesson('');
            }} style={selectStyle}>
              <option value="">{translations.selectUnit[selectedLanguage as 'en' | 'fr']}</option>
              {uniqueUnits.map((unit) => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          )}
  
          {selectedUnit && (
            <select value={selectedLesson} onChange={(e) => setSelectedLesson(e.target.value)} style={selectStyle}>
              <option value="">{translations.selectLesson[selectedLanguage as 'en' | 'fr']}</option>
              {uniqueLessonTitles.map((lessonTitle) => (
                <option key={lessonTitle} value={lessonTitle}>{lessonTitle}</option>
              ))}
            </select>
          )}
  
          {/* Start Learning Button Centered */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <button
              onClick={handleStartLearning}
              className="custom-button"
              style={{ width: '700px', maxWidth: '100%' }}
            >
              {translations.startLearning[selectedLanguage as 'en' | 'fr']}
            </button>
          </div>
        </div>
  
        {/* Character Animation */}
        {lumoCharacter && (
          <div style={{ paddingTop: '60px' }}>
            <Lottie animationData={lumoCharacter} loop={true} style={{ width: 120, height: 120 }} />
          </div>
        )}
      </div>
  
      {/* Footer Logo */}
      <footer
        style={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <LumoAvatar />
          <img
            src={process.env.PUBLIC_URL + '/logo.png'}
            alt="Lumo Logo"
            style={{ height: '14px', opacity: 0.7, marginTop: '-10px' }}
          />
        </div>
      </footer>
    </>
  );  
};

const selectStyle = {
  width: '100%',
  padding: '10px',
  fontSize: '1rem',
  borderRadius: '8px',
  border: '1px solid #aaa',
};

export default ExplorePage;
