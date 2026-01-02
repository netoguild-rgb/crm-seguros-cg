import React from 'react';
// Importa a imagem da logo da pasta assets (caminho relativo ../assets/logo.png)
import logoCrm from '../assets/logo.png';

const Logo = ({ collapsed }) => {
  return (
    <div className="flex items-center justify-center py-4 overflow-hidden w-full">
      <img 
        src={logoCrm} 
        alt="CRM Seguros" 
        // Ajusta o tamanho da logo dependendo do estado da sidebar (collapsed)
        // 'object-contain' garante que a imagem não fique distorcida
        className={`transition-all duration-300 object-contain ${
          collapsed ? 'w-10 h-auto' : 'w-40 h-auto'
        }`} 
      />
    </div>
  );
};

export default Logo;