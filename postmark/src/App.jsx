import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Home from "./pages/Home";
import Results from "./pages/Results";
import Criteria from "./pages/Criteria";
import Nav from "./components/Nav";
import { useState } from "react";

function Layout() {
  return (
    <>
      <Nav />
      <Outlet />
    </>
  )
}



export default function App() {
  const [criteria, setCriteria] = useState({
    housePrices: 4,
    crimeRate: 3,
    commuteTime: 5,
    deprivation: 2
  })

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home criteria={criteria} setCriteria={setCriteria}/>} />
          <Route path="/results" element={<Results criteria={criteria} />} />
          <Route path="/criteria" element={<Criteria criteria={criteria} setCriteria={setCriteria}/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

