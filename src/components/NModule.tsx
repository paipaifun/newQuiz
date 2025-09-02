import React from 'react';

const MModule: React.FC<{text1?: string, text2?: string}> = ({text1, text2}) => {

  


  return (
    <>
      <div className="w-[300px] h-[83px] absolute top-[25px] left-[50%] translate-x-[-50%] z-10 text-center text-[#fff] Roboto text-[30x] leading-[34px] flex items-center justify-center" style={{
          fontWeight: 700,
          fontSize: '36px',
          // 字体描边
          textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000',
        }}>{text1}</div>
      <div className="w-[300px] h-[83px] absolute bottom-[40px] left-[50%] translate-x-[-50%] z-10 text-center text-[#fff] Roboto text-[24px] leading-[36px] flex items-center justify-center" style={{
          fontWeight: 700,
          textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000',
        }}>{text2}</div>
    </>
  );
};

export default MModule;