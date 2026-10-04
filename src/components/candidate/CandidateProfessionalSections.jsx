import React from 'react';
import { Briefcase, GraduationCap, Award, Languages, User, Target } from 'lucide-react';
import RepeatableList from '@/components/candidate/RepeatableList';
import TagInput from '@/components/candidate/TagInput';

const LANG_LEVELS = [
  { value: 'basico', label: 'Básico' },
  { value: 'intermediario', label: 'Intermediário' },
  { value: 'avancado', label: 'Avançado' },
  { value: 'fluente', label: 'Fluente' },
  { value: 'nativo', label: 'Nativo' },
];

// Compõe as seções profissionais do perfil do candidato.
// form: estado do formulário. update(field, value): setter.
export default function CandidateProfessionalSections({ form, update }) {
  return (
    <div className="space-y-7">
      {/* Dados profissionais básicos */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-2">Cargo atual</label>
          <input value={form.current_role || ''} onChange={(e) => update('current_role', e.target.value)}
            placeholder="Ex.: Analista de Marketing"
            className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-2">Cargo desejado</label>
          <input value={form.desired_role || ''} onChange={(e) => update('desired_role', e.target.value)}
            placeholder="Ex.: Coordenador de Marketing"
            className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-2">Data de nascimento</label>
          <input type="date" value={form.birth_date || ''} onChange={(e) => update('birth_date', e.target.value)}
            className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:border-primary/50 focus:outline-none" />
          <p className="text-[10px] text-muted-foreground/60 mt-1">Usada apenas para coerência de trajetória — nunca como critério de penalização.</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-2">País</label>
          <input value={form.country || 'Brasil'} onChange={(e) => update('country', e.target.value)}
            className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:border-primary/50 focus:outline-none" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-2">Resumo profissional</label>
        <textarea value={form.professional_summary || ''} onChange={(e) => update('professional_summary', e.target.value)} rows={3}
          placeholder="Conte um resumo da sua trajetória, áreas de atuação e objetivos..."
          className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none resize-none" />
      </div>

      {/* Experiências */}
      <RepeatableList
        title="Experiências profissionais" icon={Briefcase}
        items={form.experiences || []}
        onChange={(v) => update('experiences', v)}
        addLabel="Adicionar experiência"
        fields={[
          { key: 'company', label: 'Empresa', placeholder: 'Nome da empresa' },
          { key: 'role', label: 'Cargo', placeholder: 'Seu cargo' },
          { key: 'start_date', label: 'Início', type: 'date' },
          { key: 'end_date', label: 'Fim', type: 'date' },
          { key: 'current', label: '', type: 'select', options: [{ value: '', label: 'Selecione' }, { value: 'true', label: 'Emprego atual' }] },
          { key: 'responsibilities', label: 'Responsabilidades', type: 'textarea', full: true, placeholder: 'O que você fazia / era responsável por...' },
          { key: 'results', label: 'Resultados', type: 'textarea', full: true, placeholder: 'Resultados concretos que você obteve (opcional)' },
        ]}
      />

      {/* Formação */}
      <RepeatableList
        title="Formação acadêmica" icon={GraduationCap}
        items={form.education || []}
        onChange={(v) => update('education', v)}
        addLabel="Adicionar formação"
        fields={[
          { key: 'institution', label: 'Instituição', placeholder: 'Nome da instituição' },
          { key: 'course', label: 'Curso', placeholder: 'Nome do curso' },
          { key: 'degree', label: 'Grau', type: 'select', options: ['', 'Técnico', 'Tecnólogo', 'Bacharelado', 'Licenciatura', 'Especialização', 'MBA', 'Mestrado', 'Doutorado'] },
          { key: 'start_date', label: 'Início', type: 'date' },
          { key: 'end_date', label: 'Conclusão', type: 'date' },
          { key: 'ongoing', label: '', type: 'select', options: [{ value: '', label: 'Selecione' }, { value: 'true', label: 'Em andamento' }] },
        ]}
      />

      {/* Cursos */}
      <RepeatableList
        title="Cursos e certificações" icon={Award}
        items={form.courses || []}
        onChange={(v) => update('courses', v)}
        addLabel="Adicionar curso"
        fields={[
          { key: 'name', label: 'Curso', placeholder: 'Nome do curso' },
          { key: 'institution', label: 'Instituição', placeholder: 'Onde fez' },
          { key: 'year', label: 'Ano', placeholder: 'Ano' },
        ]}
      />

      {/* Idiomas */}
      <RepeatableList
        title="Idiomas" icon={Languages}
        items={form.languages || []}
        onChange={(v) => update('languages', v)}
        addLabel="Adicionar idioma"
        fields={[
          { key: 'language', label: 'Idioma', placeholder: 'Ex.: Inglês' },
          { key: 'level', label: 'Nível', type: 'select', options: LANG_LEVELS },
        ]}
      />

      {/* Competências (tags) */}
      <TagInput
        title="Competências autodeclaradas" icon={Target}
        values={form.competencies || []}
        onChange={(v) => update('competencies', v)}
        placeholder="Ex.: Liderança, Excel, Negociação..."
      />
    </div>
  );
}