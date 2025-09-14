import { useRouteError } from "react-router-dom"
import NavBar from "../components/NavBar"
import Footer from "../components/Footer"

const ErrorPage = () => {
    const error = useRouteError()
    console.error(error)
    console.log('Error Status ->', error.status)

    return (
        <>
            <div className="flex flex-col items-center justify-center min-h-screen">
                <NavBar />
                <main className="flex-grow">
                    <div role="alert" className="alert alert-error">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xl">Sorry, an unexpected error has occurred!</span>
                    </div>
                </main>
                <Footer />
            </div>
        </>
    )
}

export default ErrorPage;