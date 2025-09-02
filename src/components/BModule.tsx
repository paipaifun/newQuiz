import React from 'react';

const BModule: React.FC<{bgStyle: React.CSSProperties, cropContainerRef: React.RefObject<HTMLDivElement>}> = ({ bgStyle, cropContainerRef}) => {

  return (
    <>
      <div 
        className="w-[200px] h-[200px] absolute left-[50%] translate-x-[-50%] top-[195px] z-10 rounded-full border-2 border-[#fff]"
        ref={cropContainerRef}
        style={bgStyle}
      />
    </>
  );
};

export default BModule;