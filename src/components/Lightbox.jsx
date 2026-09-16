import { useEffect } from 'react';
import './Lightbox.css';

export default function Lightbox({ image, alt, onClose }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!image) return null;

  return (
    <div className="lightbox" onClick={onClose} id="lightbox">
      <button className="lightbox__close" onClick={onClose} aria-label="Close lightbox">✕</button>
      <div className="lightbox__content" onClick={(e) => e.stopPropagation()}>
        <img src={image} alt={alt || 'Gallery image'} className="lightbox__image" />
        {alt && <p className="lightbox__caption">{alt}</p>}
      </div>
    </div>
  );
}
