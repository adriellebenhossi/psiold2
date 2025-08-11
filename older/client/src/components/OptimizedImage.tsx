
import { useState, useRef, useEffect, ImgHTMLAttributes, FC, memo } from 'react';
import { cn } from '@/lib/utils';
import { memoize } from '@/utils/performance';

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  webpSrc?: string;
  priority?: boolean;
}

// Memoizar verificação de WebP
const checkWebPSupport = memoize(() => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, 1, 1);
    const dataURL = canvas.toDataURL('image/webp');
    return dataURL.indexOf('data:image/webp') === 0;
  }
  return false;
});

const OptimizedImageComponent: FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  fallback,
  webpSrc,
  priority = false,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState<string>(webpSrc || src);
  const [imageError, setImageError] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleError = () => {
    if (webpSrc && !imageError) {
      setImageSrc(src);
      setImageError(true);
    } else if (fallback) {
      setImageSrc(fallback);
    }
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };

  // Check WebP support usando cache memoizado
  useEffect(() => {
    if (webpSrc && !checkWebPSupport()) {
      setImageSrc(src);
    }
  }, [src, webpSrc]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={cn(
        'transition-opacity duration-300',
        isLoaded ? 'opacity-100' : 'opacity-0',
        className
      )}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      onError={handleError}
      onLoad={handleLoad}
      {...props}
    />
  );
};

// Memoizar componente para evitar re-renders
export const OptimizedImage = memo(OptimizedImageComponent);
