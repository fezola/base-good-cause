// BasePay Logo Component - Simple white square with blue square inside
import React from 'react';

interface BasePayLogoProps {
  size?: number;
  className?: string;
}

export function BasePayLogo({ size = 24, className = "" }: BasePayLogoProps) {
  return (
    <div
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: 'white',
        display: 'inline-block',
        position: 'relative'
      }}
    >
      <div
        style={{
          width: `${size * 0.6}px`,
          height: `${size * 0.6}px`,
          backgroundColor: '#0000FF',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      />
    </div>
  );
}
