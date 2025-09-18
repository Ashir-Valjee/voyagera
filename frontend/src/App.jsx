import { Outlet, useNavigation } from 'react-router-dom'
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  const navigation = useNavigation()

  return (
    <>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <NavBar />
          <main className="flex-grow">
            {
              navigation.state === "idle" ?
              <Outlet />
              :
              <div className="flex h-full items-center justify-center">
                <span className="loading loading-ring loading-xl loading-primary"></span>
              </div>
            }
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </>
  );
}

export default App;
