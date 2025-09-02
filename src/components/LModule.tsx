import React from 'react';

const LModule: React.FC<{bgStyle: React.CSSProperties, cropContainerRef: React.RefObject<HTMLDivElement>, name?: string, text?: string}> = ({bgStyle, cropContainerRef, name, text}) => {
  
  return (
    <>
      <div 
        className="w-[187.5px] h-[350px] absolute left-[0px] bottom-[0px] z-10"
        ref={cropContainerRef}
        style={bgStyle}
      />
      <div className="w-[335px] h-[90px] absolute top-[15px] left-[50%] translate-x-[-50%] z-10 text-center text-[#000] Roboto text-[30px] leading-[45px] flex items-center justify-center" style={{
          fontWeight: 700
        }}>{text}</div>
    </>
  );
};

export default LModule;