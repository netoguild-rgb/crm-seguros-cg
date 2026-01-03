import React from 'react';
// Importa a imagem da pasta assets
import logoCrm from '../assets/logo.png';

const Logo = ({ collapsed }) => {
  return (
    // Removi padding vertical e overflow para a imagem poder "sair" um pouco se necessário
    <div className="flex items-center justify-center w-full">
      <img 
        src={logoCrm} 
        alt="CRM Seguros" 
        // Configuração "Maximizada":
        // collapsed: w-14 (ícone grande quando fechado)
        // aberto: w-full + scale-125 (ocupa 100% da largura e dá um zoom de 25% extra)
        className={`transition-all duration-300 object-contain filter drop-shadow-sm ${
          collapsed ? 'w-14' : 'w-full scale-100'
        }`} 
      />
    </div>
  );
};

export default Logo;