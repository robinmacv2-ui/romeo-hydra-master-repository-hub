import React, { useState } from 'react';
import { CardState } from '../types';
import { Sparkles, Send, Bot, User, RefreshCw, AlertCircle } from 'lucide-react';

interface AiAssistantProps {
  cardState: CardState;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({ cardState }) => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: `¡Saludos! Soy el Núcleo Interpretador Cuántico del Códice Chip RRPH (Papel Picado Romeo Hydra), invento concebido por el fundador Luis Angel Vazquez Martinez.
Puedes consultarme para:
- Analizar expresiones complejas de la gramática formal Romeo-Aedra.
- Optimizar el flujo de señal entre tarjetas a través de anclajes T en la red Romeo-Hydra.
- Redactar o afinar reivindicaciones para el registro de Modelo de Utilidad e INDAUTOR a nombre del fundador Luis Angel Vazquez Martinez.`,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    const userText = prompt;
    setPrompt('');
    setError(null);

    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userText,
          currentCardState: cardState,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al comunicarse con el servidor Gemini.');
      }

      setMessages((prev) => [...prev, { role: 'assistant', text: data.text }]);
    } catch (err: any) {
      console.error('Error fetching AI response:', err);
      setError(err.message || 'Ocurrió un error al procesar la solicitud.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-950 text-purple-400 ring-1 ring-purple-800">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h2 className="font-mono text-base font-bold text-slate-100">
              NÚCLEO INTERPRETADOR IA - CÓDICE PPRH
            </h2>
            <p className="text-xs text-slate-400">
              Asistente de consulta cuántica impulsado por Gemini 2.5 Flash para optimización y validación formal.
            </p>
          </div>
        </div>
      </div>

      {/* Chat Conversation Box */}
      <div className="flex flex-col h-[460px] rounded-2xl border border-slate-800 bg-slate-950 p-5">
        <div className="flex-1 space-y-4 overflow-y-auto pr-2">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-3 ${
                msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                  msg.role === 'user' ? 'bg-cyan-600 text-white' : 'bg-purple-950 text-purple-300 border border-purple-800'
                }`}
              >
                {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div
                className={`rounded-2xl px-4 py-3 text-xs leading-relaxed max-w-[85%] ${
                  msg.role === 'user'
                    ? 'bg-cyan-950/80 text-cyan-100 border border-cyan-800/80'
                    : 'bg-slate-900 text-slate-200 border border-slate-800 whitespace-pre-line'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center space-x-2 text-xs font-mono text-purple-400">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Procesando consulta en el Núcleo PPRH...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center space-x-2 rounded-xl bg-rose-950/80 p-3 text-xs font-mono text-rose-300 border border-rose-800">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="mt-4 flex items-center space-x-2 pt-3 border-t border-slate-800">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Escribe una pregunta sobre la tarjeta, gramática Romeo-Aedra o registro IMPI..."
            className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs text-slate-100 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="flex items-center space-x-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-purple-500 disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Enviar</span>
          </button>
        </form>
      </div>
    </div>
  );
};
