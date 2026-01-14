import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Memuat environment variables
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    // Bagian ini penting: Kita mendefinisikan process.env.API_KEY agar bisa dibaca di kode frontend
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY || process.env.API_KEY)
    },
    server: {
      port: 5173,
      host: true
    }
  };
});