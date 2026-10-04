import React, { useEffect, useState } from 'react';
import { Briefcase, GraduationCap, Award, Languages, Target, User, FileText, MapPin } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useSignedUrl } from '@/lib/useSignedUrl';

// Perfil profissional completo do candidato para a empresa.
// Carrega o CandidateProfile pelo candidate_user_id da simulação.
export default function CandidateProfessionalProfile({ sim }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { url: resumeUrl } = useSignedUrl(profile?.resume_url);

  useEffect(() => {
    if (!sim?.candidate_user_id) { setLoading(false); return; }
    base44.entities.CandidateProfile.filter({ user_id: sim.candidate_user_id })
      .then((p) => setProfile(p?.[0] || null))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [sim?.candidate_user_id]);

  if (loading) return <div className="text-xs text-muted-foreground/60 py-4">Carregando perfil...</div>;
  if (!profile) return <p className="text-xs text-muted-foreground/60 py-4">Perfil profissional não disponibilizado pelo candidato.</p>;

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' }) : '—';
  const langLabel = (l) => ({ basico: 'Básico', intermediario: 'Intermediário', avancado: 'Avançado', fluente: 'Fluente', nativo: 'Nativo' }[l] || l);

  return (
    <div className="space-y-6">
      {/* Resumo */}
      {(profile.professional_summary || profile.current_role || profile.desired_role) && (
        <div className="rounded-2xl surface p-5">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Resumo profissional</h3>
          </div>
          {profile.current_role && <div className="text-xs text-muted-foreground mb-1">Cargo atual: <span className="text-foreground/80">{profile.current_role}</span></div>}
          {profile.desired_role && <div className="text-xs text-muted-foreground mb-1">Cargo desejado: <span className="text-foreground/80">{profile.desired_role}</span></div>}
          {profile.professional_summary && <p className="text-sm text-foreground/80 leading-relaxed mt-2">{profile.professional_summary}</p>}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Experiências */}
        <Block icon={Briefcase} title="Experiências" items={profile.experiences} accent="primary">
          {(exp) => (
            <div className="p-3 rounded-xl bg-muted/30 border border-border">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-foreground">{exp.role || '—'}</span>
                <span className="text-[10px] font-mono text-muted-foreground">{fmtDate(exp.start_date)} – {exp.current === 'true' || exp.current === true ? 'atual' : fmtDate(exp.end_date)}</span>
              </div>
              <div className="text-xs text-muted-foreground mb-1">{exp.company || '—'}</div>
              {exp.responsibilities && <p className="text-xs text-foreground/70 leading-relaxed mt-1">{exp.responsibilities}</p>}
              {exp.results && <p className="text-xs text-emerald-400/80 leading-relaxed mt-1">Resultados: {exp.results}</p>}
            </div>
          )}
        </Block>

        {/* Formação */}
        <Block icon={GraduationCap} title="Formação" items={profile.education} accent="violet">
          {(ed) => (
            <div className="p-3 rounded-xl bg-muted/30 border border-border">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-foreground">{ed.course || '—'}</span>
                {ed.degree && <span className="text-[10px] font-mono text-muted-foreground">{ed.degree}</span>}
              </div>
              <div className="text-xs text-muted-foreground">{ed.institution || '—'}</div>
              <div className="text-[10px] font-mono text-muted-foreground/70 mt-0.5">{fmtDate(ed.start_date)} – {ed.ongoing === 'true' || ed.ongoing === true ? 'em andamento' : fmtDate(ed.end_date)}</div>
            </div>
          )}
        </Block>

        {/* Cursos */}
        <Block icon={Award} title="Cursos e certificações" items={profile.courses} accent="cyan">
          {(c) => (
            <div className="p-3 rounded-xl bg-muted/30 border border-border">
              <div className="text-sm font-medium text-foreground">{c.name || '—'}</div>
              <div className="text-xs text-muted-foreground">{c.institution || '—'} {c.year ? `· ${c.year}` : ''}</div>
            </div>
          )}
        </Block>

        {/* Idiomas + Competências */}
        <div className="space-y-4">
          <Block icon={Languages} title="Idiomas" items={profile.languages} accent="primary" compact>
            {(l) => (
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border">
                <span className="text-sm text-foreground/80">{l.language || '—'}</span>
                <span className="text-xs text-muted-foreground">{langLabel(l.level)}</span>
              </div>
            )}
          </Block>
          {profile.competencies?.length > 0 && (
            <div className="rounded-2xl surface p-5">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Competências declaradas</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {profile.competencies.map((c) => (
                  <span key={c} className="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary">{c}</span>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground/60 mt-2">Autodeclaradas — a IA usa evidência demonstrada, não autodeclaração.</p>
            </div>
          )}
        </div>
      </div>

      {/* Currículo + localização */}
      <div className="grid grid-cols-2 gap-4">
        {resumeUrl && (
          <a href={resumeUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary/5 border border-primary/20 text-primary text-sm font-medium hover:bg-primary/10 transition-colors">
            <FileText className="w-4 h-4" /> Ver currículo original
          </a>
        )}
        {(profile.city || profile.state) && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-muted border border-border text-xs text-muted-foreground">
            <MapPin className="w-4 h-4" /> {profile.city || '—'} · {profile.state || '—'}
          </div>
        )}
      </div>
    </div>
  );
}

function Block({ icon: Icon, title, items = [], accent, children, compact }) {
  const color = accent === 'violet' ? 'text-brand-violet' : accent === 'cyan' ? 'text-primary' : 'text-primary';
  return (
    <div className="rounded-2xl surface p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-4 h-4 ${color}`} />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="text-[10px] font-mono text-muted-foreground/60 ml-auto">{items.length}</span>
      </div>
      <div className={compact ? 'space-y-2' : 'space-y-2.5'}>
        {items.length === 0 ? <p className="text-xs text-muted-foreground/50 py-2">Nenhum registro.</p> : items.map((it, i) => <div key={i}>{children(it)}</div>)}
      </div>
    </div>
  );
}