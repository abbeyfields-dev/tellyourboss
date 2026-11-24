import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FeedbackScreen } from './src/screens/FeedbackScreen';
import { TellYourBossScreen } from './src/screens/TellYourBossScreen';

function feedbackToken(): string | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !window.location) return null;
  const match = window.location.pathname.match(/^\/feedback\/([a-f0-9]{64})\/?$/i);
  return match?.[1] ?? null;
}

if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const id = 'boss-o-rater-inter';
  if (!document.getElementById(id)) {
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';
    document.head.appendChild(link);
  }
}

function isTextField(target: EventTarget | null): target is HTMLInputElement | HTMLTextAreaElement {
  return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
}

function revealField(field: HTMLElement): void {
  let node = field.parentElement;
  while (node) {
    const overflow = `${getComputedStyle(node).overflowY} ${getComputedStyle(node).overflow}`;
    if (/(auto|scroll)/.test(overflow) && node.scrollHeight > node.clientHeight + 4) {
      const top = field.getBoundingClientRect().top - node.getBoundingClientRect().top + node.scrollTop - 16;
      node.scrollTop = Math.max(0, top);
      node.scrollLeft = 0;
      return;
    }
    node = node.parentElement;
  }
}

function useVisibleViewport(): void {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const styleId = 'boss-o-rater-viewport';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        html, body, #root {
          height: var(--app-height, 100%) !important;
          max-height: var(--app-height, 100%) !important;
          width: var(--app-width, 100%) !important;
          max-width: var(--app-width, 100%) !important;
          min-height: 0 !important;
          overflow: hidden !important;
        }
        body {
          margin: 0;
          position: fixed;
          left: var(--app-offset-left, 0px);
          top: var(--app-offset, 0px);
        }
        input, textarea {
          outline: none !important;
          -webkit-appearance: none !important;
          appearance: none !important;
          box-shadow: none !important;
          max-width: 100%;
        }
      `;
      document.head.appendChild(style);
    }

    let frame = 0;
    const apply = () => {
      const viewport = window.visualViewport;
      const rawHeight = viewport?.height ?? window.innerHeight;
      const rawWidth = viewport?.width ?? window.innerWidth;
      const offset = viewport?.offsetTop ?? 0;
      const offsetLeft = viewport?.offsetLeft ?? 0;
      const keyboardOpen = window.innerHeight - rawHeight > 80;
      // iOS draws the previous/next bar and password toolbar over the visual viewport.
      const height = Math.max(240, Math.round(rawHeight - (keyboardOpen ? 88 : 0)));
      const width = Math.max(240, Math.round(rawWidth));
      document.documentElement.style.setProperty('--app-height', `${height}px`);
      document.documentElement.style.setProperty('--app-width', `${width}px`);
      document.documentElement.style.setProperty('--app-offset', `${Math.round(offset)}px`);
      document.documentElement.style.setProperty('--app-offset-left', `${Math.round(offsetLeft)}px`);
      const root = document.getElementById('root');
      if (root) {
        root.style.setProperty('height', `${height}px`, 'important');
        root.style.setProperty('max-height', `${height}px`, 'important');
        root.style.setProperty('width', `${width}px`, 'important');
        root.style.setProperty('max-width', `${width}px`, 'important');
      }
      window.scrollTo(0, 0);
      const active = document.activeElement;
      if (keyboardOpen && isTextField(active)) {
        window.cancelAnimationFrame(frame);
        frame = window.requestAnimationFrame(() => revealField(active));
      }
    };
    apply();
    const viewport = window.visualViewport;
    viewport?.addEventListener('resize', apply);
    viewport?.addEventListener('scroll', apply);
    window.addEventListener('resize', apply);
    const onFocus = (event: FocusEvent) => {
      const field = event.target;
      if (!isTextField(field)) return;
      window.setTimeout(() => revealField(field), 60);
      window.setTimeout(apply, 280);
    };
    document.addEventListener('focusin', onFocus);

    return () => {
      viewport?.removeEventListener('resize', apply);
      viewport?.removeEventListener('scroll', apply);
      window.removeEventListener('resize', apply);
      document.removeEventListener('focusin', onFocus);
      window.cancelAnimationFrame(frame);
    };
  }, []);
}

export default function App() {
  useVisibleViewport();
  const [token] = useState(feedbackToken);
  return (
    <SafeAreaProvider>
      {token ? <FeedbackScreen token={token} /> : <TellYourBossScreen />}
    </SafeAreaProvider>
  );
}
