import { Suspense } from "react";
import AppRouter from "./core/router/AppRouter";
import { ThemeProvider } from "./core/providers/ThemeProvider";
import { ToastContainer } from "react-toastify";
import { Toaster } from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Cargando...</p>
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ThemeProvider>
        <AppRouter />

        <Toaster position="bottom-right" />
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          theme="colored"
        />
      </ThemeProvider>
    </Suspense>
  );
}

export default App;
