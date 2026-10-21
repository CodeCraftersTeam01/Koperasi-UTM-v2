import React, { useState, useEffect, useRef } from 'react';
import { PLACEHOLDER_IMG } from '../utils/api';

const LazyImage = ({
  src,
  alt,
  className = '',
  style = {},
  wrapperStyle = {},
  fallbackSrc = PLACEHOLDER_IMG,
  onClick,
  onError,
  loading = 'lazy',
  priority = false,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [triedSystemFallback, setTriedSystemFallback] = useState(false);
  const [errored, setErrored] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    setCurrentSrc(src);
    setTriedSystemFallback(false);
    setErrored(false);

    // Jika gambar sudah selesai di-load di memori cache browser, langsung tampilkan tanpa jeda skeleton
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true);
    } else {
      setLoaded(false);
    }
  }, [src]);

  const handleImageError = () => {
    // Jika path /upload/... gagal dimuat di hosting, coba otomatis fallback ke /system/upload/...
    if (!triedSystemFallback && typeof currentSrc === 'string' && currentSrc.includes('/upload/') && !currentSrc.includes('/system/upload/')) {
      setTriedSystemFallback(true);
      setCurrentSrc(currentSrc.replace('/upload/', '/system/upload/'));
      return;
    }

    setErrored(true);
    setLoaded(true);
    if (onError) onError();
  };

  const handleImageLoad = () => {
    setLoaded(true);
  };

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        ...wrapperStyle,
      }}
    >
      {!loaded && !errored && !priority && (
        <div
          className="skeleton"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            borderRadius: 'inherit',
          }}
        />
      )}
      <img
        ref={imgRef}
        src={errored ? fallbackSrc : currentSrc}
        alt={alt}
        className={className}
        loading={priority ? 'eager' : loading}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        onClick={onClick}
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{
          opacity: loaded || priority ? 1 : 0,
          transition: priority ? 'none' : 'opacity 0.2s ease-out',
          display: 'block',
          ...style,
        }}
      />
    </div>
  );
};

export default LazyImage;
