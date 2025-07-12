//Replaces <Outlet> with the selected component from the navbar
import { Outlet } from "react-router-dom";
import Header from "./Header";
import PropTypes from "prop-types";

export default function Layout({ username, setUser }) {
    return (
        <div className="bg-gray-100 min-h-screen flex flex-col">
            <nav>
                <Header username={username} setUser={setUser}/>
            </nav>
            <Outlet />
        </div>
    );
}

Layout.propTypes = {
    username: PropTypes.string,
    setUser: PropTypes.func
}

