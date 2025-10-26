import { Container, CssBaseline, CssVarsProvider } from "@mui/joy";
import DriverSearchPage from "./page/DriverSearchPage";
import { Route, Routes } from "react-router";
import { BrowserRouter } from "react-router";

const App = () => {
  return (
    <CssVarsProvider>
      <CssBaseline />
      <BrowserRouter>
        <Container maxWidth="lg" sx={{ py: 4, minHeight: "100vh" }}>
          <Routes>
            <Route path="/" element={<DriverSearchPage />} />
          </Routes>
        </Container>
      </BrowserRouter>
    </CssVarsProvider>
  );
};

export default App;
