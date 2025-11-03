import {
  Container,
  CssBaseline,
  CssVarsProvider,
  GlobalStyles,
} from "@mui/joy";
import DriverSearchPage from "./page/DriverSearchPage";
import { Route, Routes } from "react-router";
import { BrowserRouter } from "react-router";

const App = () => {
  return (
    <CssVarsProvider>
      <CssBaseline />
      <GlobalStyles
        styles={{
          body: {
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 70%)",
            backgroundAttachment: "fixed",
            minHeight: "100vh",
          },
        }}
      />
      <BrowserRouter>
        <Container
          maxWidth="lg"
          sx={{
            py: 4,
            minHeight: "100vh",
          }}
        >
          <Routes>
            <Route path="/" element={<DriverSearchPage />} />
          </Routes>
        </Container>
      </BrowserRouter>
    </CssVarsProvider>
  );
};

export default App;
