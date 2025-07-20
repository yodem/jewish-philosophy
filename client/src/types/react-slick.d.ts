declare module 'react-slick' {
  import * as React from 'react';

  export interface Settings {
    dots?: boolean;
    infinite?: boolean;
    speed?: number;
    slidesToShow?: number;
    slidesToScroll?: number;
    rtl?: boolean;
    arrows?: boolean;
    autoplay?: boolean;
    autoplaySpeed?: number;
    centerMode?: boolean;
    centerPadding?: string;
    cssEase?: string;
    draggable?: boolean;
    fade?: boolean;
    focusOnSelect?: boolean;
    pauseOnHover?: boolean;
    responsive?: Array<{
      breakpoint: number;
      settings: Settings;
    }>;
    [key: string]: any;
  }

  interface SliderProps {
    settings?: Settings;
    className?: string;
    [key: string]: any;
  }

  const Slider: React.FC<SliderProps>;
  export default Slider;
} 