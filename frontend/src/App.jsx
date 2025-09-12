import "./App.css";
import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignUp";

function App() {
  return (
    <>
      <p className="text-lg text-red-500">
        Click on the Vite and React logos to learn more
      </p>
      <LoginForm />
      <SignupForm />
    </>
  );
}

export default App;
