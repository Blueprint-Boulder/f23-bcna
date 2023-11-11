import { Footer } from "../Footer/Footer"
import { NavBar } from "../NavBar/NavBar"

export const Layout = ({children}) => {
    return (
        <div className="layout">
            <NavBar/>
            <div className="content-container">
            {children}
            </div>
            <Footer/>
        </div>
    )
}