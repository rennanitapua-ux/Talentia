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
    let cancelled = false;
    (async () => {
      let currentUser = null;
      try { currentUser = await base44.auth.me(); } catch {}
      if (cancelled) return;
      setUser(currentUser);

      let currentJob = null;
      try { currentJob = await base44.entities.Job.get(id); } catch {}
      if (cancelled) return;
      setJob(currentJob);
      setLoading(false);

      if (!currentUser || !currentJob) return;

      // Check for completed simulation — redirect to results
      try {
        const completed = await base44.entities.Simulation.filter({
          job_id: id, candidate_user_id: currentUser.id, status: 'completed'
        });
        if (cancelled) return;
        if (completed && completed.length > 0) {
          navigate(`/candidate/results/${completed[0].id}`);
          return;
        }
      } catch {}

      // Load candidate profile
      try {
        const profiles = await base44.entities.CandidateProfile.filter({ user_id: currentUser.id });
        if (cancelled) return;
        if (profiles && profiles.length > 0) setProfile(profiles[0]);
      } catch {}

      // Check for in-progress simulation — resume it
      try {
        const inProgress = await base44.entities.Simulation.filter({
          job_id: id, candidate_user_id: currentUser.id, status: 'in_progress'
        });
        if (cancelled) return;
        if (inProgress && inProgress.length > 0) {
          const existingSim = inProgress[0];
          const existingResponses = existingSim.responses || [];
          setSim(existingSim);
          setResponses(existingResponses);
          setViolations(existingSim.focus_violations || 0);

          // Calculate resume position from responses count
          const phases = currentJob.simulation_scenarios || [];
          let answered = existingResponses.length;
          let resumePhaseIdx = 0;
          let resumeQIdx = 0;
          let allAnswered = true;
          for (let pi = 0; pi < phases.length; pi++) {
            const phaseQs = phases[pi].questions || [];
            if (answered >= phaseQs.length) {
              answered -= phaseQs.length;
            } else {
              resumePhaseIdx = pi;
              resumeQIdx = answered;
              allAnswered = false;
              break;
            }
          }

          if (allAnswered && existingResponses.length > 0) {
            // All answered but sim still in_progress — finish it
            finishSimulation(existingResponses, existingSim);
          } else if (!allAnswered) {
            setPhaseIdx(resumePhaseIdx);
            setQIdx(resumeQIdx);
            setPhase('simulating');
          }
        }
      } catch {}
    })();
    return () => { cancelled = true; };
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

  const finishSimulation = async (allResponses, simArg = null) => {
    const activeSim = simArg || sim;
    if (!activeSim) return;
    setPhase('analyzing');
    try {
      const assessment = await generateFinalAssessment(
        activeSim.candidate_name, job, allResponses, activeSim.disc_results || discResults
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

      await base44.entities.Simulation.update(activeSim.id, {
        status: 'completed',
        skill_scores: assessment.skill_scores || {},
        score_confidence: assessment.score_confidence || {},
        score_composition: assessment.score_composition || [],
        skill_dna: assessment.skill_dna || { strengths: [], growth_areas: [] },
        skill_graph: assessment.skill_graph || assessment.skill_scores || {},
        overall_score: assessment.overall_score || 0,
        overall_confidence: assessment.overall_confidence || 'medium',
        recommendation: assessment.recommendation || '',
        summary: assessment.summary || '',
        personality_analysis: assessment.personality_analysis || '',
        work_style: assessment.work_style || '',
        strengths_detail: assessment.strengths_detail || '',
        weaknesses_detail: assessment.weaknesses_detail || '',
        profile_summary: assessment.profile_summary || '',
        hard_skills: assessment.hard_skills || [],
        soft_skills: assessment.soft_skills || [],
        job_compatibility: assessment.job_compatibility || {},
        interview_questions: assessment.interview_questions || [],
        consistency_analysis: assessment.consistency_analysis || '',
        assessment_confidence: assessment.assessment_confidence || {},
        ai_flags: aiFlags,
        completed_at: new Date().toISOString(),
        focus_violations: violations,
        total_time_seconds: totalTime,
      });

      setPhase('done');
      setTimeout(() => navigate(`/candidate/results/${activeSim.id}`), 800);
    } catch (e) {
      console.error(e);
      alert('Erro ao gerar avaliação final. Tente novamente.');
      setPhase('simulating');
    }
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-brand-violet border-t-transparent rounded-full animate-spin" /></div>;
  if (!job) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Vaga não encontrada</div>;

  // DISC TEST PHASE
  if (phase === 'disc') {
    return <DiscTest onComplete={handleDiscComplete} />;
  }

  // INTRO SCREEN
  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl w-full">
          <div className="bg-card/60 border border-border rounded-2xl p-8">
            <div className="flex items-center gap-2 mb-2">
              <Logo size="xs" />
              <span className="text-xs font-mono text-primary uppercase tracking-wider">Simulação Pronta</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
            <div className="text-sm text-muted-foreground mb-6">{job.company_name} · {job.role}</div>

            {job.virtual_company_profile && (
              <div className="mb-6 p-4 rounded-xl bg-muted/30 border border-border">
                <div className="text-xs font-mono text-muted-foreground/70 uppercase mb-2">Sobre a empresa</div>
                <p className="text-sm text-foreground/80 leading-relaxed">{job.virtual_company_profile}</p>
              </div>
            )}

            <div className="mb-6">
              <div className="text-xs font-mono text-muted-foreground/70 uppercase mb-2">Competências avaliadas</div>
              <div className="flex flex-wrap gap-2">
                {(job.competencies || []).map((c, i) => (
                  <span key={i} className="px-3 py-1 rounded-lg bg-brand-violet/10 border border-brand-violet/30 text-brand-violet/80 text-xs">{c}</span>
                ))}
              </div>
            </div>

            {/* Phase overview */}
            <div className="mb-6">
              <div className="text-xs font-mono text-muted-foreground/70 uppercase mb-3">Estrutura da simulação</div>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-primary/15">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Teste Comportamental DISC</div>
                    <div className="text-xs text-muted-foreground/70">12 perguntas · 5 min · antes da simulação</div>
                  </div>
                </div>
                {phases.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${p.type === 'choice' ? 'bg-primary/15' : 'bg-brand-violet/15'}`}>
                      {p.type === 'choice' ? <MousePointerClick className="w-4 h-4 text-primary" /> : <PenLine className="w-4 h-4 text-brand-violet" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{p.title || `Fase ${i + 1}`}</div>
                      <div className="text-xs text-muted-foreground/70">
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
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• A simulação entra em tela cheia — não é possível alternar abas</li>
                <li>• <span className="text-rose-300">Colar, copiar e recortar são bloqueados</span> — escreva com suas palavras</li>
                <li>• Respostas escritas são analisadas por IA para detectar uso de IA externa</li>
                <li>• <span className="text-primary">O tempo de cada questão é registrado</span></li>
                <li>• Violações de integridade são registradas e visíveis para a empresa</li>
              </ul>
            </div>

            <button
              onClick={() => setPhase('disc')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-brand-violet text-foreground font-semibold text-sm hover:bg-brand-violet/90 transition-colors"
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
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-violet/30 border-t-violet-400 rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-xl font-semibold mb-2">Gerando sua avaliação</h2>
          <p className="text-muted-foreground text-sm">A IA está consolidando todas as evidências...</p>
          <div className="mt-6 space-y-1.5 text-left max-w-sm mx-auto font-mono text-xs text-muted-foreground/70">
            <div className="text-brand-violet">{'>'} Integrando perfil DISC...</div>
            <div className="text-brand-violet">{'>'} Calculando Skill Scores...</div>
            <div className="text-brand-violet">{'>'} Gerando análise de personalidade...</div>
            <div className="text-brand-violet">{'>'} Construindo Skill Graph...</div>
            <div className="text-brand-violet">{'>'} Detectando padrões de IA...</div>
          </div>
        </div>
      </div>
    );
  }

  // DONE SCREEN
  if (phase === 'done') {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Avaliação Concluída!</h2>
          <p className="text-muted-foreground text-sm">Redirecionando para seus resultados...</p>
        </motion.div>
      </div>
    );
  }

  // SIMULATION SCREEN
  return (
    <SimulationLock onViolation={handleViolation} violationCount={violations}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
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
              className="fixed inset-0 z-[60] bg-background flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="text-center"
              >
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <div className="text-xs font-mono text-muted-foreground/70 uppercase tracking-wider mb-2">Fase {phaseIdx + 1} concluída</div>
                <div className="text-2xl font-bold mb-1">{currentPhase.title}</div>
                <p className="text-muted-foreground text-sm">Preparando próxima fase...</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <header className="border-b border-border bg-card/80 backdrop-blur px-6 py-3 flex items-center gap-4 sticky top-0 z-40">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">{job.title}</div>
            <div className="text-[10px] text-muted-foreground/70 font-mono">
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
            <div className="text-[10px] font-mono text-muted-foreground/70 hidden sm:block">
              {answeredQuestions}/{totalQuestions}
            </div>
            <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
              <motion.div className="h-full bg-brand-violet/90" animate={{ width: `${overallProgress}%` }} />
            </div>
          </div>
        </header>

        {/* Phase type badge */}
        {currentPhase && !analyzing && !phaseTransition && (
          <div className="px-6 pt-4 max-w-3xl mx-auto w-full">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
              isChoice
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'bg-brand-violet/10 text-brand-violet border border-brand-violet/20'
            }`}>
              {isChoice ? <MousePointerClick className="w-3.5 h-3.5" /> : <PenLine className="w-3.5 h-3.5" />}
              {isChoice ? 'Múltipla Escolha' : 'Resposta Escrita'}
              <span className="text-muted-foreground/70">·</span>
              <span className="text-muted-foreground">Pergunta {qIdx + 1} de {currentPhase.questions?.length || 0}</span>
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
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {currentQuestion.character.name.charAt(0)}
                  </div>
                  <div className="flex-1 bg-muted/60 rounded-2xl rounded-tl-sm p-4">
                    <div className="text-xs text-muted-foreground/70 mb-1">{currentQuestion.character.name} · {currentQuestion.character.role}</div>
                    <p className="text-sm text-foreground/90">{currentQuestion.prompt || 'Responda a pergunta abaixo com suas próprias palavras.'}</p>
                    {currentQuestion.context && (
                      <p className="text-xs text-muted-foreground/70 mt-2 pt-2 border-t border-border/50">{currentQuestion.context}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Question without character */}
              {!currentQuestion.character?.name && (
                <div className="bg-muted/60 rounded-2xl p-5 mb-4">
                  <p className="text-sm text-foreground/90">{currentQuestion.prompt || 'Responda a pergunta abaixo com suas próprias palavras.'}</p>
                  {currentQuestion.context && (
                    <p className="text-xs text-muted-foreground/70 mt-3 pt-3 border-t border-border/50">{currentQuestion.context}</p>
                  )}
                </div>
              )}

              {/* Choice options */}
              {isChoice && (
                <div className="space-y-2.5">
                  <div className="text-xs font-mono text-muted-foreground/70 uppercase mb-2">Escolha a melhor opção</div>
                  {(currentQuestion.multiple_choice || []).map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setChoice(opt.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        choice === opt.id
                          ? 'bg-primary/15 border-primary/50 text-foreground'
                          : 'bg-muted/40 border-border text-foreground/80 hover:border-border'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono flex-shrink-0 ${
                          choice === opt.id ? 'bg-primary text-foreground' : 'bg-accent text-muted-foreground'
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
                    <div className="mb-3 p-3 rounded-xl bg-brand-violet/5 border border-brand-violet/20">
                      <div className="flex items-center gap-1.5 mb-1">
                        <PenLine className="w-3.5 h-3.5 text-brand-violet" />
                        <span className="text-[10px] font-mono text-brand-violet uppercase tracking-wider">O que escrever</span>
                      </div>
                      <p className="text-xs text-brand-violet/80/80 leading-relaxed">{currentQuestion.write_guidance}</p>
                    </div>
                  )}
                  <div className="text-xs font-mono text-muted-foreground/70 uppercase mb-2">Sua resposta</div>
                  <textarea
                    value={writeAnswer}
                    onChange={e => setWriteAnswer(e.target.value)}
                    onPaste={handlePasteBlock}
                    onCopy={handlePasteBlock}
                    onCut={handlePasteBlock}
                    onContextMenu={handlePasteBlock}
                    rows={6}
                    placeholder="Digite sua resposta detalhada (não é possível colar)..."
                    className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm focus:border-brand-violet focus:outline-none resize-none"
                  />
                  <div className="text-[10px] text-muted-foreground/50 mt-1.5 flex items-center gap-3">
                    <span>{writeAnswer.length} caracteres · mínimo recomendado: 80</span>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Analyzing indicator */}
          {analyzing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3 bg-muted/60 rounded-xl px-5 py-4">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                <span className="text-sm text-muted-foreground">Analisando sua resposta...</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Submit bar */}
        {!analyzing && !phaseTransition && currentQuestion && (
          <div className="border-t border-border bg-card/80 backdrop-blur px-6 py-4 max-w-3xl mx-auto w-full">
            <button
              onClick={submitAnswer}
              disabled={isChoice ? !choice : !writeAnswer.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-violet text-foreground font-semibold text-sm hover:bg-brand-violet/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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