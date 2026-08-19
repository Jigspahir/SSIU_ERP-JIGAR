import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Badge } from '../../components/common/Badge';
import { 
  HelpCircle, Clock, CheckCircle2, Award, ArrowRight, 
  RotateCcw, Sparkles, BookOpen, AlertCircle, Play, Check, X,
  Plus, Edit2, Trash2, Users, Eye, BarChart3, Globe, Archive, FileText
} from 'lucide-react';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizAttempt {
  id: string;
  studentId: string;
  studentName: string;
  enrollmentNo: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  isPassed: boolean;
  attemptedAt: string;
}

export interface QuizItem {
  id: string;
  title: string;
  subjectCode: string;
  subjectName: string;
  unitName: string;
  totalQuestions: number;
  durationMinutes: number;
  passingPercentage: number;
  status: 'AVAILABLE' | 'COMPLETED' | 'DRAFT' | 'ARCHIVED';
  bestScore?: number;
  questions: QuizQuestion[];
  attempts?: QuizAttempt[];
}

const initialQuizzes: QuizItem[] = [
  {
    id: 'quiz-1',
    title: 'Unit 2: Relational Algebra & SQL Joins Practice Test',
    subjectCode: 'CS401',
    subjectName: 'Database Management Systems',
    unitName: 'Unit 2 - Relational Model & Normalization',
    totalQuestions: 4,
    durationMinutes: 10,
    passingPercentage: 60,
    status: 'AVAILABLE',
    questions: [
      {
        id: 'q1',
        question: 'Which relational algebra operation selects rows that satisfy a given condition?',
        options: ['Projection (π)', 'Selection (σ)', 'Cartesian Product (×)', 'Rename (ρ)'],
        correctIndex: 1,
        explanation: 'Selection (σ) is a unary operation that selects tuples that satisfy a given predicate.'
      },
      {
        id: 'q2',
        question: 'What type of JOIN returns all records from the left table and matched records from the right table?',
        options: ['INNER JOIN', 'FULL OUTER JOIN', 'LEFT OUTER JOIN', 'CROSS JOIN'],
        correctIndex: 2,
        explanation: 'LEFT JOIN returns all rows from the left table, and matching rows from the right table.'
      },
      {
        id: 'q3',
        question: 'In BCNF, every functional dependency X -> Y must have X as a:',
        options: ['Candidate Key / Super Key', 'Foreign Key', 'Primary Key only', 'Composite Key'],
        correctIndex: 0,
        explanation: 'Boyce-Codd Normal Form (BCNF) strictly requires that for every X -> Y, X must be a super key.'
      },
      {
        id: 'q4',
        question: 'Which ACID property ensures that a transaction is completely executed or completely aborted?',
        options: ['Consistency', 'Atomicity', 'Isolation', 'Durability'],
        correctIndex: 1,
        explanation: 'Atomicity ensures "all or nothing" execution for database transactions.'
      }
    ],
    attempts: [
      {
        id: 'att-1',
        studentId: 'stu-1',
        studentName: 'Aarav Patel',
        enrollmentNo: '230101001',
        score: 4,
        totalQuestions: 4,
        percentage: 100,
        isPassed: true,
        attemptedAt: '2026-03-10 14:30'
      },
      {
        id: 'att-2',
        studentId: 'stu-2',
        studentName: 'Diya Sharma',
        enrollmentNo: '230101002',
        score: 3,
        totalQuestions: 4,
        percentage: 75,
        isPassed: true,
        attemptedAt: '2026-03-11 11:15'
      }
    ]
  },
  {
    id: 'quiz-2',
    title: 'Unit 3: Transport Layer & TCP Congestion Control Quiz',
    subjectCode: 'CS402',
    subjectName: 'Computer Networks',
    unitName: 'Unit 3 - Transport Layer Protocols',
    totalQuestions: 3,
    durationMinutes: 8,
    passingPercentage: 60,
    status: 'AVAILABLE',
    questions: [
      {
        id: 'q2-1',
        question: 'Which protocol provides reliable, connection-oriented byte-stream delivery?',
        options: ['UDP', 'TCP', 'IP', 'ICMP'],
        correctIndex: 1,
        explanation: 'TCP (Transmission Control Protocol) is connection-oriented and reliable.'
      },
      {
        id: 'q2-2',
        question: 'What is the standard port number for HTTPS secure web traffic?',
        options: ['80', '21', '443', '22'],
        correctIndex: 2,
        explanation: 'Port 443 is the standard default port used for HTTPS encrypted communication.'
      },
      {
        id: 'q2-3',
        question: 'Which algorithm is used in TCP for slow start and congestion avoidance?',
        options: ['Bellman-Ford', 'AIMD (Additive Increase Multiplicative Decrease)', 'Dijkstra', 'Floyd-Warshall'],
        correctIndex: 1,
        explanation: 'TCP congestion control employs Additive Increase Multiplicative Decrease (AIMD).'
      }
    ],
    attempts: [
      {
        id: 'att-3',
        studentId: 'stu-1',
        studentName: 'Aarav Patel',
        enrollmentNo: '230101001',
        score: 2,
        totalQuestions: 3,
        percentage: 66.7,
        isPassed: true,
        attemptedAt: '2026-03-12 16:45'
      }
    ]
  }
];

