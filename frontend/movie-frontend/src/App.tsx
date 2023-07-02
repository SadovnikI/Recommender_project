import { Routes, Route } from "react-router-dom";

import Footer from "./views/Footer";
import TopBar from "./views/TopBar";

import Home from "./routes/Home";
import Users from "./routes/ChangeUser";
import E404 from "./routes/E404";
import React, {useState} from "react";

export const CurrentUserContext = React.createContext(null);

function App() {
    const [currentUser, setCurrentUser] = useState(507);
    return (
        <>
            <CurrentUserContext.Provider value={{ currentUser: currentUser, setCurrentUser: setCurrentUser }}>
                <TopBar />

                <Routes>
                    <Route path="/" element={<Home />} />

                    <Route path="/change_user" element={<Users />} />

                    <Route path="*" element={<E404 />} />
                </Routes>

                <Footer />
            </CurrentUserContext.Provider>
        </>
    )
}

export default App
