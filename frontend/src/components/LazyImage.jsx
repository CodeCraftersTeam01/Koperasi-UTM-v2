import React, { useState } from 'react';

const LazyImage = ({ src, alt, className = '', style = {}, wrapperStyle = {}, fallbackSrc = '/img/placeholder.jpg', onClick, onError }) => {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        ...wrapperStyle,
      }}
    >
      {!loaded && !errored && (
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
        src={errored ? fallbackSrc : src}
        alt={alt}
        className={className}
        loading="lazy"
        onClick={onClick}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setErrored(true);
          setLoaded(true);
          if (onError) onError();
        }}
        style={{
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.3s',
          display: 'block',
          ...style,
        }}
      />
    </div>
  );
};

export default LazyImage;
