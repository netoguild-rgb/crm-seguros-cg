import React, { useState } from 'react';
import { X, Send, Image as ImageIcon, CheckCircle, Loader2 } from 'lucide-react';

const WhatsAppModal = ({ leads, onClose }) => {
  const [step, setStep] = useState('compose'); // compose, sending, finished
  const [message, setMessage] = useState('Olá! Temos uma condição especial para o seu seguro auto.');
  const [hasImage, setHasImage] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSend = async () => {
    setStep('sending');
    
    // Simulação de envio um por um
    for (let i = 0; i <= leads.length; i++) {
      setProgress(Math.round((i / leads.length) * 100));
      await new Promise(r => setTimeout(r, 800)); // Espera 800ms por lead (simulação)
    }
    
    setStep('finished');
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
        
        {/* Cabeçalho */}
        <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <div className="bg-green-500 p-1.5 rounded-lg"><Send size={18} className="text-white"/></div>
            <div>
              <h3 className="font-bold">Disparo em Massa</h3>
              <p className="text-xs text-slate-400">{leads.length} leads selecionados</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition"><X size={20}/></button>
        </div>

        {/* Corpo */}
        <div className="p-6 bg-slate-50 flex-1 overflow-y-auto">
          
          {step === 'compose' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Mensagem</label>
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full h-32 p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-green-500 outline-none text-sm resize-none"
                  placeholder="Escreva sua mensagem aqui..."
                ></textarea>
                <p className="text-xs text-slate-400 mt-1">Dica: Use *texto* para negrito.</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Anexar Mídia (Imagem/PDF)</label>
                <div 
                  onClick={() => setHasImage(!hasImage)}
                  className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition
                  ${hasImage ? 'border-green-500 bg-green-50' : 'border-slate-300 hover:border-green-400 hover:bg-slate-100'}`}
                >
                  <ImageIcon size={24} className={hasImage ? 'text-green-600' : 'text-slate-400'}/>
                  <span className={`text-sm font-medium mt-2 ${hasImage ? 'text-green-700' : 'text-slate-500'}`}>
                    {hasImage ? 'Imagem "Promoção.png" Anexada' : 'Clique para adicionar imagem'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {step === 'sending' && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 size={48} className="text-green-600 animate-spin mb-4"/>
              <h3 className="text-lg font-bold text-slate-800">Enviando Mensagens...</h3>
              <p className="text-slate-500 text-sm mb-6">Não feche esta janela.</p>
              
              <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-green-500 h-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="mt-2 font-bold text-green-700">{progress}%</span>
            </div>
          )}

          {step === 'finished' && (
            <div className="flex flex-col items-center justify-center py-6 animate-fade-in">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Sucesso!</h3>
              <p className="text-slate-500 text-center max-w-xs mt-2">
                O disparo foi finalizado. As mensagens foram enviadas para {leads.length} contatos.
              </p>
            </div>
          )}

        </div>

        {/* Rodapé */}
        {step !== 'sending' && (
          <div className="p-4 bg-white border-t border-slate-200 flex justify-end gap-3">
            {step === 'finished' ? (
              <button onClick={onClose} className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition">
                Fechar
              </button>
            ) : (
              <>
                <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition">
                  Cancelar
                </button>
                <button onClick={handleSend} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-lg shadow-green-200 font-bold flex items-center gap-2 transition transform active:scale-95">
                  <Send size={18}/> Disparar Agora
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppModal;