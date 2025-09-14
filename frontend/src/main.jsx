import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./style.css";
import App from "./App";
import HomePage from "./pages/HomePage.jsx"
import SignupLogin from "./pages/SignupLogin.jsx"
import Results from "./pages/Results.jsx";
import Profile from "./pages/Profile.jsx"

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: "/signup",
        element: <SignupLogin />, 
      },
      {
        path: "/results",
        element: <Results />, 
      },
      {
        path: "/profile",
        element: <Profile />, 
      },
    ]
  },
]);


ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
