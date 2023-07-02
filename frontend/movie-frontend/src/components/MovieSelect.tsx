import * as React from 'react';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import {ChangeEvent,useEffect, useState} from "react";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import Box from "@mui/material/Box";
import conf from "../Config";
import Grid from '@mui/material/Grid';
import {styled} from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import CardSection from "./CardSection";


export default function Userdata({sendRowsToParent}) {

    const CssTextField = styled(TextField)({
        '& label.Mui-focused': {
        color: '#fa1c1c',
        },
        '& .MuiInput-underline:after': {
        borderBottomColor: '#f65656',
        },
        '& .MuiOutlinedInput-root': {
        '& fieldset': {
          borderColor: '#171717',
        },
        '&:hover fieldset': {
          borderColor: '#f65656',
        },
        '&.Mui-focused fieldset': {
          borderColor: '#f65656',
        },
        },
    });

    const columns: GridColDef[] = [
      { field: 'id', headerName: 'Movie ID', width: 60 },
      { field: 'poster', headerName: 'Poster', renderCell: (params) => <img className="table-image" src={params.value} />, width: 100 },
      { field: 'title', headerName: 'Title',  width: 230 },
      { field: 'rating', headerName: 'Rating', type: 'number', width: 100 },
    ];

    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
    setOpen(true);
    };

    const handleClose = () => {
        var rating = document.getElementById('rating').value
        console.log('aaa', movie, typeof rows)
        if (movie === null || rating ===''){
            setError(true)
        }
        else {
            if (rows.length == 0){
                var new_rows = [{
                    'id': movie.id,
                    'poster': movie.poster_url,
                    'title': movie.title,
                    'rating': rating
                }]
            }
            else {
                var new_rows = Array.from(rows)
                new_rows.push({
                    'id': movie.id,
                    'poster': movie.poster_url,
                    'title': movie.title,
                    'rating': rating,
                })
            }
            sendRowsToParent(new_rows)
            setRows(new_rows)
            setOpen(false);
            setMovie(null)
        }
    };


    const [rows, setRows] = useState<any>([]);



    const [results, setResults] = useState<any>();
    const [search, setSearch] = useState("");
    const [movie, setMovie] = useState(null);
    const [error, setError] = useState(null);

    function onChange(e:ChangeEvent<HTMLInputElement>){
        setSearch(e.target.value);
    }

    function onClick(result: object){
        setResults(null);
        setSearch("");
        setMovie(result)

    }

    async function getResults(){
        fetch(conf.BACKEND_API_URL+"/movie/search?search="+search)
            .then((data)=>data.json())
            .then((res)=>{
                setResults(res)
            })
    }

    useEffect(() => {
        if(search.length > 0){
            getResults();
        }
    }, [search]);





    return (
    <React.Fragment>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={handleClickOpen}
              sx={{ mt: 3, ml: 1 }}
              color="error"
            >
                Add new movie rating
            </Button>
        </Box>
        <DataGrid
        rowHeight={100}
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        pageSizeOptions={[10, 20]}
        />


        <Dialog open={open} onClose={handleClose} maxWidth='xl'>
            <DialogTitle>Add Movie Rating</DialogTitle>
            <DialogContent sx={{height:250, width:300}}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <div className="top-bar-search">
                            <input
                            type="text"
                            value={search}
                            placeholder="Search"
                            onChange={e => onChange(e)} />

                            <i className="fa-solid fa-search"></i>

                            {
                                (search.length > 0 && results) && (
                                    <div className="top-bar-dropdown">
                                        {
                                            results.map((result:any) => (
                                                <a key={result.id} onClick={() => onClick(result)} className="top-bar-dropitem">
                                                    <i className="fa-solid fa-play-circle"></i>
                                                    <p className="title">{result.title}</p>

                                                    <div className="tag">
                                                        <p>Movie</p>
                                                    </div>
                                                </a>
                                            ))
                                        }
                                    </div>
                                )
                            }
                        </div>
                    </Grid>
                    <Grid item xs={12}>
                        {
                            !movie ?
                            (
                                <div>
                                </div>
                            ) :
                            (
                                <div className="top-bar-movie-background">
                                    <a className="top-bar-dropitem">

                                        <p className="title">{movie.title}</p>

                                        <div className="tag">
                                            <p>Movie</p>
                                        </div>
                                    </a>
                                </div>
                            )
                        }

                    </Grid>
                    <Grid item xs={12}>
                        <CssTextField
                            id="rating"
                            name="rating"
                            label="Movie rating"
                            fullWidth
                            autoComplete="5"
                            variant="standard"
                          />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button onClick={handleClose}>Add</Button>
            </DialogActions>
        </Dialog>
    </React.Fragment>
    );
}