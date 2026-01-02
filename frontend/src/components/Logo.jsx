import React from 'react';
// Importa a imagem da pasta assets
import logoCrm from '../assets/logo.png';

const Logo = ({ collapsed }) => {
  return (
    <div className="flex items-center justify-center py-2 w-full overflow-hidden">
      <img 
        src={logoCrm} 
        alt="CRM Seguros" 
        // Ajuste de tamanho:
        // collapsed (fechado): w-12 (ícone maiorzinho)
        // aberto: w-[95%] (ocupa 95% da largura da sidebar)
        className={`transition-all duration-300 object-contain ${
          collapsed ? 'w-12' : 'w-[95%]'
        }`} 
      />
    </div>
  );
};

export default Logo;