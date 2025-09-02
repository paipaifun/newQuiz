import React from 'react';

const MModule: React.FC<{text?: string}> = ({text}) => {
  
  return (
    <>
      <div className="w-[200px] h-[52.5px] absolute top-[212.5px] left-[50%] translate-x-[-50%] z-10 text-center text-[#000] Roboto text-[20px] leading-[32px] flex items-center justify-center" style={{
          fontWeight: 700
        }}>{text}</div>
    </>
  );
};

export default MModule;