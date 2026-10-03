import React from 'react';
import { CheckCircle2, Loader2, Circle, RefreshCw } from 'lucide-react';
import Background from '@/components/Background';

const STEPS = ['Concluindo a análise de cada resposta', 'Calculando o Skill Score', 'Gerando o perfil comportamental', 'Salvando seu relatório'];

export default function FinishingScreen({ step, error, onRetry }) {
  return (
    <div className="min-h-screen relative flex items-center justify-center px-6">
      <Background />
      <div className="relative w-full max-w-sm">
        <h2 className="font-display text-2xl font-bold text-center">{error ? 'Não conseguimos concluir agora' : 'Finalizando sua avaliação'}</h2>
        <p className="text-sm text-muted-foreground text-center mt-2 mb-8">
          {error ? 'Suas respostas estão salvas. Tente novamente em instantes.' : 'Isso leva menos de um minuto. Não feche esta página.'}
        </p>
        {error ? (
          <button onClick={onRetry} className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90">
            <RefreshCw className="w-4 h-4" /> Tentar novamente
          </button>
        ) : (
          <ul className="space-y-3.5">
            {STEPS.map((label, i) => (
              <li key={label} className={`flex items-center gap-3 text-sm ${i <= step ? 'text-foreground' : 'text-muted-foreground/60'}`}>
                {i < step ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : i === step ? <Loader2 className="w-4 h-4 text-primary animate-spin" /> : <Circle className="w-4 h-4" />}
                {label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}