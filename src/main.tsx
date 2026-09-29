import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { DndProvider } from 'react-dnd';
import { TouchBackend } from 'react-dnd-touch-backend';
import { store } from './store';
import App from './App';
import './index.scss';
import { ItemNotificationsProvider } from './components/utils/ItemNotifications';
import { isEnvBrowser } from './utils/misc';
// All In City: design tokens (bundled fallback copy of theme_ui_skin/skin/tokens.css), fonts, inventory styles
import './dt/tokens.css';
import './dt/fonts.css';
import './dt/inventory.css';

const root = document.getElementById('root');

if (isEnvBrowser()) {
  // All In City: browser dev mode draws a local night gradient (upstream loaded a remote imgur picture)
  document.body.classList.add('dt-dev-backdrop');
} else {
  // Theme skin: load the theme-owned tokens AFTER the bundled fallback so they override it (same as dt_ui main.tsx).
  // https://cfx-nui-<resource>/ is the cross-resource form (docs/reference/DocsFiveM/PROJECT-IMPLICATIONS.md 9.1).
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://cfx-nui-theme_ui_skin/skin/tokens.css';
  link.onerror = () => console.warn('ox_inventory: theme_ui_skin tokens not available, using the bundled fallback');
  document.head.appendChild(link);
}

createRoot(root!).render(
  <React.StrictMode>
    <Provider store={store}>
      <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
        <ItemNotificationsProvider>
          <App />
        </ItemNotificationsProvider>
      </DndProvider>
    </Provider>
  </React.StrictMode>
);
