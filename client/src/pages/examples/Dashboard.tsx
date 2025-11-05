import Dashboard from '../Dashboard';
import { ThemeProvider } from '../../components/ThemeProvider';
import { Navigation } from '../../components/Navigation';

export default function DashboardExample() {
  return (
    <ThemeProvider>
      <Navigation />
      <Dashboard />
    </ThemeProvider>
  );
}
