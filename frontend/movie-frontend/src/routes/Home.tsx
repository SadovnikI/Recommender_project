import {useContext, useEffect, useState} from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import conf from "../Config";
import CardSection from "../components/CardSection";
import Loading from "../views/Loading";
import {CurrentUserContext} from "../App";

function Home(){
    const [featured, setFeatured] = useState<any>(null);

    const [BiVAEModelPrediction, setBiVAEModelPrediction] = useState<any>(null);
    const [NCFModelPrediction, setNCFModelPrediction] = useState<any>(null);

    const [WANDDModelAllData, setWANDDModelAllData] = useState<any>(null);
    const [WANDDModelPrediction, setWANDDModelPrediction] = useState<any>(null);
    const [WANDDModelRatings, setWANDDModelRatings] = useState<any>(null);

    // @ts-ignore
    const { currentUser, setCurrentUser } = useContext(CurrentUserContext);

    function getRandomInt(min: number, max: number) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
    }


    async function getFeatured(){
        fetch(conf.BACKEND_API_URL+`/movie/movie/${556}`)
        .then((response) => response.json())
        .then((data) => {
                setFeatured({

                    id: data.id,
                    title: data.title,
                    image: data.poster_url,
                    link: data.imdb_url,

                    year: 1997,
                    length: '97' + "m",
                    stars: 8,
                    description: 'A street-toughened parolee finds his two boys abandoned by their mum and fending for themselves. Time to step up, or not.',
                    type: "movie"
                });
            }
        )
        .catch(console.error)
    }

    async function getBiVAEModelPrediction(){
        fetch(conf.BiVAE_API_URL+`/model/predict/${currentUser}`).then((response) => response.json()).then((data) => {
            fetch(conf.BACKEND_API_URL + `/movie/movie_list?movie_ids=${data.movie_ids}`)
                .then((response) => response.json())
                .then((data) => {
                        setBiVAEModelPrediction(data.map((movie: any) => {
                            return {
                                id: movie.id,
                                title: movie.title,
                                image: movie.poster_url,
                                link: movie.imdb_url,
                                type: "movie"
                            }
                        }));
                    }
                )
        }
        )
    }

    async function getNCFModelPrediction(){
        fetch(conf.NCF_API_URL+`/model/predict/${currentUser}`).then((response) => response.json()).then((data) => {
            fetch(conf.BACKEND_API_URL + `/movie/movie_list?movie_ids=${data.movie_ids}`)
                .then((response) => response.json())
                .then((data) => {
                        setNCFModelPrediction(data.map((movie: any) => {
                            return {
                                id: movie.id,
                                title: movie.title,
                                image: movie.poster_url,
                                link: movie.imdb_url,
                                type: "movie"
                            }
                        }));
                    }
                )
        }
        )
    }

    async function getWANDDModelAllData(){
        console.log('a', currentUser)
        fetch(conf.WADNDD_API_URL+`/model/all/data/${currentUser}`).then((response) => response.json())
            .then((data) => {
                const movie_array: number[] = [];
                const movie_ratings: any = {};

                data.map((movie: any) => {
                    movie_array.push(movie.itemID);
                    movie_ratings[movie.itemID] = movie.rating;
                })
                fetch(conf.BACKEND_API_URL + `/movie/movie_list?movie_ids=${movie_array}`)
                .then((response) => response.json())
                .then((data) => {
                        setWANDDModelAllData(data.map((movie: any) => {
                            var raiting: string = ''
                            if (movie_ratings !== null){
                                raiting = '  :  ' + movie_ratings[movie.id] + " ⭐"
                            }
                            return {
                                id: movie.id,
                                title: (movie.title + raiting),
                                image: movie.poster_url,
                                link: movie.imdb_url,
                                type: "movie"
                            }
                        }));
                    })
                })
    }

    async function getWANDDModelPrediction(){
        fetch(conf.WADNDD_API_URL+`/model/predict/${currentUser}`).then((response) => response.json()).then((data) => {
            fetch(conf.BACKEND_API_URL + `/movie/movie_list?movie_ids=${data.movie_ids}`)
                .then((response) => response.json())
                .then((data) => {
                        setWANDDModelPrediction(data.map((movie: any) => {
                            return {
                                id: movie.id,
                                title: movie.title,
                                image: movie.poster_url,
                                link: movie.imdb_url,
                                type: "movie"
                            }
                        }));
                    }
                )
        }
        )
    }

    useEffect(() => {
        getFeatured();
        getWANDDModelPrediction();
        getWANDDModelAllData();
        getNCFModelPrediction();
        getBiVAEModelPrediction();
    }, []);

    if(!featured){
        return <Loading />;
    }

    return (
        <>
            <Helmet>
                <title>Home - {conf.SITE_NAME}</title>
            </Helmet>
            <div className="container">
                <Link
                to={featured.type === "movie" ? `/movie/${featured.id}` : `/tv/${featured.id}`}
                className="movie-hero"
                style={{
                    background: `url(${featured.image}) no-repeat center / cover`
                }}>
                    <div className="movie-hero-drop"></div>

                    <div className="movie-hero-content">
                        <p className="movie-hero-title">{featured.title}</p>
                        
                        <div className="movie-hero-meta">
                            <div className="movie-hero-stars">
                                <i className="fa-solid fa-star"></i>
                                <p>{featured.stars}/10</p>
                            </div>
                            
                            <p className="movie-hero-year">{featured.year}</p>

                            <p className="movie-hero-length">{featured.length}</p>
                        </div>
                        
                        <p className="movie-hero-desc">{featured.description}</p>

                        <button className="movie-hero-play">
                            <i className="fa-solid fa-play"></i>
                            <p>Play</p>
                        </button>
                    </div>
                </Link>

                {
                    !WANDDModelAllData ?
                    (
                        <div className="movie-section">
                            <p className="movie-section-title">Rated Movies 👑</p>
        
                            <div className="movie-section-loading">
                                <i className="fa-solid fa-spinner-third"></i>
                            </div>
                        </div>
                    ) :
                    (
                        <CardSection
                        title="Rated Movies 👑"
                        items={WANDDModelAllData} />
                    )
                }

                {
                    !BiVAEModelPrediction ?
                    (
                        <div className="movie-section">
                            <p className="movie-section-title">Top 10 BiVAE Model predictions ✨</p>

                            <div className="movie-section-loading">
                                <i className="fa-solid fa-spinner-third"></i>
                            </div>
                        </div>
                    ) :
                    (
                        <CardSection
                        title="Top 10 BiVAE Model predictions ✨"
                        items={BiVAEModelPrediction} />
                    )
                }

                {
                    !WANDDModelPrediction ?
                    (
                        <div className="movie-section">
                            <p className="movie-section-title">Top 10 WandD Model predictions 🏆</p>

                            <div className="movie-section-loading">
                                <i className="fa-solid fa-spinner-third"></i>
                            </div>
                        </div>
                    ) :
                    (
                        <CardSection
                        title="Top 10 WandD Model predictions 🏆"
                        items={WANDDModelPrediction} />
                    )
                }

                {
                    !NCFModelPrediction ?
                    (
                        <div className="movie-section">
                            <p className="movie-section-title">Top 10 NCF Model predictions 🔥</p>
        
                            <div className="movie-section-loading">
                                <i className="fa-solid fa-spinner-third"></i>
                            </div>
                        </div>
                    ) :
                    (
                        <CardSection
                        title="Top 10 NCF Model predictions 🔥"
                        items={NCFModelPrediction} />
                    )
                }


            </div>
        </>
    )
}

export default Home;