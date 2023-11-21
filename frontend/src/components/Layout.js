import { Footer } from "./Footer"
import { NavBar } from "./NavBar"

export const Layout = ({children}) => {
    return (
        <div className="layout">
            <NavBar/>
            <div className="flex flex-col min-h-screen">
            <div className="flex-1">
            {children}
            </div>
            <Footer/>
            </div>
        </div>
    )
}