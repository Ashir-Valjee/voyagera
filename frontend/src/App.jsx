import { Outlet, useNavigation } from 'react-router-dom'
import NavBar from './components/NavBar';

function App() {
  const navigation = useNavigation()

  return (
    <>
      <div>
        <NavBar />
        <main>
          {
            navigation.state === "idle" ?
            <Outlet />
            :
            <div>
              <p>Loading...</p>
            </div>
          }
        </main>
      </div>
    </>
  );
}

export default App;
