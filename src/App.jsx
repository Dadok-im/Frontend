import { BrowserRouter, Routes, Route } from "react-router-dom";

import JoinPage from "./pages/user/JoinPage";
import LoginPage from "./pages/user/LoginPage";
import CookiePage from "./pages/user/CookiePage";
import UserPage from "./pages/user/UserPage";

import './App.css'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/join" element={<JoinPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cookie" element={<CookiePage />} />
        <Route path="/user" element={<UserPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App