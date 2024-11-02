import { Metadata } from 'next';
import ClientApp from '../components/ClientApp';
import ErrorBoundary from '../components/ErrorBoundary';
import { AppProvider } from '../context/AppContext';

export const metadata: Metadata = {
  title: 'WebSplat - AI-Powered Web Development',
  description: 'Create websites effortlessly with AI assistance',
};

export default function Home() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <main className="min-h-screen">
          <ClientApp />
        </main>
      </AppProvider>
    </ErrorBoundary>
  );
}