export const QuizPage: React.FC = () => {
  const { user, role } = useAuth();
  const isStudent = role === 'STUDENT';
  const subjects = db.getSubjects();

  const [quizzes, setQuizzes] = useState<QuizItem[]>(initialQuizzes);

  // Student Test Taking State
  const [activeQuiz, setActiveQuiz] = useState<QuizItem | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  // Faculty Management State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<QuizItem | null>(null);
  const [viewingAttemptsQuiz, setViewingAttemptsQuiz] = useState<QuizItem | null>(null);

  // Form State for Quiz
  const [quizTitle, setQuizTitle] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [unitName, setUnitName] = useState('Unit 1: Fundamentals');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [passingPercentage, setPassingPercentage] = useState(60);
  const [quizStatus, setQuizStatus] = useState<'AVAILABLE' | 'DRAFT' | 'ARCHIVED'>('AVAILABLE');
  const [formQuestions, setFormQuestions] = useState<QuizQuestion[]>([
    {
      id: 'q-new-1',
      question: 'Sample Question 1',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctIndex: 0,
      explanation: 'Explanation for correct option A'
    }
  ]);

  // Student test runner handlers
  const handleStartQuiz = (quiz: QuizItem) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setScore(0);
  };

  const handleSelectAnswer = (optionIndex: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optionIndex
    }));
  };

  const handleNextQuestion = () => {
    if (!activeQuiz) return;
    if (currentQuestionIndex < activeQuiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = () => {
    if (!activeQuiz) return;
    let correctCount = 0;
    activeQuiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    const calculatedScore = Math.round((correctCount / activeQuiz.questions.length) * 100);
    setScore(calculatedScore);
    setQuizSubmitted(true);

    // Record attempt
    const newAttempt: QuizAttempt = {
      id: `att-${Date.now()}`,
      studentId: user?.id || 'stu-1',
      studentName: user?.name || 'Student User',
      enrollmentNo: user?.enrollmentNo || '230101001',
      score: correctCount,
      totalQuestions: activeQuiz.questions.length,
      percentage: calculatedScore,
      isPassed: calculatedScore >= activeQuiz.passingPercentage,
      attemptedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    setQuizzes(prev => prev.map(q => {
      if (q.id === activeQuiz.id) {
        return {
          ...q,
          status: 'COMPLETED',
          bestScore: Math.max(q.bestScore || 0, calculatedScore),
          attempts: [newAttempt, ...(q.attempts || [])]
        };
      }
      return q;
    }));
  };

  // Faculty Management Handlers
  const handleOpenCreate = () => {
    setEditingQuiz(null);
    setQuizTitle('');
    setSubjectId(subjects[0]?.id || '');
    setUnitName('Unit 1: Introduction');
    setDurationMinutes(15);
    setPassingPercentage(60);
    setQuizStatus('AVAILABLE');
    setFormQuestions([
      {
        id: `q-${Date.now()}-1`,
        question: 'Enter your question here...',
        options: ['Choice A', 'Choice B', 'Choice C', 'Choice D'],
        correctIndex: 0,
        explanation: 'Brief explanation for correct answer.'
      }
    ]);
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (quiz: QuizItem) => {
    setEditingQuiz(quiz);
    setQuizTitle(quiz.title);
    const sub = subjects.find(s => s.code === quiz.subjectCode || s.name === quiz.subjectName);
    setSubjectId(sub?.id || subjects[0]?.id || '');
    setUnitName(quiz.unitName);
    setDurationMinutes(quiz.durationMinutes);
    setPassingPercentage(quiz.passingPercentage);
    setQuizStatus(quiz.status as any);
    setFormQuestions([...quiz.questions]);
    setIsCreateModalOpen(true);
  };

  const handleAddQuestionToForm = () => {
    setFormQuestions(prev => [
      ...prev,
      {
        id: `q-${Date.now()}-${prev.length + 1}`,
        question: `Question ${prev.length + 1}`,
        options: ['Choice 1', 'Choice 2', 'Choice 3', 'Choice 4'],
        correctIndex: 0,
        explanation: 'Explanation for correct choice.'
      }
    ]);
  };

  const handleRemoveQuestionFromForm = (idx: number) => {
    if (formQuestions.length <= 1) {
      alert('A quiz must have at least 1 question.');
      return;
    }
    setFormQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateQuestionField = (idx: number, field: string, value: any) => {
    setFormQuestions(prev => prev.map((q, i) => {
      if (i === idx) {
        return { ...q, [field]: value };
      }
      return q;
    }));
  };

  const handleUpdateOption = (qIdx: number, optIdx: number, val: string) => {
    setFormQuestions(prev => prev.map((q, i) => {
      if (i === qIdx) {
        const nextOpts = [...q.options];
        nextOpts[optIdx] = val;
        return { ...q, options: nextOpts };
      }
      return q;
    }));
  };

  const handleSaveQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTitle.trim()) {
      alert('Please enter a quiz title.');
      return;
    }

    const selectedSub = subjects.find(s => s.id === subjectId) || subjects[0];

    if (editingQuiz) {
      setQuizzes(prev => prev.map(q => {
        if (q.id === editingQuiz.id) {
          return {
            ...q,
            title: quizTitle,
            subjectCode: selectedSub?.code || 'CS401',
            subjectName: selectedSub?.name || 'Computer Science',
            unitName,
            durationMinutes: Number(durationMinutes),
            passingPercentage: Number(passingPercentage),
            status: quizStatus,
            totalQuestions: formQuestions.length,
            questions: formQuestions
          };
        }
        return q;
      }));
    } else {
      const newQuiz: QuizItem = {
        id: `quiz-${Date.now()}`,
        title: quizTitle,
        subjectCode: selectedSub?.code || 'CS401',
        subjectName: selectedSub?.name || 'Computer Science',
        unitName,
        totalQuestions: formQuestions.length,
        durationMinutes: Number(durationMinutes),
        passingPercentage: Number(passingPercentage),
        status: quizStatus,
        questions: formQuestions,
        attempts: []
      };

      setQuizzes(prev => [newQuiz, ...prev]);

      if (quizStatus === 'AVAILABLE') {
        db.addNotification({
          title: `New Quiz Scheduled: ${quizTitle}`,
          message: `${selectedSub?.name}: Practice test with ${formQuestions.length} questions published.`,
          module: 'ASSIGNMENT',
          timestamp: 'Just now',
          targetRole: 'STUDENT',
          linkTab: 'quiz'
        });
      }
    }

    setIsCreateModalOpen(false);
  };

  const handleDeleteQuiz = (id: string) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      setQuizzes(prev => prev.filter(q => q.id !== id));
    }
  };

  const handleTogglePublish = (quiz: QuizItem) => {
    const nextStatus = quiz.status === 'AVAILABLE' ? 'ARCHIVED' : 'AVAILABLE';
    setQuizzes(prev => prev.map(q => q.id === quiz.id ? { ...q, status: nextStatus } : q));
  };

  // Render Student Active Test Screen
  if (activeQuiz) {
    const currentQ = activeQuiz.questions[currentQuestionIndex];
    const userSelected = selectedAnswers[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === activeQuiz.questions.length - 1;
    const isAnswered = userSelected !== undefined;
    const isPassed = score >= activeQuiz.passingPercentage;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '840px', margin: '0 auto' }}>
        {/* Active Quiz Header */}
        <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #0F2C59 0%, #183B70 100%)', color: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--brand-gold)', fontSize: '0.8125rem', fontWeight: 700 }}>
                <span>{activeQuiz.subjectCode} • {activeQuiz.subjectName}</span>
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '0.25rem' }}>{activeQuiz.title}</h2>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'rgba(255,255,255,0.15)', padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 700 }}>
                <Clock size={16} color="var(--brand-gold)" /> {activeQuiz.durationMinutes} Mins
              </div>
              <button 
                onClick={() => setActiveQuiz(null)}
                className="btn btn-secondary btn-sm"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#FFFFFF', border: 'none' }}
              >
                Exit Test
              </button>
            </div>
          </div>

          {/* Question Stepper Bar */}
          <div style={{ display: 'flex', gap: '0.35rem', marginTop: '1.25rem' }}>
            {activeQuiz.questions.map((_, idx) => {
              const isCurr = idx === currentQuestionIndex;
              const isFilled = selectedAnswers[idx] !== undefined;
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  style={{
                    flex: 1,
                    height: '6px',
                    borderRadius: '3px',
                    border: 'none',
                    backgroundColor: isCurr ? 'var(--brand-orange)' : (isFilled ? '#10B981' : 'rgba(255,255,255,0.25)'),
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  title={`Question ${idx + 1}`}
                />
              );
            })}
          </div>
        </div>

        {/* Results Screen */}
        {quizSubmitted ? (
          <div className="card" style={{ padding: '2.5rem', textAlign: 'center', borderLeft: isPassed ? '6px solid #10B981' : '6px solid #EF4444' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: isPassed ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: isPassed ? '#10B981' : '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              {isPassed ? <Award size={40} /> : <AlertCircle size={40} />}
            </div>

            <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--brand-navy)' }}>
              {isPassed ? 'Congratulations! Quiz Passed' : 'Quiz Needs Revision'}
            </h3>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Passing criteria: {activeQuiz.passingPercentage}% • Required: {Math.ceil((activeQuiz.passingPercentage / 100) * activeQuiz.questions.length)} / {activeQuiz.questions.length} questions
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', margin: '1.75rem 0', flexWrap: 'wrap' }}>
              <div style={{ padding: '1rem 1.5rem', backgroundColor: 'var(--bg-surface-hover)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>YOUR SCORE</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: isPassed ? '#10B981' : '#EF4444' }}>{score}%</div>
              </div>
              <div style={{ padding: '1rem 1.5rem', backgroundColor: 'var(--bg-surface-hover)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>CORRECT ANSWERS</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--brand-navy)' }}>
                  {activeQuiz.questions.filter((q, idx) => selectedAnswers[idx] === q.correctIndex).length} / {activeQuiz.questions.length}
                </div>
              </div>
            </div>

            {/* Answer Explanations Review */}
            <div style={{ textAlign: 'left', marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1rem' }}>
                Detailed Question Solutions &amp; Concepts
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {activeQuiz.questions.map((q, idx) => {
                  const userAns = selectedAnswers[idx];
                  const isCorrect = userAns === q.correctIndex;
                  return (
                    <div key={q.id} style={{ padding: '1rem', borderRadius: '8px', border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, backgroundColor: isCorrect ? '#F0FDF4' : '#FEF2F2' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem', color: isCorrect ? '#10B981' : '#EF4444', marginBottom: '0.35rem' }}>
                        {isCorrect ? <CheckCircle2 size={16} /> : <X size={16} />} Question {idx + 1}: {q.question}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-main)', marginTop: '0.25rem' }}>
                        <strong>Correct Answer:</strong> {q.options[q.correctIndex]}
                      </div>
                      {userAns !== undefined && userAns !== q.correctIndex && (
                        <div style={{ fontSize: '0.8125rem', color: '#EF4444', marginTop: '0.15rem' }}>
                          <strong>Your Answer:</strong> {q.options[userAns]}
                        </div>
                      )}
                      <div style={{ fontSize: '0.78125rem', color: 'var(--text-muted)', marginTop: '0.35rem', fontStyle: 'italic' }}>
                        💡 {q.explanation}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
              <button onClick={() => handleStartQuiz(activeQuiz)} className="btn btn-secondary">
                <RotateCcw size={16} /> Retake Test
              </button>
              <button onClick={() => setActiveQuiz(null)} className="btn btn-primary">
                Return to Quizzes
              </button>
            </div>
          </div>
        ) : (
          /* Interactive Question Card */
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <Badge variant="orange">Question {currentQuestionIndex + 1} of {activeQuiz.questions.length}</Badge>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Single Choice</span>
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--brand-navy)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              {currentQ.question}
            </h3>

            {/* Options List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = userSelected === optIdx;
                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectAnswer(optIdx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem 1.25rem',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid var(--brand-orange)' : '1px solid var(--border-color)',
                      backgroundColor: isSelected ? 'rgba(243,112,35,0.06)' : 'var(--bg-surface)',
                      color: isSelected ? 'var(--brand-navy)' : 'var(--text-main)',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '0.9375rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: isSelected ? '2px solid var(--brand-orange)' : '2px solid var(--text-muted)',
                      backgroundColor: isSelected ? 'var(--brand-orange)' : 'transparent',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      flexShrink: 0
                    }}>
                      {String.fromCharCode(65 + optIdx)}
                    </div>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Navigation & Submit Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
              <button
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
                className="btn btn-secondary"
              >
                Previous
              </button>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {!isLastQuestion ? (
                  <button
                    onClick={handleNextQuestion}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    Next Question <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={!isAnswered}
                    className="btn btn-primary"
                    style={{ backgroundColor: '#10B981', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <CheckCircle2 size={16} /> Submit &amp; View Score
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Quizzes Dashboard Screen
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
            Continuous Assessment &amp; Quiz Portal
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {isStudent 
              ? 'Test your unit concepts with timed practice tests and immediate solution feedback' 
              : 'Create unit quizzes, configure questions, schedule test windows, and monitor student performance results'}
          </p>
        </div>

        {!isStudent && (
          <button className="btn btn-primary" onClick={handleOpenCreate} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={16} /> Create New Quiz
          </button>
        )}
      </div>

      {/* Quizzes List Cards */}
      <div className="grid-2">
        {quizzes.map(quiz => {
          const isDone = quiz.status === 'COMPLETED';
          const attemptsCount = quiz.attempts?.length || 0;

          return (
            <div key={quiz.id} className="card card-hover" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: quiz.status === 'AVAILABLE' ? '4px solid #10B981' : (quiz.status === 'DRAFT' ? '4px solid #F59E0B' : '4px solid #64748B') }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <Badge variant="navy">{quiz.subjectCode}</Badge>
                    <Badge variant={quiz.status === 'AVAILABLE' ? 'active' : (quiz.status === 'DRAFT' ? 'gold' : 'inactive')}>
                      {quiz.status}
                    </Badge>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: 'var(--brand-orange)', fontWeight: 700 }}>
                    <Clock size={15} /> {quiz.durationMinutes} Mins
                  </div>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '0.35rem' }}>
                  {quiz.title}
                </h3>

                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  {quiz.subjectName} • {quiz.unitName}
                </div>

                <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  <span>Questions: <strong>{quiz.totalQuestions}</strong></span>
                  <span>Pass Threshold: <strong>{quiz.passingPercentage}%</strong></span>
                  {!isStudent && <span>Attempts: <strong>{attemptsCount} Students</strong></span>}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#10B981' }}>
                  {quiz.bestScore !== undefined ? `Best Score: ${quiz.bestScore}%` : 'Not Attempted'}
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {!isStudent ? (
                    <>
                      <button 
                        className="btn btn-secondary btn-sm" 
                        onClick={() => setViewingAttemptsQuiz(quiz)}
                        title="View Student Results"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        <Users size={13} /> Attempts ({attemptsCount})
                      </button>
                      <button 
                        className="btn btn-secondary btn-sm" 
                        onClick={() => handleTogglePublish(quiz)}
                        title={quiz.status === 'AVAILABLE' ? 'Archive Quiz' : 'Publish Quiz'}
                      >
                        {quiz.status === 'AVAILABLE' ? <Archive size={13} /> : <Globe size={13} />}
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit(quiz)} title="Edit Quiz">
                        <Edit2 size={13} />
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteQuiz(quiz.id)} title="Delete Quiz">
                        <Trash2 size={13} />
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleStartQuiz(quiz)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      {isDone ? <RotateCcw size={14} /> : <Play size={14} />}
                      {isDone ? 'Retake Quiz' : 'Start Practice Quiz'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Faculty Create / Edit Quiz Modal */}
      {isCreateModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '680px', padding: '1.75rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1.25rem' }}>
              {editingQuiz ? 'Edit Course Quiz' : 'Create Course Quiz & Assessment'}
            </h3>

            <form onSubmit={handleSaveQuiz} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Quiz Title *</label>
                <input type="text" className="form-input" placeholder="e.g. Unit 3: Normalization & Query Optimization Quiz" value={quizTitle} onChange={e => setQuizTitle(e.target.value)} required />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Subject *</label>
                  <select className="form-select" value={subjectId} onChange={e => setSubjectId(e.target.value)} required>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Unit / Module</label>
                  <input type="text" className="form-input" placeholder="e.g. Unit 3 - Relational Design" value={unitName} onChange={e => setUnitName(e.target.value)} required />
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Duration (Mins) *</label>
                  <input type="number" className="form-input" min={5} max={180} value={durationMinutes} onChange={e => setDurationMinutes(Number(e.target.value))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Passing % *</label>
                  <input type="number" className="form-input" min={10} max={100} value={passingPercentage} onChange={e => setPassingPercentage(Number(e.target.value))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Status *</label>
                  <select className="form-select" value={quizStatus} onChange={e => setQuizStatus(e.target.value as any)}>
                    <option value="AVAILABLE">AVAILABLE (Live to Students)</option>
                    <option value="DRAFT">DRAFT (Unpublished)</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
              </div>

              {/* Questions Section */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                    Questions ({formQuestions.length})
                  </h4>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddQuestionToForm} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Plus size={14} /> Add Question
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {formQuestions.map((q, qIdx) => (
                    <div key={q.id} style={{ padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface-hover)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--brand-orange)' }}>Question #{qIdx + 1}</span>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemoveQuestionFromForm(qIdx)} style={{ padding: '0.2rem 0.5rem' }}>
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>

                      <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Question text..."
                          value={q.question}
                          onChange={e => handleUpdateQuestionField(qIdx, 'question', e.target.value)}
                          required
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <input
                              type="radio"
                              name={`correct-${qIdx}`}
                              checked={q.correctIndex === optIdx}
                              onChange={() => handleUpdateQuestionField(qIdx, 'correctIndex', optIdx)}
                              title="Mark as correct answer"
                            />
                            <input
                              type="text"
                              className="form-input"
                              placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                              value={opt}
                              onChange={e => handleUpdateOption(qIdx, optIdx, e.target.value)}
                              required
                            />
                          </div>
                        ))}
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Explanation for solution..."
                          value={q.explanation}
                          onChange={e => handleUpdateQuestionField(qIdx, 'explanation', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingQuiz ? 'Update Quiz' : 'Save & Publish Quiz'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Faculty View Attempts Modal */}
      {viewingAttemptsQuiz && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '640px', padding: '1.75rem', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                  Student Quiz Attempts
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  {viewingAttemptsQuiz.title}
                </p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setViewingAttemptsQuiz(null)}>
                Close
              </button>
            </div>

            {(!viewingAttemptsQuiz.attempts || viewingAttemptsQuiz.attempts.length === 0) ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Users size={36} color="var(--brand-gold)" style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                <p>No student attempts recorded for this quiz yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {viewingAttemptsQuiz.attempts.map(att => (
                  <div key={att.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', backgroundColor: 'var(--bg-surface-hover)', borderRadius: '6px', borderLeft: att.isPassed ? '4px solid #10B981' : '4px solid #EF4444' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--brand-navy)', fontSize: '0.9rem' }}>{att.studentName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Enrollment: {att.enrollmentNo} • {att.attemptedAt}</div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Badge variant={att.isPassed ? 'active' : 'danger'}>
                        {att.isPassed ? 'PASSED' : 'FAILED'}
                      </Badge>
                      <div style={{ textAlign: 'right' }}>
                        <strong style={{ fontSize: '1rem', color: att.isPassed ? '#10B981' : '#EF4444' }}>{att.percentage}%</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{att.score} / {att.totalQuestions} Correct</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
