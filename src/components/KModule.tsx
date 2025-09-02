import React from 'react';

const KModule: React.FC<{bgStyle: React.CSSProperties, cropContainerRef: React.RefObject<HTMLDivElement>, name?: string, text?: string}> = ({bgStyle, cropContainerRef, name, text}) => {
 
  return (
    <>    
      <div 
        className="w-[90px] h-[90px] absolute left-[50%] translate-x-[-50%] top-[170.5px] z-10 rounded-full border-2 border-[#fff]"
        ref={cropContainerRef}
        style={bgStyle}
      />
      <div className="w-[100%] h-[30px] absolute top-[275px] left-0 z-10 text-center text-[#000] Roboto text-[16x] leading-[26px] " style={{
        fontWeight: 700
      }}>{text}</div>
    </>
  );
};

export default KModule;