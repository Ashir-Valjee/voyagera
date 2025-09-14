import { useRouteError } from "react-router-dom"
import NavBar from "../components/NavBar"
import Footer from "../components/Footer"

const ErrorPage = () => {
    const error = useRouteError()
    console.error(error)
    console.log('Error Status ->', error.status)

    return (
        <>
        <NavBar />
        <div id="error-page">
            <p>Sorry, an unexpected error has occurred!</p>
        </div>
        <Footer />
        </>
    )
}

export default ErrorPage;