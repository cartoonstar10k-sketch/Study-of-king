
import React, { useState, useEffect, useCallback } from 'react';
import { generateQuestion } from './geminiService';
import { Question, Difficulty, GameState, UserStats } from './types';
import { 
  Trophy, 
  Globe, 
  BookOpen, 
  Languages, 
  Award, 
  Zap, 
  ChevronRight, 
  RefreshCw,
  Star,
  BrainCircuit,
  Map,
  Compass
} from 'lucide-react';

const SUBJECTS = [
  "History", "Science", "Geography", "Art & Literature", "Music", 
  "Politics", "Technology", "Cuisine", "Sports", "Mythology",
  "Folklore", "Architecture", "Cinema", "Economy"
];

const LANGUAGES = [
  "English", "Spanish", "French", "German", "Chinese", 
  "Japanese", "Hindi", "Arabic", "Portuguese", "Russian",
  "Italian", "Korean", "Dutch", "Turkish"
];

const REGIONS = [
  { id: "Global", name: "Global", icon: <Globe className="w-4 h-4" /> },
  { id: "Africa", name: "Africa", icon: <Map className="w-4 h-4 text-orange-500" /> },
  { id: "Asia", name: "Asia", icon: <Map className="w-4 h-4 text-red-500" /> },
  { id: "Europe", name: "Europe", icon: <Map className="w-4 h-4 text-blue-500" /> },
  { id: "North America", name: "North America", icon: <Map className="w-4 h-4 text-emerald-500" /> },
  { id: "South America", name: "South America", icon: <Map className="w-4 h-4 text-green-500" /> },
  { id: "Oceania", name: "Oceania", icon: <Map className="w-4 h-4 text-cyan-500" /> },
  { id: "Middle East", name: "Middle East", icon: <Compass className="w-4 h-4 text-amber-600" /> },
  { id: "Japan", name: "Japan", icon: "🇯🇵" },
  { id: "India", name: "India", icon: "🇮🇳" },
  { id: "Brazil", name: "Brazil", icon: "🇧🇷" },
  { id: "Mexico", name: "Mexico", icon: "🇲🇽" },
  { id: "Egypt", name: "Egypt", icon: "🇪🇬" },
  { id: "France", name: "France", icon: "🇫🇷" },
  { id: "Germany", name: "Germany", icon: "🇩🇪" },
  { id: "South Korea", name: "South Korea", icon: "🇰🇷" }
];

