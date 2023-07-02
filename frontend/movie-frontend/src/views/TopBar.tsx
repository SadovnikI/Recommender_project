import { ChangeEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import conf from "../Config";

function TopBar(){
    const [search, setSearch] = useState("");
    const [mobileSearch, setMobileSearch] = useState(false);

    const [results, setResults] = useState<any>();

    function onChange(e:ChangeEvent<HTMLInputElement>){
        setSearch(e.target.value);    
    }

    function onClick(){
        setResults(null);
        setSearch("");
        setMobileSearch(false);
    }

    async function getResults(){
        const req = await fetch(conf.BACKEND_API_URL+"/search?query="+search);
        const res = await req.json();

        if(res.success){
            setResults(res.results);
        }
        else{
            setResults(null);
        }
    }
    
    useEffect(() => {
        if(search.length > 0){
            getResults();
        }
    }, [search]);

    return (
        <>
            <div className="top-bar">
                <Link to="/" className="top-bar-logo">
                    <img src="/logo.png" alt={conf.SITE_NAME} />
                </Link>

            <Link to="/change_user" className="top-bar-button-link">
                <button className="top-bar-button" >
                    <p>User Profile</p>
                </button>
            </Link>

            </div>

        </>
    )
}

export default TopBar;