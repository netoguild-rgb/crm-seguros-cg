import React from 'react';
import logoCrm from '../assets/logo.png';

const Logo = ({ collapsed }) => {
  return (
    // Container com padding mínimo para centralização absoluta
    <div className="flex items-center justify-center w-full h-full px-0.5">
      <img 
        src={logoCrm} 
        alt="CRM Seguros" 
        // Aumentado o tamanho e a intensidade da sombra
        className={`transition-all duration-300 ease-out object-contain filter drop-shadow-md ${
          collapsed 
            ? 'h-11 w-auto'            // Fechado: Maior (44px)
            : 'h-[58px] w-auto'        // Aberto: Quase a altura total do header (58px de 64px disponíveis)
        }`} 
      />
    </div>
  );
};

export default Logo;