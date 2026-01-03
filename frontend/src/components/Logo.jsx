import React from 'react';
import logoCrm from '../assets/logo.png';

const Logo = ({ collapsed }) => {
  return (
    // Container flexível
    <div className="flex items-center justify-center w-full h-full">
      <img 
        src={logoCrm} 
        alt="CRM Seguros" 
        // Lógica de Zoom (Aproximação):
        // - scale-125: Aumenta a imagem em 25% além do tamanho original (efeito de zoom)
        // - object-contain: Garante que ela não distorça
        className={`transition-all duration-300 ease-out object-contain filter drop-shadow-md ${
          collapsed 
            ? 'h-10 w-auto opacity-90'        // Fechado: Pequeno e discreto
            : 'h-full w-auto max-w-[90%] scale-125' // Aberto: Altura total + Zoom de 25% para aproximar
        }`} 
      />
    </div>
  );
};

export default Logo;