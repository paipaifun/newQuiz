import React from 'react';

const AModule: React.FC<{bgStyle: React.CSSProperties, cropContainerRef: React.RefObject<HTMLDivElement>}> = ({ bgStyle, cropContainerRef}) => {
  
  return (
    <div 
      className="w-[187.5px] h-[350px] absolute left-[0px] bottom-[0px] z-10"
      ref={cropContainerRef}
      style={bgStyle}
    />
  );
};

export default AModule;