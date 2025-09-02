import React, { useRef, useEffect, useState } from 'react';
import html2canvas from 'html2canvas';
import LEFT from '../assets/img/left.png';

const Test: React.FC = () => {
  const a = 'https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=122133112082682934&gaming_photo_type=unified_picture&ext=1751536448&hash=AT91HtnKaQ-ve-wc3uxexdcK'
  const testRef = useRef<HTMLDivElement>(null);
  const cropContainerRef = useRef<HTMLDivElement>(null);
  const [bgStyle, setBgStyle] = useState<React.CSSProperties>({});
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });
  const [imgSrc, setImgSrc] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);

  // 预加载图片并计算背景样式
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      console.log('原始图片尺寸:', img.width, 'x', img.height);
      setImgDimensions({ width: img.width, height: img.height });
      
      const containerWidth = 187.5;
      const containerHeight = 350;
      
      // 检查原图尺寸
      if (img.width === 0 || img.height === 0) {
        console.error('图片尺寸获取失败');
        return;
      }
      
      const imgRatio = img.width / img.height;
      const containerRatio = containerWidth / containerHeight;
      
      console.log('图片比例:', imgRatio, '容器比例:', containerRatio);
      
      // 计算背景尺寸和位置
      let bgSize, bgPosition;
      
      if (imgRatio > containerRatio) {
        // 图片较宽，使用100% auto
        bgSize = 'auto 100%';
        bgPosition = 'center center';
      } else {
        // 图片较高，使用100% auto
        bgSize = '100% auto';
        bgPosition = 'center center';
      }
      
      console.log('背景样式:', bgSize, bgPosition);
      
      setBgStyle({
        backgroundImage: `url(${a})`,
        backgroundSize: bgSize,
        backgroundPosition: bgPosition,
        backgroundRepeat: 'no-repeat'
      });
      
      // 标记背景图片已加载
      setBackgroundLoaded(true);
    };
    
    img.onerror = (err) => {
      console.error('图片加载失败:', err);
    };
    
    img.src = a;
  }, [a]);

  // 处理背景图片加载完成
  const handleBackgroundImageLoad = () => {
    console.log('背景图片已加载完成');
    setBackgroundLoaded(true);
  };

  // 处理前景图片加载完成
  const handleImageLoad = () => {
    console.log('前景图片已加载完成');
    setImageLoaded(true);
  };

  // 当所有图片都加载完成时执行截图
  useEffect(() => {
    if (backgroundLoaded && imageLoaded) {
      console.log('所有图片已加载完成，可以进行截图');
    }
  }, [backgroundLoaded, imageLoaded]);

  const handleCapture = async () => {
    if (!testRef.current) return;
    
    // 确保所有图片已加载
    if (!backgroundLoaded || !imageLoaded) {
      console.log('图片尚未完全加载，请等待...');
      return;
    }
    
    try {
      // 添加短暂延迟确保渲染完全
      console.log('准备开始截图...');
      
      // 截取整个testRef元素
      const canvas = await html2canvas(testRef.current, {
        useCORS: true,
        scale: 2,
        logging: true,
        backgroundColor: null,
        onclone: (document) => {
          console.log('DOM已克隆，准备截图');
        }
      });
      
      console.log('截图完成，准备导出');
      
      // 输出图片
      const image = canvas.toDataURL('image/png');
      setImgSrc(image);
      const link = document.createElement('a');
      link.href = image;
      link.download = new Date().getTime() + '.png';
      link.click();
    } catch (error) {
      console.error('截图失败:', error);
      alert('截图失败，请检查控制台获取详情');
    }
  };

  return (
    <div className="w-[100vw] h-[100vh] overflow-auto">
      <div className="w-[375px] h-[470px] relative" id='test' ref={testRef}>
        <div 
          className="w-[187.5px] h-[350px] absolute left-[0px] bottom-[0px] z-10"
          ref={cropContainerRef}
          style={bgStyle}
          onLoad={handleBackgroundImageLoad}
        />
        <img 
          src='https://quiz-res.sfo3.digitaloceanspaces.com/female_test_love4_3.png' 
          alt="Left Arrow" 
          className="w-[375px] h-[470px]" 
          onLoad={handleImageLoad}
        />
      </div>
      {/* 显示图片信息 */}
      <div className="text-xs text-gray-500 mt-2 text-center">
        原始尺寸: {imgDimensions.width} x {imgDimensions.height} | 截图尺寸: 375px × 470px
      </div>
      <div 
        className="w-[80px] h-[36px] relative bg-[purple] rounded-lg text-[#fff] text-center leading-[36px] mx-auto mt-[20px] cursor-pointer hover:bg-[#800080]"
        onClick={handleCapture}
      >
        生成截图
      </div>
      {imgSrc && <>截图如下</>}
      {imgSrc && <img src={imgSrc} alt="截图" className="w-[100vw]" />}
    </div>
  );
};

export default Test;
