import { Metadata } from 'next';
import WebSplatInterface from '../components/WebSplatInterface';
import ErrorBoundary from '../components/ErrorBoundary'; // You'd need to create this component

export const metadata: Metadata = {
  title: 'WebSplat - AI-Powered Web Development',
  description: 'Create websites effortlessly with AI assistance',
};

export default function Home() {
  return (
    <ErrorBoundary>
      <main className="min-h-screen">
        <WebSplatInterface />
      </main>
    </ErrorBoundary>
  );
}

// If you need server-side data fetching, you can add it like this:
// export async function getServerSideProps(context) {
//   // Fetch data
//   return {
//     props: {}, // will be passed to the page component as props
//   }
// }
