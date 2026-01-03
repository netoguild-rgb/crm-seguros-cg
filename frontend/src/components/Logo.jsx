import React from 'react';
import logoCrm from '../assets/logo.png';

const Logo = ({ collapsed }) => {
  return (
    <div className="flex items-center justify-center w-full h-full p-1">
      <img 
        src={logoCrm} 
        alt="CRM Seguros" 
        className={`transition-all duration-300 ease-out object-contain filter drop-shadow-sm ${
          collapsed 
            ? 'h-10 w-auto max-w-full'        // Fechado: Bem visível (40px)
            : 'h-14 w-auto max-w-[600px]'     // Aberto: Grande, preenchendo o header (56px)
        }`} 
      />
    </div>
  );
};

export default Logo;