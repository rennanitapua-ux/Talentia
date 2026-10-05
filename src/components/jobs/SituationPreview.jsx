import React from 'react';
import { Trash2, Copy, ArrowUp, ArrowDown, Pencil } from 'lucide-react';
import { QUALITY_META } from '@/lib/situations';

// Pré-visualização de uma pergunta estruturada (múltipla escolha).
export default function SituationPreview({ situation, index, onEdit, onDuplicate, onMoveUp, onMoveDown, onRemove, canMoveUp, canMoveDown }) {
  return (
    <div className="rounded-xl border border-border bg-card/40 p-5">
      <div className="flex items-start gap-3">
        <span className="text-xs font-mono font-semibold text-primary mt-0.5">S{String(index + 1).padStart(2, '0')}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="text-sm font-semibold text-foreground">{situation.title}</span>
            <span className="px-2 py-0.5 rounded-md bg-muted text-[10px] text-muted-foreground">Múltipla escolha</span>
            {(situation.competencies || []).map((c) => (
              <span key={c} className="px-2 py-0.5 rounded-md bg-muted text-[10px] text-muted-foreground">{c}</span>
            ))}
          </div>
          {situation.character?.name && (
            <div className="text-xs text-muted-foreground mb-1">{situation.character.name} · {situation.character.role}</div>
          )}
          {situation.context && <p className="text-sm text-foreground/75 leading-relaxed">{situation.context}</p>}
          <p className="text-sm font-medium text-foreground mt-2">{situation.question}</p>
          {(situation.options || []).length > 0 && (
            <div className="mt-3 space-y-1.5">
              {situation.options.map((o) => (
                <div key={o.id} className="flex items-start gap-2 text-xs">
                  <span className="font-mono text-muted-foreground mt-0.5">{o.id.toUpperCase()}</span>
                  <span className="flex-1 text-foreground/75 leading-relaxed">{o.text}</span>
                  <span className={`flex-shrink-0 px-1.5 py-0.5 rounded border text-[10px] ${QUALITY_META[o.quality]?.cls || ''}`}>
                    {QUALITY_META[o.quality]?.label || o.quality}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1 flex-shrink-0">
          {onMoveUp && <button onClick={onMoveUp} disabled={!canMoveUp} title="Mover para cima" className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>}
          {onMoveDown && <button onClick={onMoveDown} disabled={!canMoveDown} title="Mover para baixo" className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>}
          {onEdit && <button onClick={onEdit} title="Editar" className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-colors"><Pencil className="w-4 h-4" /></button>}
          {onDuplicate && <button onClick={onDuplicate} title="Duplicar" className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><Copy className="w-4 h-4" /></button>}
          {onRemove && <button onClick={onRemove} title="Remover" className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors"><Trash2 className="w-4 h-4" /></button>}
        </div>
      </div>
    </div>
  );
}