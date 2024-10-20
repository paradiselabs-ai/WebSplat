import { Metadata } from 'next';
import WebSplatInterface from '../components/WebSplatInterface';
import ErrorBoundary from '../components/ErrorBoundary';

export const metadata: Metadata = {
  title: 'WebSplat - AI-Powered Web Development',
  description: 'Create websites effortlessly with AI assistance',
};

export default function Home() {
  return (
    <ErrorBoundary>
      <WebSplatInterface />
    </ErrorBoundary>
  );
}
