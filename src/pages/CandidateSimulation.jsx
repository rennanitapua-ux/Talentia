import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Lock, AlertTriangle, Bot } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { analyzeResponse, generateFinalAssessment } from '@/lib/skillosAI';
import SimulationLock from '@/components/SimulationLock';

export default function CandidateSimulation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [sim, setSim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState('intro');
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [messages, setMessages] = useState([]);
  const [choice, setChoice] = useState(null);
  const [openResponse, setOpenResponse] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [responses, setResponses] = useState([]);
  const [violations, setViolations] = useState(0);
  const [user, setUser] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => {});
    base44.entities.Job.get(id).then(j => {
      setJob(j);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, analyzing]);

  const handleViolation = () => setViolations(v => v + 1);

  const startSimulation = async () => {
    const candidateName = user?.full_name || user?.email || 'Candidato Anônimo';
    const newSim = await base44.entities.Simulation.create({
      job_id: id,
      job_title: job.title,
      company_name: job.company_name,
      candidate_name: candidateName,
      status: 'in_progress',
      started_at: new Date().toISOString(),
      focus_violations: 0,
      responses: [],
    });
    setSim(newSim);
    setPhase('simulating');
    showScenario(0, newSim);
  };

  const showScenario = (idx, simRef = sim) => {
    const scenarios = job.simulation_scenarios || [];
    if (idx >= scenarios.length) {
      finishSimulation(simRef);
      return;
    }
    const sc = scenarios[idx];
    setScenarioIdx(idx);
    setChoice(null);
    setOpenResponse('');
    setMessages([{
      type: 'character',
      character: sc.character,
      text: sc.opening_message,
      context: sc.context,
    }]);
  };

  const submitResponse = async () => {
    if (!choice || !openResponse.trim()) return;
    setAnalyzing(true);
    const sc = job.simulation_scenarios[scenarioIdx];
    const choiceObj = sc.multiple_choice?.find(c => c.id === choice);

    setMessages(m => [...m, { type: 'candidate', text: choiceObj?.text || '' }, { type: 'candidate', text: openResponse }]);

    try {
      const previousTexts = responses.map(r => r.open_response);
      const analysis = await analyzeResponse(sc, choice, openResponse, previousTexts);

      const responseData = {
        scenario_index: scenarioIdx,
        situation: sc.situation,
        character_name: sc.character?.name,
        character_role: sc.character?.role,
        opening_message: sc.opening_message,
        choice_id: choice,
        choice_text: choiceObj?.text,
        open_response: openResponse,
        analysis,
      };

      const updatedResponses = [...responses, responseData];
      setResponses(updatedResponses);

      await base44.entities.Simulation.update(sim.id, {
        responses: updatedResponses,
        focus_violations: violations,
      });

      setMessages(m => [...m, { type: 'analysis', analysis }]);
      setAnalyzing(false);

      setTimeout(() => {
        showScenario(scenarioIdx + 1, sim);
      }, 2000);
    } catch (e) {
      console.error(e);
      setAnalyzing(false);
      alert('Erro ao analisar resposta. Tente novamente.');
    }
  };

  const finishSimulation = async (simRef) => {
    setPhase('analyzing');
    try {
      const assessment = await generateFinalAssessment(simRef.candidate_name, job, responses);

      const aiFlags = responses
        .filter(r => r.analysis?.ai_detection?.is_ai_generated)
        .map(r => ({
          scenario_index: r.scenario_index,
          confidence: r.analysis.ai_detection.confidence,
          analysis: r.analysis.ai_detection.analysis,
        }));

      await base44.entities.Simulation.update(simRef.id, {
        status: 'completed',
        skill_scores: assessment.skill_scores || {},
        skill_dna: assessment.skill_dna || { strengths: [], growth_areas: [] },
        skill_graph: assessment.skill_graph || assessment.skill_scores || {},
        overall_score: assessment.overall_score || 0,
        recommendation: assessment.recommendation || '',
        summary: assessment.summary || '',
        ai_flags: aiFlags,
        completed_at: new Date().toISOString(),
        focus_violations: violations,
      });

      setPhase('done');
      setTimeout(() => navigate(`/candidate/results/${simRef.id}`), 800);
    } catch (e) {
      console.error(e);
      alert('Erro ao gerar avaliação final.');
      setPhase('simulating');
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" /></div>;
  if (!job) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Vaga não encontrada</div>;

  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl w-full">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-xs font-mono text-violet-400 uppercase tracking-wider">Simulação Pronta</span>
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

            <div className="mb-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-amber-200">Modo Protegido</span>
              </div>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>• A simulação entra em tela cheia — não é possível alternar abas</li>
                <li>• Cada resposta é analisada por IA para detectar uso de IA externa</li>
                <li>• Violações de integridade são registradas e visíveis para a empresa</li>
                <li>• Responda como você agiria no trabalho real — mostre seu potencial verdadeiro</li>
              </ul>
            </div>

            <div className="mb-6">
              <div className="text-xs font-mono text-slate-500 uppercase mb-2">{(job.simulation_scenarios || []).length} cenários</div>
              <div className="flex gap-1.5">
                {(job.simulation_scenarios || []).map((_, i) => (
                  <div key={i} className="h-1.5 flex-1 rounded-full bg-slate-800" />
                ))}
              </div>
            </div>

            <button
              onClick={startSimulation}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-violet-500 text-white font-semibold text-sm hover:bg-violet-400 transition-colors"
            >
              <Lock className="w-4 h-4" />
              Iniciar Simulação Protegida
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (phase === 'analyzing') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-500/30 border-t-violet-400 rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-xl font-semibold mb-2">Gerando sua avaliação</h2>
          <p className="text-slate-400 text-sm">A IA está consolidando todas as evidências...</p>
          <div className="mt-6 space-y-1.5 text-left max-w-sm mx-auto font-mono text-xs text-slate-500">
            <div className="text-violet-400">{'>'} Calculando Skill Scores...</div>
            <div className="text-violet-400">{'>'} Gerando Skill DNA...</div>
            <div className="text-violet-400">{'>'} Construindo Skill Graph...</div>
            <div className="text-violet-400">{'>'} Detectando padrões de IA...</div>
          </div>
        </div>
      </div>
    );
  }

  const scenarios = job.simulation_scenarios || [];
  const sc = scenarios[scenarioIdx];
  const progress = (scenarioIdx / scenarios.length) * 100;

  return (
    <SimulationLock onViolation={handleViolation} violationCount={violations}>
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 py-3 flex items-center gap-4">
          <div className="flex-1">
            <div className="text-sm font-semibold">{job.title}</div>
            <div className="text-[10px] text-slate-500 font-mono">{job.company_name} · Cenário {scenarioIdx + 1}/{scenarios.length}</div>
          </div>
          <div className="flex items-center gap-3">
            {violations > 0 && (
              <div className="flex items-center gap-1 text-rose-400 text-xs">
                <AlertTriangle className="w-3.5 h-3.5" />
                {violations}
              </div>
            )}
            <div className="w-32 h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <motion.div className="h-full bg-violet-400" animate={{ width: `${progress}%` }} />
            </div>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 max-w-3xl mx-auto w-full">
          <div className="space-y-4">
            {messages.map((msg, i) => {
              if (msg.type === 'character') {
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {msg.character?.name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-slate-500 mb-1">{msg.character?.name} · {msg.character?.role}</div>
                      <div className="bg-slate-800/60 rounded-2xl rounded-tl-sm p-4">
                        <p className="text-sm text-slate-200">{msg.text}</p>
                        {msg.context && <p className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-700/50">{msg.context}</p>}
                      </div>
                    </div>
                  </motion.div>
                );
              }
              if (msg.type === 'candidate') {
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3 justify-end">
                    <div className="bg-violet-500/20 border border-violet-500/30 rounded-2xl rounded-tr-sm p-4 max-w-md">
                      <p className="text-sm text-slate-100">{msg.text}</p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-violet-500/20 flex items-center justify-center text-sm font-bold text-violet-300 flex-shrink-0">
                      {(user?.full_name || 'V').charAt(0).toUpperCase()}
                    </div>
                  </motion.div>
                );
              }
              if (msg.type === 'analysis') {
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="flex-1 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl rounded-tl-sm p-4">
                      <div className="text-xs font-mono text-cyan-400 uppercase mb-2">Análise Registrada</div>
                      <div className="space-y-1.5">
                        {Object.entries(msg.analysis.competency_scores || {}).map(([comp, data]) => (
                          <div key={comp} className="flex items-center justify-between text-xs">
                            <span className="text-slate-300">{comp}</span>
                            <span className="flex items-center gap-1.5">
                              <span className={data.evidence === '✓' ? 'text-emerald-400' : data.evidence === '✗' ? 'text-rose-400' : 'text-amber-400'}>
                                {data.evidence}
                              </span>
                              <span className="font-mono text-slate-400">{data.score}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                      {msg.analysis.ai_detection?.is_ai_generated && (
                        <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-center gap-1.5 text-xs text-rose-400">
                          <AlertTriangle className="w-3 h-3" />
                          Padrão de IA detectado ({msg.analysis.ai_detection.confidence}%)
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              }
              return null;
            })}

            {analyzing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-cyan-400 animate-pulse" />
                </div>
                <div className="bg-slate-800/60 rounded-2xl rounded-tl-sm p-4 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                  <span className="text-sm text-slate-400">Analisando sua resposta...</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {!analyzing && sc && (
          <div className="border-t border-slate-800 bg-slate-900/80 backdrop-blur px-6 py-4 max-w-3xl mx-auto w-full">
            <div className="mb-3">
              <div className="text-xs font-mono text-slate-500 uppercase mb-2">Escolha a melhor ação</div>
              <div className="grid grid-cols-2 gap-2">
                {(sc.multiple_choice || []).map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setChoice(opt.id)}
                    className={`text-left p-3 rounded-lg border text-sm transition-all ${
                      choice === opt.id
                        ? 'bg-violet-500/15 border-violet-500/50 text-white'
                        : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono flex-shrink-0 ${
                        choice === opt.id ? 'bg-violet-500 text-white' : 'bg-slate-700 text-slate-400'
                      }`}>{opt.id}</span>
                      <span>{opt.text}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-mono text-slate-500 uppercase mb-2">{sc.follow_up_question}</div>
              <div className="flex gap-2">
                <textarea
                  value={openResponse}
                  onChange={e => setOpenResponse(e.target.value)}
                  rows={2}
                  placeholder="Digite sua resposta detalhada..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:border-violet-500 focus:outline-none resize-none"
                />
                <button
                  onClick={submitResponse}
                  disabled={!choice || !openResponse.trim()}
                  className="px-4 rounded-lg bg-violet-500 text-white hover:bg-violet-400 disabled:opacity-40 disabled:cursor-not-allowed self-start"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimulationLock>
  );
}