import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./style.css";
import App from "./App";
import HomePage from "./pages/HomePage.jsx"
import SignupPage from "./pages/SignupPage.jsx"
import Results from "./pages/Results.jsx";
import ProfilePage from "./pages/ProfilePage.jsx"
import ErrorPage from "./pages/ErrorPage.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: "/signup",
        element: <SignupPage />, 
      },
      {
        path: "/results",
        element: <Results />, 
      },
      {
        path: "/profile",
        element: <ProfilePage />, 
      },
    ]
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
