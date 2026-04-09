//Replaces <Outlet> with the selected component from the navbar
import { Outlet } from "react-router-dom";
import Header from "./Header";
import PropTypes from "prop-types";

export default function Layout({ username, setUser }) {
    return (
        <div className="bg-transparent min-h-screen flex flex-col transition-colors duration-300">
            <Header username={username} setUser={setUser}/>
            <div className="pt-24 sm:pt-28 flex-grow">
                <Outlet />
            </div>
        </div>
    );
}

Layout.propTypes = {
    username: PropTypes.string,
    setUser: PropTypes.func
}

