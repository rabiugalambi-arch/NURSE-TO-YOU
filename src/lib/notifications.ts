// Track notified booking statuses to prevent duplicates
const notifiedEvents = new Set<string>();

// Track permission state locally to avoid repeatedly asking
let hasAskedForPermission = false;

export function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notifications');
    return;
  }
  
  if (Notification.permission === 'granted') {
    return;
  }
  
  if (Notification.permission !== 'denied' && !hasAskedForPermission) {
    hasAskedForPermission = true;
    Notification.requestPermission().then((permission) => {
      console.log('Notification permission:', permission);
    });
  }
}

export function triggerNotification(
  eventId: string,
  title: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'new-booking' = 'info',
  onClickCallback?: () => void
) {
  if (notifiedEvents.has(eventId)) return;
  notifiedEvents.add(eventId);

  // 1. Play Sound (Oscillator chime)
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    // Only attempt if audio context is allowed to start, though user interaction unlocks it.
    
    const playChime = (freq: number, startTime: number, duration: number, type: 'sine'|'square'|'triangle' = 'sine') => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(freq, startTime);
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    const now = audioContext.currentTime;
    if (type === 'new-booking') {
      // Clear, attention-grabbing sound
      playChime(440, now, 0.2, 'triangle'); // A4
      playChime(554.37, now + 0.15, 0.2, 'triangle'); // C#5
      playChime(659.25, now + 0.3, 0.4, 'triangle'); // E5
    } else if (type === 'success' || type === 'info') {
      playChime(523.25, now, 0.3); // C5
      playChime(659.25, now + 0.15, 0.4); // E5
    } else {
      playChime(349.23, now, 0.3); // F4
      playChime(329.63, now + 0.2, 0.4); // E4
    }
  } catch (err) {
    console.warn("Audio notification failed. This is often due to browser autoplay policies requiring prior user interaction.", err);
  }

  // 2. Vibrate
  try {
    if (navigator.vibrate) {
      if (type === 'new-booking') {
        navigator.vibrate([500, 250, 500, 250, 700]); // Strong vibration pattern
      } else if (type === 'success') {
        navigator.vibrate([100, 50, 100]); // double buzz
      } else {
        navigator.vibrate([200]); // single buzz
      }
    }
  } catch (err) {
    console.warn("Vibration failed.", err);
  }

  // 3. Browser Notification (if backgrounded)
  try {
    if ('Notification' in window && Notification.permission === 'granted' && document.visibilityState !== 'visible') {
      const browserNotification = new Notification(title, {
        body: message,
        icon: '/vite.svg', // Placeholder icon
      });
      if (onClickCallback) {
         browserNotification.onclick = () => {
             window.focus();
             onClickCallback();
             browserNotification.close();
         };
      }
    }
  } catch(err) {
     console.warn("Browser notification failed", err);
  }

  // 4. Visual DOM Notification (Toast)
  // Always show the toast, even if tab is visible, so they see it in-app.
  showToast(title, message, type, onClickCallback);
}

function showToast(title: string, message: string, type: string, onClickCallback?: () => void) {
  const containerId = 'global-toast-container';
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    container.style.position = 'fixed';
    container.style.top = '20px';
    container.style.right = '20px';
    container.style.left = '20px'; // allow spanning on mobile
    container.style.zIndex = '9999';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '10px';
    container.style.pointerEvents = 'none'; // let clicks pass through the container
    document.body.appendChild(container);
  }
  
  // Apply mobile-first styling to container
  if (window.innerWidth > 640) {
      container.style.left = 'auto';
  }

  const toast = document.createElement('div');
  toast.style.pointerEvents = 'auto'; // Re-enable clicks for the toast itself
  
  const isUrgent = type === 'new-booking';
  const bgColor = isUrgent ? '#1e3a8a' : (type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#3b82f6');
  toast.style.backgroundColor = bgColor;
  toast.style.color = 'white';
  toast.style.padding = '16px';
  toast.style.borderRadius = '12px';
  toast.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
  
  if (window.innerWidth > 640) {
      toast.style.minWidth = '300px';
      toast.style.maxWidth = '400px';
  } else {
      toast.style.width = '100%';
  }
  
  toast.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  toast.style.transition = 'opacity 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
  toast.style.transform = 'translateY(-30px) scale(0.95)';
  toast.style.opacity = '0';
  
  if (isUrgent) {
      toast.style.border = '2px solid #60a5fa';
  }

  let formattedMessage = message.replace(/\n/g, '<br/>');
  
  toast.innerHTML = `
    <div style="display: flex; align-items: flex-start; gap: 12px;">
      ${isUrgent ? '<div style="font-size: 24px;">🔔</div>' : ''}
      <div style="flex: 1;">
        <div style="font-weight: 800; margin-bottom: 6px; font-size: 15px; letter-spacing: 0.5px;">
          ${isUrgent ? title.toUpperCase() : title}
        </div>
        <div style="font-size: 14px; opacity: 0.95; line-height: 1.4;">${formattedMessage}</div>
        ${onClickCallback && isUrgent ? '<button id="toast-action-btn" style="margin-top: 10px; background: white; color: #1e3a8a; border: none; padding: 6px 12px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 12px;">View Booking</button>' : ''}
      </div>
      <button id="toast-close-btn" style="background: transparent; border: none; color: white; opacity: 0.7; cursor: pointer; font-size: 18px; line-height: 1; padding: 0;">&times;</button>
    </div>
  `;

  container.appendChild(toast);
  
  const closeBtn = toast.querySelector('#toast-close-btn');
  if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          dismissToast();
      });
  }
  
  const actionBtn = toast.querySelector('#toast-action-btn');
  if (actionBtn && onClickCallback) {
      actionBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          onClickCallback();
          dismissToast();
      });
  }

  // Trigger animation
  requestAnimationFrame(() => {
    toast.style.transform = 'translateY(0) scale(1)';
    toast.style.opacity = '1';
  });

  const dismissToast = () => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-20px) scale(0.95)';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 400);
  };

  // Remove after 8 seconds (longer for urgent)
  setTimeout(() => {
      if (toast.parentNode) {
         dismissToast();
      }
  }, isUrgent ? 8000 : 5000);
}
