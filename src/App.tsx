// @ts-nocheck
import AppRouter from 'AppRouter';
import { ThemeProvider } from 'contexts/themeContext';

function App() {
  return (
    <div className="main-app bg-primary">
      <div className="flex flex-col m-auto">
        <div className="min-h-screen">
          <ThemeProvider>
            <AppRouter />
          </ThemeProvider>
        </div>
      </div>
    </div>
  );
}

export default App;
