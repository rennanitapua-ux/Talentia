import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Lock, AlertTriangle, Bot, ClipboardX, CheckCircle2, PenLine, MousePointerClick, ArrowRight, Sparkles, Clock, FileText, User } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { analyzeQuestionResponse, generateFinalAssessment } from '@/lib/skillosAI';
import SimulationLock from '@/components/SimulationLock';
import DiscTest from '@/components/DiscTest';
import Logo from '@/components/Logo';

export default function CandidateSimulation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [sim, setSim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState('intro'); // intro, disc, simulating, analyzing, done
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [choice, setChoice] = useState(null);
  const [writeAnswer, setWriteAnswer] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [responses, setResponses] = useState([]);
  const [violations, setViolations] = useState(0);
  const [pasteWarning, setPasteWarning] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [phaseTransition, setPhaseTransition] = useState(false);
  const [discResults, setDiscResults] = useState(null);
  const [discAnswers, setDiscAnswers] = useState([]);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (u) {
        // Check if candidate already completed this simulation
        base44.entities.Simulation.filter({
          job_id: id,
          candidate_user_id: u.id,
          status: 'completed'
        }).then(existing => {
          if (existing && existing.length > 0) {
            // Already completed — redirect to results
            navigate(`/candidate/results/${existing[0].id}`);
            return;
          }
          // Also check for in-progress simulation
          base44.entities.Simulation.filter({
            job_id: id,
            candidate_user_id: u.id,
            status: 'in_progress'
          }).then(inProgress => {
            if (inProgress && inProgress.length > 0) {
              // Has an in-progress simulation — resume it
              setSim(inProgress[0]);
              setResponses(inProgress[0].responses || []);
              setViolations(inProgress[0].focus_violations || 0);
            }
            // Get candidate profile
            base44.entities.CandidateProfile.filter({ user_id: u.id }).then(profiles => {
              if (profiles && profiles.length > 0) setProfile(profiles[0]);
            }).catch(() => {});
          }).catch(() => {});
        }).catch(() => {});
      }
      base44.entities.Job.get(id).then(j => {
        setJob(j);
        setLoading(false);
      }).catch(() => setLoading(false));
    }).catch(() => setLoading(false));
  }, [id, navigate]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [analyzing, phaseTransition]);

  useEffect(() => {
    // Track question start time when question changes
    if (phase === 'simulating' && !analyzing && !phaseTransition) {
      setQuestionStartTime(Date.now());
    }
  }, [phase, phaseIdx, qIdx, analyzing, phaseTransition]);

  const handleViolation = () => setViolations(v => v + 1);

  const handlePasteBlock = (e) => {
    e.preventDefault();
    setPasteWarning(true);
    handleViolation();
    setTimeout(() => setPasteWarning(false), 3000);
  };

  const phases = job?.simulation_scenarios || [];
  const currentPhase = phases[phaseIdx];
  const currentQuestion = currentPhase?.questions?.[qIdx];
  const isChoice = currentPhase?.type === 'choice';

  const totalQuestions = phases.reduce((sum, p) => sum + (p.questions?.length || 0), 0);
  const answeredQuestions = responses.length;
  const overallProgress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  const handleDiscComplete = (results, answers) => {
    setDiscResults(results);
    setDiscAnswers(answers);
    startSimulation();
  };

  const startSimulation = async () => {
    const candidateName = profile?.full_name || user?.full_name || user?.email || 'Candidato';
    const newSim = await base44.entities.Simulation.create({
      job_id: id,
      job_title: job.title,
      company_name: job.company_name,
      candidate_name: candidateName,
      candidate_user_id: user?.id || '',
      candidate_email: user?.email || '',
      candidate_phone: profile?.phone || '',
      candidate_resume_url: profile?.resume_url || '',
      candidate_profile_photo: profile?.profile_photo_url || '',
      status: 'in_progress',
      started_at: new Date().toISOString(),
      focus_violations: 0,
      responses: [],
      disc_results: discResults,
      disc_profile: discResults?.profile_code || '',
      disc_answers: discAnswers,
      hiring_status: 'em_analise',
    });
    setSim(newSim);
    setPhase('simulating');
    setPhaseIdx(0);
    setQIdx(0);
  };

  const submitAnswer = async () => {
    if (isChoice && !choice) return;
    if (!isChoice && !writeAnswer.trim()) return;

    setAnalyzing(true);

    const answer = isChoice ? choice : writeAnswer;
    const choiceObj = isChoice ? (currentQuestion.multiple_choice || []).find(c => c.id === choice) : null;

    // Calculate time spent
    const timeSpent = questionStartTime ? Math.round((Date.now() - questionStartTime) / 1000) : 0;

    const responseData = {
      phase_index: phaseIdx,
      phase_type: currentPhase.type,
      phase_title: currentPhase.title,
      question_id: currentQuestion.id,
      question_prompt: currentQuestion.prompt,
      character_name: currentQuestion.character?.name,
      character_role: currentQuestion.character?.role,
      is_choice: isChoice,
      choice_id: isChoice ? choice : null,
      answer: isChoice ? (choiceObj?.text || '') : writeAnswer,
      time_spent_seconds: timeSpent,
      analysis: null,
    };

    // Only run AI analysis for write questions — choice questions only track integrity
    if (!isChoice) {
      const previousTexts = responses.filter(r => !r.is_choice).map(r => r.answer);

      try {
        const analysis = await analyzeQuestionResponse(currentQuestion, answer, isChoice, previousTexts);
        responseData.analysis = analysis;
      } catch (e) {
        console.error('Analysis failed, continuing with fallback:', e);
        responseData.analysis = {
          competency_scores: {},
          ai_detection: { is_ai_generated: false, confidence: 0, indicators: [], analysis: 'Análise indisponível.' },
          response_quality: { specificity: 0, depth: 0, authenticity: 0, notes: 'Análise indisponível.' },
          response_score: 0,
          detailed_feedback: 'Análise indisponível para esta resposta.',
        };
      }
    } else {
      // For choice questions: no AI analysis, just record the choice level
      responseData.analysis = {
        competency_scores: {},
        ai_detection: null,
        response_quality: null,
        response_score: 0,
        detailed_feedback: 'Resposta de múltipla escolha — análise de IA aplicada apenas em respostas escritas.',
        choice_level: choiceObj?.level || 'unknown',
      };
    }

    const updatedResponses = [...responses, responseData];
    setResponses(updatedResponses);

    try {
      await base44.entities.Simulation.update(sim.id, {
        responses: updatedResponses,
        focus_violations: violations,
      });
    } catch (e) {
      console.error('Failed to save response:', e);
    }

    setAnalyzing(false);
    setChoice(null);
    setWriteAnswer('');

    // Move to next question or next phase
    const nextQIdx = qIdx + 1;
    if (nextQIdx < (currentPhase.questions?.length || 0)) {
      setQIdx(nextQIdx);
    } else {
      // Phase complete, move to next phase
      const nextPhaseIdx = phaseIdx + 1;
      if (nextPhaseIdx < phases.length) {
        setPhaseTransition(true);
        setTimeout(() => {
          setPhaseIdx(nextPhaseIdx);
          setQIdx(0);
          setPhaseTransition(false);
        }, 1800);
      } else {
        // All phases complete
        finishSimulation(updatedResponses);
      }
    }
  };

  const finishSimulation = async (allResponses) => {
    setPhase('analyzing');
    try {
      const assessment = await generateFinalAssessment(
        sim.candidate_name, job, allResponses, discResults
      );

      const aiFlags = allResponses
        .filter(r => r.analysis?.ai_detection?.is_ai_generated)
        .map(r => ({
          question_id: r.question_id,
          phase_index: r.phase_index,
          confidence: r.analysis.ai_detection.confidence,
          analysis: r.analysis.ai_detection.analysis,
        }));

      const totalTime = allResponses.reduce((sum, r) => sum + (r.time_spent_seconds || 0), 0);

      await base44.entities.Simulation.update(sim.id, {
        status: 'completed',
        skill_scores: assessment.skill_scores || {},
        skill_dna: assessment.skill_dna || { strengths: [], growth_areas: [] },
        skill_graph: assessment.skill_graph || assessment.skill_scores || {},
        overall_score: assessment.overall_score || 0,
        recommendation: assessment.recommendation || '',
        summary: assessment.summary || '',
        personality_analysis: assessment.personality_analysis || '',
        work_style: assessment.work_style || '',
        strengths_detail: assessment.strengths_detail || '',
        weaknesses_detail: assessment.weaknesses_detail || '',
        ai_flags: aiFlags,
        completed_at: new Date().toISOString(),
        focus_violations: violations,
        total_time_seconds: totalTime,
      });

      setPhase('done');
      setTimeout(() => navigate(`/candidate/results/${sim.id}`), 800);
    } catch (e) {
      console.error(e);
      alert('Erro ao gerar avaliação final. Tente novamente.');
      setPhase('simulating');
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" /></div>;
  if (!job) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Vaga não encontrada</div>;

  // DISC TEST PHASE
  if (phase === 'disc') {
    return <DiscTest onComplete={handleDiscComplete} />;
  }

  // INTRO SCREEN
  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl w-full">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8">
            <div className="flex items-center gap-2 mb-2">
              <Logo size="xs" />
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Simulação Pronta</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
            <div className="text-sm text-slate-400 mb-6">{job.company_name} · {job.role}</div>

            {job.virtual_company_profile && (
              <div className="mb-6 p-4 rounded-xl bg-slate-800/30 border border-slate-800">
                <div className="text-xs font-mono text-slate-500 uppercase mb-2">Sobre a empresa</div>
                <p className="text-sm text-slate-300 leading-relaxed">{job.virtual_company_profile}</p>
              </div>
            )}

            <div className="mb-6">
              <div className="text-xs font-mono text-slate-500 uppercase mb-2">Competências avaliadas</div>
              <div className="flex flex-wrap gap-2">
                {(job.competencies || []).map((c, i) => (
                  <span key={i} className="px-3 py-1 rounded-lg bg-violet-500/10 border border-violet-500/30 text-violet-200 text-xs">{c}</span>
                ))}
              </div>
            </div>

            {/* Phase overview */}
            <div className="mb-6">
              <div className="text-xs font-mono text-slate-500 uppercase mb-3">Estrutura da simulação</div>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-cyan-500/15">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Teste Comportamental DISC</div>
                    <div className="text-xs text-slate-500">12 perguntas · 5 min · antes da simulação</div>
                  </div>
                </div>
                {phases.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-800">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${p.type === 'choice' ? 'bg-cyan-500/15' : 'bg-violet-500/15'}`}>
                      {p.type === 'choice' ? <MousePointerClick className="w-4 h-4 text-cyan-400" /> : <PenLine className="w-4 h-4 text-violet-400" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{p.title || `Fase ${i + 1}`}</div>
                      <div className="text-xs text-slate-500">
                        {p.type === 'choice' ? 'Múltipla escolha' : 'Resposta escrita'} · {p.questions?.length || 0} perguntas
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-amber-200">Modo Protegido</span>
              </div>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>• A simulação entra em tela cheia — não é possível alternar abas</li>
                <li>• <span className="text-rose-300">Colar, copiar e recortar são bloqueados</span> — escreva com suas palavras</li>
                <li>• Respostas escritas são analisadas por IA para detectar uso de IA externa</li>
                <li>• <span className="text-cyan-300">O tempo de cada questão é registrado</span></li>
                <li>• Violações de integridade são registradas e visíveis para a empresa</li>
              </ul>
            </div>

            <button
              onClick={() => setPhase('disc')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-violet-500 text-white font-semibold text-sm hover:bg-violet-400 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Iniciar Teste DISC + Simulação
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ANALYZING SCREEN
  if (phase === 'analyzing') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-500/30 border-t-violet-400 rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-xl font-semibold mb-2">Gerando sua avaliação</h2>
          <p className="text-slate-400 text-sm">A IA está consolidando todas as evidências...</p>
          <div className="mt-6 space-y-1.5 text-left max-w-sm mx-auto font-mono text-xs text-slate-500">
            <div className="text-violet-400">{'>'} Integrando perfil DISC...</div>
            <div className="text-violet-400">{'>'} Calculando Skill Scores...</div>
            <div className="text-violet-400">{'>'} Gerando análise de personalidade...</div>
            <div className="text-violet-400">{'>'} Construindo Skill Graph...</div>
            <div className="text-violet-400">{'>'} Detectando padrões de IA...</div>
          </div>
        </div>
      </div>
    );
  }

  // DONE SCREEN
  if (phase === 'done') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Avaliação Concluída!</h2>
          <p className="text-slate-400 text-sm">Redirecionando para seus resultados...</p>
        </motion.div>
      </div>
    );
  }

  // SIMULATION SCREEN
  return (
    <SimulationLock onViolation={handleViolation} violationCount={violations}>
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        <AnimatePresence>
          {pasteWarning && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-6 left-1/2 -translate-x-1/2 z-[70] bg-rose-950/95 border border-rose-500/50 rounded-xl px-5 py-4 shadow-2xl shadow-rose-500/20 max-w-md"
            >
              <div className="flex items-start gap-3">
                <ClipboardX className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-rose-300 font-semibold text-sm">Colar Bloqueado</div>
                  <div className="text-rose-200/80 text-xs mt-0.5">Colar, copiar e recortar são proibidos. Escreva sua resposta com as próprias palavras.</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase transition overlay */}
        <AnimatePresence>
          {phaseTransition && currentPhase && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-slate-950 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="text-center"
              >
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Fase {phaseIdx + 1} concluída</div>
                <div className="text-2xl font-bold mb-1">{currentPhase.title}</div>
                <p className="text-slate-400 text-sm">Preparando próxima fase...</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 py-3 flex items-center gap-4 sticky top-0 z-40">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">{job.title}</div>
            <div className="text-[10px] text-slate-500 font-mono">
              {job.company_name} · Fase {phaseIdx + 1}/{phases.length}
              {currentPhase && ` · ${currentPhase.title}`}
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {violations > 0 && (
              <div className="flex items-center gap-1 text-rose-400 text-xs">
                <AlertTriangle className="w-3.5 h-3.5" />
                {violations}
              </div>
            )}
            <div className="text-[10px] font-mono text-slate-500 hidden sm:block">
              {answeredQuestions}/{totalQuestions}
            </div>
            <div className="w-24 h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <motion.div className="h-full bg-violet-400" animate={{ width: `${overallProgress}%` }} />
            </div>
          </div>
        </header>

        {/* Phase type badge */}
        {currentPhase && !analyzing && !phaseTransition && (
          <div className="px-6 pt-4 max-w-3xl mx-auto w-full">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
              isChoice
                ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                : 'bg-violet-500/10 text-violet-300 border border-violet-500/20'
            }`}>
              {isChoice ? <MousePointerClick className="w-3.5 h-3.5" /> : <PenLine className="w-3.5 h-3.5" />}
              {isChoice ? 'Múltipla Escolha' : 'Resposta Escrita'}
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">Pergunta {qIdx + 1} de {currentPhase.questions?.length || 0}</span>
            </div>
          </div>
        )}

        {/* Question area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 max-w-3xl mx-auto w-full">
          {currentQuestion && !analyzing && !phaseTransition && (
            <motion.div
              key={`${phaseIdx}-${qIdx}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Character / context */}
              {currentQuestion.character?.name && (
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {currentQuestion.character.name.charAt(0)}
                  </div>
                  <div className="flex-1 bg-slate-800/60 rounded-2xl rounded-tl-sm p-4">
                    <div className="text-xs text-slate-500 mb-1">{currentQuestion.character.name} · {currentQuestion.character.role}</div>
                    <p className="text-sm text-slate-200">{currentQuestion.prompt || 'Responda a pergunta abaixo com suas próprias palavras.'}</p>
                    {currentQuestion.context && (
                      <p className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-700/50">{currentQuestion.context}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Question without character */}
              {!currentQuestion.character?.name && (
                <div className="bg-slate-800/60 rounded-2xl p-5 mb-4">
                  <p className="text-sm text-slate-200">{currentQuestion.prompt || 'Responda a pergunta abaixo com suas próprias palavras.'}</p>
                  {currentQuestion.context && (
                    <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-700/50">{currentQuestion.context}</p>
                  )}
                </div>
              )}

              {/* Choice options */}
              {isChoice && (
                <div className="space-y-2.5">
                  <div className="text-xs font-mono text-slate-500 uppercase mb-2">Escolha a melhor opção</div>
                  {(currentQuestion.multiple_choice || []).map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setChoice(opt.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        choice === opt.id
                          ? 'bg-cyan-500/15 border-cyan-500/50 text-white'
                          : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono flex-shrink-0 ${
                          choice === opt.id ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-slate-400'
                        }`}>{opt.id.toUpperCase()}</span>
                        <span className="text-sm">{opt.text}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Write answer */}
              {!isChoice && (
                <div>
                  {currentQuestion.write_guidance && (
                    <div className="mb-3 p-3 rounded-xl bg-violet-500/5 border border-violet-500/20">
                      <div className="flex items-center gap-1.5 mb-1">
                        <PenLine className="w-3.5 h-3.5 text-violet-400" />
                        <span className="text-[10px] font-mono text-violet-400 uppercase tracking-wider">O que escrever</span>
                      </div>
                      <p className="text-xs text-violet-200/80 leading-relaxed">{currentQuestion.write_guidance}</p>
                    </div>
                  )}
                  <div className="text-xs font-mono text-slate-500 uppercase mb-2">Sua resposta</div>
                  <textarea
                    value={writeAnswer}
                    onChange={e => setWriteAnswer(e.target.value)}
                    onPaste={handlePasteBlock}
                    onCopy={handlePasteBlock}
                    onCut={handlePasteBlock}
                    onContextMenu={handlePasteBlock}
                    rows={6}
                    placeholder="Digite sua resposta detalhada (não é possível colar)..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-violet-500 focus:outline-none resize-none"
                  />
                  <div className="text-[10px] text-slate-600 mt-1.5 flex items-center gap-3">
                    <span>{writeAnswer.length} caracteres · mínimo recomendado: 80</span>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Analyzing indicator */}
          {analyzing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3 bg-slate-800/60 rounded-xl px-5 py-4">
                <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                <span className="text-sm text-slate-400">Analisando sua resposta...</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Submit bar */}
        {!analyzing && !phaseTransition && currentQuestion && (
          <div className="border-t border-slate-800 bg-slate-900/80 backdrop-blur px-6 py-4 max-w-3xl mx-auto w-full">
            <button
              onClick={submitAnswer}
              disabled={isChoice ? !choice : !writeAnswer.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-violet-500 text-white font-semibold text-sm hover:bg-violet-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isChoice ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Confirmar Resposta
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar Resposta
                </>
              )}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </SimulationLock>
  );
}