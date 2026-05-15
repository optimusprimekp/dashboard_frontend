import Routes from "./routes/Routes";
import "./assets/style/global.css";
import "./assets/style/global.responsive.css";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Toaster } from "react-hot-toast";
import ErrorBoundary from "./component/common/errorBoundary/ErrorBoundary";

const theme = createTheme({
  typography: {
    allVariants: {
      fontFamily: "Poppins, sans-serif",
      fontWeight: "400",
      lineHeight: "normal",
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <div className="App">
          <Toaster
            reverseOrder={false}
            toastOptions={{
              duration: 3000,
              style: {
                maxWidth: "unset",
                color: "black",
                fontWeight: 700,
              },
            }}
          />
          <Routes />
        </div>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
