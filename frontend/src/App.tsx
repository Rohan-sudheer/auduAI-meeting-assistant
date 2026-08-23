import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Layout } from "./components/Layout";
import { MeetingPage } from "./pages/MeetingPage";
import { UploadPage } from "./pages/UploadPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<UploadPage />} />
          <Route path="/meetings/:id" element={<MeetingPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
