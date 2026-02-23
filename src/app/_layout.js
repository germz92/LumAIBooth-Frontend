import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import * as Font from 'expo-font';
import { colors } from './globalStyles';

export default function RootLayout() {
  // Load fonts once at the root level
  useEffect(() => {
    async function loadFonts() {
      if (Platform.OS === 'web') {
        // On web, inject @font-face rules pointing to the static public/fonts/ directory.
        // This avoids Metro-hashed font filenames that can 404 on static hosting.
        const fontFaces = [
          { family: 'kanit-light', file: '/fonts/Kanit-Light.ttf' },
          { family: 'kanit-regular', file: '/fonts/Kanit-Regular.ttf' },
          { family: 'kanit-bold', file: '/fonts/Kanit-Bold.ttf' },
        ];
        const css = fontFaces
          .map(
            (f) =>
              `@font-face { font-family: '${f.family}'; src: url('${f.file}') format('truetype'); }`
          )
          .join('\n');
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
      } else {
        // On native, load fonts via expo-font as usual
        await Font.loadAsync({
          'kanit-light': require('../../assets/fonts/Kanit-Light.ttf'),
          'kanit-regular': require('../../assets/fonts/Kanit-Regular.ttf'),
          'kanit-bold': require('../../assets/fonts/Kanit-Bold.ttf'),
        });
      }
    }
    loadFonts();
  }, []);

  // PWA setup — only runs on web
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;

    // --- Manifest ---
    if (!document.querySelector('link[rel="manifest"]')) {
      const link = document.createElement('link');
      link.rel = 'manifest';
      link.href = '/manifest.json';
      document.head.appendChild(link);
    }

    // --- Theme color ---
    if (!document.querySelector('meta[name="theme-color"]')) {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = '#870000';
      document.head.appendChild(meta);
    }

    // --- PWA meta tags ---
    const pwaMeta = [
      { name: 'mobile-web-app-capable', content: 'yes' },           // Standard (Chrome/Android)
      { name: 'apple-mobile-web-app-capable', content: 'yes' },     // iOS Safari
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      { name: 'apple-mobile-web-app-title', content: 'AI Photo Booth' },
    ];

    pwaMeta.forEach(({ name, content }) => {
      if (!document.querySelector(`meta[name="${name}"]`)) {
        const meta = document.createElement('meta');
        meta.name = name;
        meta.content = content;
        document.head.appendChild(meta);
      }
    });

    // --- Apple touch icon ---
    if (!document.querySelector('link[rel="apple-touch-icon"]')) {
      const link = document.createElement('link');
      link.rel = 'apple-touch-icon';
      link.href = '/icon-192.png';
      document.head.appendChild(link);
    }

    // --- Viewport (prevent zoom for app-like feel on iPad) ---
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.content =
        'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover';
    }

    // --- Register Service Worker ---
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => console.log('Service Worker registered:', reg.scope))
          .catch((err) => console.error('SW registration failed:', err));
      });
    }
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.gray[300] },
        animation: 'fade',
      }}
    />
  );
}
