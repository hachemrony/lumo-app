import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LumoAvatar from '../components/LumoAvatar';
import translations from '../i18n/translations';


export default function UploadPage() {
  const navigate = useNavigate();
  const [selectedLanguage] = useState<'en' | 'fr'>(
    (localStorage.getItem('selectedLanguage') as 'en' | 'fr') || 'en'
  );
  
  const [grade, setGrade] = useState('Grade 6');
  const [subject, setSubject] = useState('Artificial Intelligence');
  const [unit, setUnit] = useState('Unit 1: Basics');
  const [lessonTitle, setLessonTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role !== 'admin') {
      alert('Access denied. Admins only.');
      navigate('/');
    }
  }, [navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file || !lessonTitle.trim()) {
      alert('❌ Please fill all fields and select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5007/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Upload success:', data);
        const newLesson = {
          grade,
          subject,
          unit,
          lessonTitle,
          uploadedAt: new Date().toISOString(),
        };

        const existingLessons = JSON.parse(localStorage.getItem('curriculumUploads') || '[]');
        existingLessons.push(newLesson);
        localStorage.setItem('curriculumUploads', JSON.stringify(existingLessons));
        setUploadStatus('✅ File uploaded and saved locally!');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      setUploadStatus('❌ Upload failed. Please try again.');
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    border: '1px solid #2a4d8f',
    borderRadius: '6px',
    marginBottom: '10px',
    fontSize: '1rem',
  };

  return (
    <>
      <div style={{
       position: 'absolute',
       top: '20px',
       left: '20px',
       display: 'flex',
       gap: '12px',
       zIndex: 10
      }}>
       <button
        onClick={() => navigate('/')}
        style={{
         background: 'white',
         border: '1px solid #ccc',
         borderRadius: '6px',
         padding: '6px 12px',
         fontSize: '0.9rem',
         cursor: 'pointer'
        }}
       >
        Home
       </button>

       <button
        onClick={() => navigate('/admin-hub')}
        style={{
         background: 'white',
         border: '1px solid #ccc',
         borderRadius: '6px',
         padding: '6px 12px',
         fontSize: '0.9rem',
         cursor: 'pointer'
        }}
       >
        Dashboard
       </button>
      </div>
      <div style={{
       maxWidth: '600px',
       margin: '10px auto 0',
       padding: '5px 5px',
       border: '1px solid #ccc',
       borderRadius: '12px',
       position: 'relative',
      }}>
  
        <h1 style={{ textAlign: 'center', marginBottom: '16px', fontSize: '1.4rem', color: '#2a4d8f' }}>
          {translations.uploadNewLesson[selectedLanguage]}
        </h1>
  
        {/* Inputs */}
        <label>{translations.gradeLabel[selectedLanguage]}</label>
        <select value={grade} onChange={(e) => setGrade(e.target.value)} style={inputStyle}>
          {['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
  
        <label>{translations.subjectLabel[selectedLanguage]}</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g., Math"
          style={inputStyle}
        />
  
        <label>{translations.unitLabel[selectedLanguage]}</label>
        <input
          type="text"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          placeholder="e.g., Algebra"
          style={inputStyle}
        />
  
        <label>{translations.lessonTitleLabel[selectedLanguage]}</label>
        <input
          type="text"
          value={lessonTitle}
          onChange={(e) => setLessonTitle(e.target.value)}
          placeholder="Type Lesson Title"
          style={inputStyle}
        />
  
        <label>{translations.uploadFileLabel[selectedLanguage]}</label>
        <input
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleFileChange}
          style={{ ...inputStyle, padding: '6px' }}
        />
  
        <button
          onClick={handleUpload}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            width: '100%',
            backgroundColor: isHovered ? '#2a4d8f' : 'transparent',
            color: isHovered ? 'white' : '#2a4d8f',
            padding: '8px 0',
            border: '1px solid #2a4d8f',
            borderRadius: '6px',
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            marginTop: '10px'
          }}
        >
          {translations.uploadLessonButton[selectedLanguage]}
        </button>
  
        {uploadStatus && (
          <p style={{ marginTop: '12px', color: uploadStatus.includes('✅') ? 'green' : 'red' }}>
            {uploadStatus}
          </p>
        )}
      </div>
  
      {/* Lumo Footer */}
      <footer style={{
        position: 'fixed',
        bottom: 10,
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
    </>
  );
  
}
