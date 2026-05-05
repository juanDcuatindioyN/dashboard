import { Toaster } from 'sonner';
import { Layout } from './components/Layout';
import { DashboardView } from './components/DashboardView';

function App() {
  return (
    <>
      <Layout>
        <DashboardView />
      </Layout>
      <Toaster position="top-right" theme="dark" richColors />
    </>
  );
}

export default App;
