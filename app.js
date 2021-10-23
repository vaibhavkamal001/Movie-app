if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}
const express = require('express');
const app = express();
const axios = require('axios')
const path = require('path');
const ejsMate = require('ejs-mate')
const AppError = require("./error");

app.engine('ejs', ejsMate);

let moviefetch;

const SHEARCHAPI = process.env.SEARCH;

const APIURL = process.env.URL;

function wrapError(fn){
    return (req,res,next)=>{
        fn(req,res,next).catch(e=>next(e));
    }
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.set(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'design')))

app.get('/movies',wrapError(async (req, res, next) => {
    const { data } = await axios(APIURL)

    if(data.results.length==0){
        throw new AppError(404,"No Data Found"); 
    }

    moviefetch = data.results;
    res.render('main', { Data: data.results })
}));

app.get('/movies/search', wrapError(async (req, res, next) => {
    const { search } = req.query;
    const { data } = await axios(`${SHEARCHAPI}${search}`)
    // console.log(data.results)
    if(data.results.length==0){
        throw new AppError(404,"No Data Found"); 
    }
    moviefetch = data.results;
    res.render('main', { Data: data.results })
}));

app.get('/movies/:id',(req, res) => {
    const { id } = req.params;
    res.render('show', { moviefetch, id })
});

app.use((err,req,res,next)=>{
    const {statusCode=404} = err;
    if(!err.message){
        err.message="Something went worng";
    }else if(err.message=="getaddrinfo ENOTFOUND api.themoviedb.org"){
        err.message = "No Internet Connection";
    }
    res.status(statusCode).render('error',{error:err});
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("serving port 3000");
})
