//Replaces <Outlet> with the selected component from the navbar
import { Outlet } from "react-router-dom";
import Header from "./Header";

export default function Layout() {
    return (
        <div className="bg-gray-100 h-screen flex flex-col">
            <nav>
                <Header />
            </nav>
            <Outlet />
        </div>
    );
}



