import React from 'react';
import { Trash2, Copy, ArrowUp, ArrowDown, Pencil } from 'lucide-react';

// Pré-visualização de uma questão aberta (sem alternativas).
export default function OpenQuestionPreview({ situation, index, onEdit, onDuplicate, onMoveUp, onMoveDown, onRemove, canMoveUp, canMoveDown }) {
  return (
    <div className="rounded-xl border border-violet/30 bg-violet/5 p-5">
      <div className="flex items-start gap-3">
        <span className="text-xs font-mono font-semibold text-violet mt-0.5">Q{String(index + 1).padStart(2, '0')}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="text-sm font-semibold text-foreground">{situation.title}</span>
            <span className="px-2 py-0.5 rounded-md bg-violet/10 border border-violet/20 text-[10px] text-violet font-medium">Questão aberta</span>
          </div>
          {situation.context && <p className="text-sm text-foreground/75 leading-relaxed">{situation.context}</p>}
          <p className="text-sm font-medium text-foreground mt-2">{situation.question}</p>
          {situation.justification_prompt && (
            <p className="text-xs text-muted-foreground/70 mt-2 italic">{situation.justification_prompt}</p>
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