const DIFFICULTY_ORDER = [
  Difficulty.BEGINNER,
  Difficulty.INTERMEDIATE,
  Difficulty.ADVANCED,
  Difficulty.EXPERT,
  Difficulty.MASTER
];

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'setup' | 'quiz' | 'results'>('landing');
  const [userStats, setUserStats] = useState<UserStats>({
    totalScore: 0,
    level: 1,
    xp: 0,
    streak: 0,
    unlockedSubjects: [...SUBJECTS.slice(0, 5)]
  });

  const [gameState, setGameState] = useState<GameState>({
    currentQuestion: null,
    score: 0,
    questionsAnswered: 0,
    isLoading: false,
    selectedSubject: 'History',
    selectedLanguage: 'English',
    currentDifficulty: Difficulty.BEGINNER,
    isGameOver: false
  });

  const [selectedCountry, setSelectedCountry] = useState('Global');
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; show: boolean; explanation: string } | null>(null);

  const startNewGame = async () => {
    setGameState(prev => ({ ...prev, isLoading: true, score: 0, questionsAnswered: 0 }));
    try {
      const q = await generateQuestion(
        gameState.selectedSubject, 
        gameState.currentDifficulty, 
        gameState.selectedLanguage,
        selectedCountry
      );
      setGameState(prev => ({ ...prev, currentQuestion: q, isLoading: false }));
      setView('quiz');
    } catch (error) {
      console.error(error);
      setGameState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleAnswer = (index: number) => {
    if (!gameState.currentQuestion || feedback?.show) return;

    const isCorrect = index === gameState.currentQuestion.correctAnswerIndex;
    setFeedback({
      isCorrect,
      show: true,
      explanation: gameState.currentQuestion.explanation
    });

    if (isCorrect) {
      setGameState(prev => ({ ...prev, score: prev.score + 10 }));
      setUserStats(prev => ({ ...prev, xp: prev.xp + 25, totalScore: prev.totalScore + 10 }));
    }
  };

  const nextQuestion = async () => {
    setFeedback(null);
    setGameState(prev => ({ ...prev, isLoading: true, questionsAnswered: prev.questionsAnswered + 1 }));

    const difficultyIndex = Math.floor((gameState.questionsAnswered + 1) / 3);
    const newDifficulty = DIFFICULTY_ORDER[Math.min(difficultyIndex, DIFFICULTY_ORDER.length - 1)];

    try {
      const q = await generateQuestion(
        gameState.selectedSubject, 
        newDifficulty, 
        gameState.selectedLanguage,
        selectedCountry
      );
      setGameState(prev => ({ 
        ...prev, 
        currentQuestion: q, 
        isLoading: false,
        currentDifficulty: newDifficulty
      }));
    } catch (error) {
      console.error(error);
      setGameState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const LandingView = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-slate-50 to-indigo-50/30">
      <div className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/20 max-w-2xl w-full transform transition-all hover:scale-[1.01]">
        <div className="inline-flex items-center justify-center p-4 bg-indigo-600 rounded-2xl shadow-lg mb-6 text-white animate-bounce-slow">
          <Globe className="w-12 h-12" />
        </div>
        <h1 className="text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
          Global <span className="text-indigo-600 font-black">Polymath</span>
        </h1>
        <p className="text-slate-600 text-lg mb-8 max-w-md mx-auto leading-relaxed font-medium">
          The ultimate AI quest. Conquer history, geography, and culture from any region in the world.
        </p>
        
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm group hover:border-indigo-200 transition-all">
            <div className="text-indigo-600 font-bold text-3xl mb-1 group-hover:scale-110 transition-transform">{userStats.level}</div>
            <div className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">Mastery Rank</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm group hover:border-indigo-200 transition-all">
            <div className="text-indigo-600 font-bold text-3xl mb-1 group-hover:scale-110 transition-transform">{userStats.xp}</div>
            <div className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">Total XP</div>
          </div>
        </div>

        <button 
          onClick={() => setView('setup')}
          className="group relative w-full inline-flex items-center justify-center px-8 py-5 font-bold text-white bg-indigo-600 rounded-2xl overflow-hidden transition-all hover:bg-indigo-700 active:scale-95 shadow-xl shadow-indigo-200"
        >
          <span className="relative flex items-center gap-3 text-lg">
            Begin Expedition <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </span>
        </button>
      </div>
    </div>
  );

  const SetupView = () => (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-10">
        <header className="flex items-center justify-between">
          <button onClick={() => setView('landing')} className="flex items-center gap-2 px-4 py-2 hover:bg-slate-200 rounded-xl transition-all text-slate-600 font-bold">
            <RefreshCw className="w-5 h-5" /> Back
          </button>
          <div className="text-center">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Expedition Log</h2>
            <p className="text-slate-500 font-medium">Customize your localized quest parameters</p>
          </div>
          <div className="w-20"></div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Region Picker - Now more prominent */}
          <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="flex items-center gap-3 text-xl font-black text-slate-800 uppercase tracking-tight">
                <Globe className="w-6 h-6 text-blue-500" />
                Target Region
              </h3>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-black rounded-full uppercase tracking-widest">Crucial Selection</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {REGIONS.map(r => (
                <button
                  key={r.id}
                  onClick={() => setSelectedCountry(r.id)}
                  className={`flex flex-col items-center justify-center gap-3 aspect-square p-4 rounded-2xl transition-all border-2 ${
                    selectedCountry === r.id 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100 scale-105 z-10' 
                    : 'bg-slate-50 border-transparent text-slate-600 hover:border-slate-200'
                  }`}
                >
                  <span className="text-2xl">{r.icon}</span>
                  <span className="text-xs font-black text-center leading-tight uppercase tracking-wider">{r.name}</span>
                </button>
              ))}
            </div>
          </section>

          <div className="space-y-8">
            {/* Subject Picker */}
            <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
              <h3 className="flex items-center gap-3 text-lg font-black text-slate-800 mb-5 uppercase tracking-tight">
                <BookOpen className="w-5 h-5 text-indigo-500" />
                Focus Topic
              </h3>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map(s => (
                  <button
                    key={s}
                    onClick={() => setGameState(prev => ({ ...prev, selectedSubject: s }))}
                    className={`px-4 py-2 rounded-xl text-sm transition-all font-bold ${
                      gameState.selectedSubject === s 
                      ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-200' 
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border-2 border-transparent'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </section>

            {/* Language Picker */}
            <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
              <h3 className="flex items-center gap-3 text-lg font-black text-slate-800 mb-5 uppercase tracking-tight">
                <Languages className="w-5 h-5 text-emerald-500" />
                Language
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {LANGUAGES.slice(0, 10).map(l => (
                  <button
                    key={l}
                    onClick={() => setGameState(prev => ({ ...prev, selectedLanguage: l }))}
                    className={`text-left px-4 py-2 rounded-xl text-sm transition-all font-bold border-2 ${
                      gameState.selectedLanguage === l 
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                      : 'bg-slate-50 text-slate-500 border-transparent hover:bg-slate-100'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 py-6">
          <button
            onClick={startNewGame}
            disabled={gameState.isLoading}
            className="group px-16 py-5 bg-slate-900 text-white font-black text-xl rounded-2xl shadow-2xl shadow-slate-200 hover:bg-black transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 flex items-center gap-4 tracking-tight"
          >
            {gameState.isLoading ? (
              <>
                <RefreshCw className="w-6 h-6 animate-spin" />
                Initializing...
              </>
            ) : (
              <>
                Launch {selectedCountry} Quest
                <Zap className="w-6 h-6 text-yellow-400 fill-yellow-400 group-hover:scale-125 transition-transform" />
              </>
            )}
          </button>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.3em]">Difficulty: {gameState.currentDifficulty}</p>
        </div>
      </div>
    </div>
  );

  const QuizView = () => {
    if (gameState.isLoading) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-8 bg-slate-50">
          <div className="relative">
            <div className="w-32 h-32 border-[6px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <BrainCircuit className="w-12 h-12 text-indigo-600 animate-pulse" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Generating Localized Quest</h3>
            <p className="text-slate-500 font-medium animate-pulse">Analyzing regional data for {selectedCountry}...</p>
          </div>
        </div>
      );
    }

    if (!gameState.currentQuestion) return null;

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center p-6 md:p-12">
        <div className="max-w-4xl w-full">
          {/* Enhanced Header Progress */}
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 mb-8 flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">XP Gained</span>
                <span className="text-3xl font-black text-indigo-600">{gameState.score}</span>
              </div>
              <div className="h-12 w-px bg-slate-100"></div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Expedition</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-slate-700">{selectedCountry}</span>
                  <span className="text-xs font-bold text-slate-400 px-2 py-0.5 bg-slate-50 rounded-full">{gameState.selectedSubject}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="text-right flex flex-col">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Level Progress</span>
                 <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                   <div className="h-full bg-indigo-500" style={{ width: `${(userStats.xp % 100)}%` }}></div>
                 </div>
               </div>
               <div className="flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100 text-white font-black text-xl">
                 {userStats.level}
               </div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 transform transition-all">
            <div className="bg-slate-900 p-10 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Globe className="w-32 h-32 rotate-12" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/10">Challenge {gameState.questionsAnswered + 1}</span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${
                    gameState.currentDifficulty === Difficulty.MASTER ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                    gameState.currentDifficulty === Difficulty.EXPERT ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                    'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>{gameState.currentDifficulty}</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black leading-tight tracking-tight">
                  {gameState.currentQuestion.text}
                </h2>
              </div>
            </div>

            <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-4">
              {gameState.currentQuestion.options.map((opt, idx) => {
                let btnStyle = "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 active:scale-[0.98]";
                if (feedback?.show) {
                  if (idx === gameState.currentQuestion?.correctAnswerIndex) {
                    btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-800 ring-4 ring-emerald-100 scale-[1.02] z-10";
                  } else {
                    btnStyle = "bg-white border-slate-100 opacity-40 grayscale";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    disabled={feedback?.show}
                    className={`w-full p-6 text-left rounded-3xl border-2 transition-all font-bold text-lg flex items-center justify-between group h-full ${btnStyle}`}
                  >
                    <span className="flex-1 pr-4">{opt}</span>
                    <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${
                      feedback?.show && idx === gameState.currentQuestion?.correctAnswerIndex 
                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                      : 'border-slate-300 group-hover:border-indigo-400'
                    }`}>
                      {feedback?.show && idx === gameState.currentQuestion?.correctAnswerIndex ? <Trophy className="w-4 h-4" /> : <span className="text-[10px] font-black opacity-50">{String.fromCharCode(65 + idx)}</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback Section */}
          {feedback?.show && (
            <div className={`mt-8 p-10 rounded-[2.5rem] animate-in slide-in-from-bottom duration-700 shadow-2xl border-2 ${
              feedback.isCorrect ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'
            }`}>
              <div className="flex flex-col md:flex-row items-start gap-8">
                <div className={`flex-shrink-0 w-16 h-16 rounded-3xl flex items-center justify-center text-white shadow-lg ${feedback.isCorrect ? 'bg-emerald-500 shadow-emerald-200' : 'bg-rose-500 shadow-rose-200'} animate-bounce-slow`}>
                  {feedback.isCorrect ? <Trophy className="w-8 h-8" /> : <Award className="w-8 h-8" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className={`text-2xl font-black tracking-tight ${feedback.isCorrect ? 'text-emerald-800' : 'text-rose-800'}`}>
                      {feedback.isCorrect ? 'Exemplary Analysis!' : 'Scientific Revision Required'}
                    </h4>
                  </div>
                  <p className="text-slate-600 text-lg leading-relaxed font-medium mb-8">
                    {feedback.explanation}
                  </p>
                  <button
                    onClick={nextQuestion}
                    className={`group flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-xl text-white transition-all transform active:scale-95 shadow-xl ${
                      feedback.isCorrect ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
                    }`}
                  >
                    Continue Expedition
                    <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-700">
      {view === 'landing' && <LandingView />}
      {view === 'setup' && <SetupView />}
      {view === 'quiz' && <QuizView />}
      
      <div className="fixed bottom-6 right-6 z-50 pointer-events-none group">
        <div className="bg-white/80 backdrop-blur px-4 py-2 rounded-2xl border border-slate-100 shadow-lg flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Polymath Core Online</span>
        </div>
      </div>
    </div>
  );
};

export default App;
