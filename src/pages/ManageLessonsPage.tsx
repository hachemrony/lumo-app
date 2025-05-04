import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ManageLessonsPage = () => {
    const handleEditClick = (lesson: { lessonTitle: string; grade: string; subject: string; unit: string; uploadedAt: string }) => {
        const newLessonTitle = prompt('Edit Lesson Title:', lesson.lessonTitle);
        const newGrade = prompt('Edit Grade:', lesson.grade);
        const newSubject = prompt('Edit Subject:', lesson.subject);
        const newUnit = prompt('Edit Unit:', lesson.unit);
      
        if (newLessonTitle && newGrade && newSubject && newUnit) {
          const updatedLessons = lessons.map((l) =>
            l.lessonTitle === lesson.lessonTitle
              ? { ...l, lessonTitle: newLessonTitle, grade: newGrade, subject: newSubject, unit: newUnit }
              : l
          );
      
          setLessons(updatedLessons);
          localStorage.setItem('curriculumUploads', JSON.stringify(updatedLessons));
          alert('✅ Lesson updated successfully!');
        }
      };
      
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<{ grade: string; subject: string; unit: string; lessonTitle: string; uploadedAt: string }[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role !== 'admin') {
      navigate('/');
    }

    const storedLessons = JSON.parse(localStorage.getItem('curriculumUploads') || '[]');
    setLessons(storedLessons);
  }, [navigate]);

  const handleDelete = (lessonTitle: string) => {
    const updatedLessons = lessons.filter(lesson => lesson.lessonTitle !== lessonTitle);
    setLessons(updatedLessons);
    localStorage.setItem('curriculumUploads', JSON.stringify(updatedLessons));
  };

  const filteredLessons = lessons.filter((lesson) =>
    lesson.grade.toLowerCase().includes(search.toLowerCase()) ||
    lesson.subject.toLowerCase().includes(search.toLowerCase()) ||
    lesson.unit.toLowerCase().includes(search.toLowerCase()) ||
    lesson.lessonTitle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    
    <div style={{ padding: '40px' }}>
        {/* Home Button */}
        <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10 }}>
         <button
          onClick={() => navigate('/')}
          style={{
           background: 'white',
           border: '1px solid #ccc',
           borderRadius: '6px',
           padding: '5px 10px',
           fontSize: '0.9rem',
           cursor: 'pointer',
           fontWeight: 400,
          }}
         >
           Home
         </button>
        </div>

      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '20px', marginTop: '60px'}}>
        Manage Lessons
      </h1>

      {/* 🔍 Search Field */}
      <input
        type="text"
        placeholder="Search lessons..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: '10px',
          width: '100%',
          maxWidth: '400px',
          marginBottom: '20px',
          borderRadius: '6px',
          border: '1px solid #ccc',
          fontSize: '1rem',
        }}
      />

      {/* 📋 Lessons List */}
      {filteredLessons.length === 0 ? (
        <p>No matching lessons found.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredLessons.map((lesson, index) => (
            <div key={index} style={{ padding: '16px', border: '1px solid #ccc', borderRadius: '8px', position: 'relative' }}>
              <h3>{lesson.lessonTitle}</h3>
              <p><strong>Grade:</strong> {lesson.grade}</p>
              <p><strong>Subject:</strong> {lesson.subject}</p>
              <p><strong>Unit:</strong> {lesson.unit}</p>
              <p><strong>Uploaded:</strong> {new Date(lesson.uploadedAt).toLocaleDateString()}</p>
              <button
                onClick={() => {
                    const confirmDelete = window.confirm('❗ Are you sure you want to delete this lesson?');
                    if (confirmDelete) {
                      handleDelete(lesson.lessonTitle);
                    }
                  }}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  backgroundColor: '#fff',
                  color: '#d00',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  padding: '4px 12px',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                🗑️ Delete
              </button>
              {/* ✏️ Edit Button */}
              <button
               onClick={() => handleEditClick(lesson)}
               style={{
                position: 'absolute',
                top: '48px',
                right: '10px',
                backgroundColor: '#fff',
                color: 'green',
                border: '1px solid #ccc',
                borderRadius: '6px',
                padding: '4px 21px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                fontWeight: 500
               }}
              >
               ✏️ Edit
              </button>  
            </div>
          ))}
        </div>
      )}
     
    </div>
  );
};

export default ManageLessonsPage;
