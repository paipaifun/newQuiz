import React, { useRef, useEffect, useState } from 'react';
import { getCurrentDate } from '../utils';

const DModule: React.FC<{bgStyle: React.CSSProperties, cropContainerRef: React.RefObject<HTMLDivElement>}> = ({bgStyle, cropContainerRef}) => {



  return (
    <div className="w-[100%] h-[100%] absolute top-[50px] left-0 z-10 text-center text-[#000] Roboto text-[22px] leading-[30px] font-semibold" style={{
      fontWeight: 600
    }}>{getCurrentDate()}</div>
  );
};

export default DModule;