import React from 'react';
import logoCrm from '../assets/logo.png';

const Logo = ({ collapsed }) => {
  return (
    <div className="w-full h-full flex items-center justify-center relative">
      {/* Container com efeito shimmer elegante */}
      <div
        className={`
          relative flex items-center justify-center
          bg-white
          transition-all duration-500 ease-out
          rounded-full
          cursor-pointer
          hover:scale-105
          ${collapsed
            ? 'w-14 h-14 p-1'
            : 'w-32 h-32 p-2'
          }
        `}
        style={{
          boxShadow: '0 4px 20px rgba(42, 171, 228, 0.25), 0 2px 8px rgba(0,0,0,0.1)',
          border: '3px solid rgba(42, 171, 228, 0.4)',
          zIndex: 50
        }}
      >
        {/* Shimmer effect - brilho que passa */}
        <div
          className="absolute inset-0 rounded-full overflow-hidden"
          style={{ zIndex: 1 }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.6) 50%, transparent 70%)',
              animation: 'shimmer 3s ease-in-out infinite',
              transform: 'translateX(-100%)'
            }}
          />
        </div>

        {/* Logo */}
        <img
          src={logoCrm}
          alt="CRM Seguros"
          className="transition-all duration-300 ease-out object-contain h-full w-full scale-125 relative z-10"
        />
      </div>

      {/* CSS para animações */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default Logo;