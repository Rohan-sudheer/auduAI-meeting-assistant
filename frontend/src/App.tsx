import { BrowserRouter, Route, Routes } from "react-router-dom";

import { MeetingPage } from "./pages/MeetingPage";
import { UploadPage } from "./pages/UploadPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/meetings/:id" element={<MeetingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
