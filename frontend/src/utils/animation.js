/**
 * Helper to play a responsive "fly to cart" animation from a button clicked to the navbar cart icon.
 * @param {HTMLElement} startElement The element to start the flying animation from (e.g. the clicked button)
 * @param {string} productImage URL of the product image to display inside the flyer
 */
export const playFlyToCartAnimation = (startElement, productImage, onImpact) => {
  const targetElement = document.querySelector('.cart-btn[aria-label="Keranjang"]');
  if (!startElement || !targetElement) return;

  const startRect = startElement.getBoundingClientRect();
  const targetRect = targetElement.getBoundingClientRect();
  const computedWidth = startRect.width;
  const computedHeight = startRect.height;

  // Save original styles for restoration
  const originalTransition = startElement.style.transition;
  const originalWidth = startElement.style.width;
  const originalHeight = startElement.style.height;
  const originalBorderRadius = startElement.style.borderRadius;
  const originalColor = startElement.style.color;
  const originalOverflow = startElement.style.overflow;
  const originalWhiteSpace = startElement.style.whiteSpace;
  const originalBoxSizing = startElement.style.boxSizing;
  const originalPadding = startElement.style.padding;
  const originalMinWidth = startElement.style.minWidth;
  const originalFlex = startElement.style.flex;
  const originalTransform = startElement.style.transform;

  const icon = startElement.querySelector('i');
  let originalIconOpacity = '';
  if (icon) {
    originalIconOpacity = icon.style.opacity || '';
    icon.style.transition = 'opacity 0.2s';
  }

  // Helper to apply properties with !important
  const setImportant = (prop, value) => {
    startElement.style.setProperty(prop, value, 'important');
  };

  // Helper to restore properties
  const restoreProp = (prop, originalVal) => {
    if (originalVal) {
      startElement.style.setProperty(prop, originalVal);
    } else {
      startElement.style.removeProperty(prop);
    }
  };

  // Setup button for width animation
  setImportant('width', computedWidth + 'px');
  setImportant('height', computedHeight + 'px');
  setImportant('box-sizing', 'border-box');
  setImportant('overflow', 'hidden');
  setImportant('white-space', 'nowrap');
  setImportant('flex', 'none');

  // Force a reflow so the initial width is registered
  void startElement.offsetWidth;

  // 1. Shrink button to a circle
  setImportant('transition', 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)');
  setImportant('width', computedHeight + 'px'); // Shrink width to match height
  setImportant('padding', '0');
  setImportant('min-width', '0');
  setImportant('border-radius', '50%');
  setImportant('color', 'transparent');
  const translateX = (computedWidth - computedHeight) / 2;
  setImportant('transform', `translateX(${translateX}px)`);
  if (icon) {
    icon.style.opacity = '0';
  }

  // Wait for button to become a circle before flying the image
  setTimeout(() => {
    // 2. Create and spawn the flying image over the circular button
    const flyer = document.createElement('div');
    flyer.style.position = 'fixed';
    flyer.style.zIndex = '99999';
    flyer.style.width = computedHeight + 'px';
    flyer.style.height = computedHeight + 'px';
    flyer.style.borderRadius = '50%';
    flyer.style.overflow = 'hidden';
    flyer.style.boxShadow = '0 8px 24px rgba(0, 98, 65, 0.25)';
    flyer.style.border = '2px solid var(--secondary, #00754A)';
    flyer.style.pointerEvents = 'none';
    flyer.style.transition = 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)'; // Slower and smoother ease
    flyer.style.opacity = '1';

    if (productImage) {
      const img = document.createElement('img');
      img.src = productImage;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      flyer.appendChild(img);
    } else {
      flyer.innerHTML = `<div style="width:100%;height:100%;background:var(--primary, #006241);display:flex;align-items:center;justify-content:center;color:white;">
        <i class="fas fa-shopping-cart"></i>
      </div>`;
    }

    // Since button width shrank to computedHeight, its new center X is different.
    // However, it usually shrinks towards the center if margin is auto, but for buttons it shrinks left.
    // Let's get the button's NEW bounding client rect after it became a circle
    const newStartRect = startElement.getBoundingClientRect();
    flyer.style.left = `${newStartRect.left}px`;
    flyer.style.top = `${newStartRect.top}px`;
    flyer.style.transform = 'scale(1)';

    document.body.appendChild(flyer);

    // Force reflow for flyer
    void flyer.offsetWidth;

    // 3. Fly to cart
    const targetX = targetRect.left + targetRect.width / 2 - (computedHeight / 2);
    const targetY = targetRect.top + targetRect.height / 2 - (computedHeight / 2);

    flyer.style.left = `${targetX}px`;
    flyer.style.top = `${targetY}px`;
    flyer.style.transform = 'scale(0.3) rotate(360deg)';
    flyer.style.opacity = '0.3';

    // 4. Cleanup and expand button back
    setTimeout(() => {
      flyer.remove();

      // Expand button back
      setImportant('width', computedWidth + 'px');
      restoreProp('border-radius', originalBorderRadius);
      restoreProp('color', originalColor);
      restoreProp('padding', originalPadding);
      if (originalTransform) {
        setImportant('transform', originalTransform);
      } else {
        startElement.style.removeProperty('transform');
      }
      if (icon) {
        icon.style.opacity = originalIconOpacity || '';
      }

      // After expansion finishes, restore original styles completely
      setTimeout(() => {
        restoreProp('width', originalWidth);
        restoreProp('height', originalHeight);
        restoreProp('transition', originalTransition);
        restoreProp('overflow', originalOverflow);
        restoreProp('white-space', originalWhiteSpace);
        restoreProp('box-sizing', originalBoxSizing);
        restoreProp('min-width', originalMinWidth);
        restoreProp('flex', originalFlex);
        restoreProp('transform', originalTransform);
      }, 400);

      // Bouncing/impact effect for the cart button
      targetElement.animate([
        { transform: 'scale(1)' },
        { transform: 'scale(1.35)', color: 'var(--secondary, #00754A)' },
        { transform: 'scale(0.9)' },
        { transform: 'scale(1.1)' },
        { transform: 'scale(1)' }
      ], {
        duration: 400,
        easing: 'ease-out'
      });
      if (onImpact) onImpact();
    }, 1500); // Wait for flyer to finish flying
  }, 400); // Wait for button to shrink
};
