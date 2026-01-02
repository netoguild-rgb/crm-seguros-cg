import React from 'react';
// Importa a imagem da pasta assets
import logoCrm from '../assets/logo.png';

const Logo = ({ collapsed }) => {
  return (
    // Container flex para centralizar a imagem
    <div className="flex items-center justify-center py-4 w-full overflow-hidden">
      <img 
        src={logoCrm} 
        alt="CRM Seguros" 
        // Lógica de tamanho:
        // Se collapsed (fechado): w-10 (aprox 40px)
        // Se aberto: w-40 (aprox 160px)
        // object-contain garante que a proporção da imagem seja mantida sem cortes
        className={`transition-all duration-300 object-contain ${
          collapsed ? 'w-10' : 'w-40'
        }`} 
      />
    </div>
  );
};

export default Logo;