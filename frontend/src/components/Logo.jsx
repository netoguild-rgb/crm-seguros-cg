import React from 'react';
import logoCrm from '../assets/logo.png';

const Logo = ({ collapsed }) => {
  return (
    <div className={`flex items-center justify-center w-full h-full transition-all duration-300 ${collapsed ? 'px-0' : 'px-2'}`}>
      <img 
        src={logoCrm} 
        alt="CRM Seguros" 
        className={`transition-all duration-500 ease-in-out object-contain filter drop-shadow-sm ${
          collapsed 
            ? 'h-8 w-auto max-w-full opacity-90'  // Fechado: Altura fixa pequena, largura automática
            : 'h-9 w-auto max-w-[160px]'         // Aberto: Altura controlada, limita largura para não estourar
        }`} 
      />
    </div>
  );
};

export default Logo;