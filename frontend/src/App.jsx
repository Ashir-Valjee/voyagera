import { Outlet, useNavigation } from 'react-router-dom'

function App() {
  const navigation = useNavigation()

  return (
    <>
      <div>
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
