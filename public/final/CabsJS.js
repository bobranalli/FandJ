/*
 * CabsJS.js
 *
 * Allows app to display filtered movies (and information)
 * in modal.
 * 
 */

var queryNYTMovie = "https://api.nytimes.com/svc/movies/v2/reviews/search.json?query=";
var queryOMDb = "http://www.omdbapi.com/?t=";

var apiKeyNYT = "&api-key=SwK0dPrHBzcrQaighziecI3tk44SqWuL";
var apiKeyOMDb = "&apikey=ad99234a";

var errMsg = "Movie Not Found! Please Try again.";

// Object containing information of a review. Helps display review on movie info
function reviewItem(reviewLink, title, author) {
    this.reviewLink = reviewLink;
    this.title = title;
    this.author = author;
}

$(document).ready(function() {
    filter();
});

// Displays movie cabbage rating for those poster user clicked on
function filterByImg(movieObj) {
    $("#filteredMovies").html("");  // Clear current result space
    request(queryReview(movieObj.title, queryNYTMovie), queryMovie(movieObj.title, queryOMDb), movieObj);

    modal.style.display = "block";
}

// Display movies filtered by genre user picked or title searched.
function filter() {
    $("input[name=filterBtn]").click(function() {
        // Get form values
        let title = $("#title").val();
        let pickedGenre = $("select[name='genreSelect'] option:selected").val();

        // Clear current result space
        $("#filteredMovies").html("");

        // result flag
        var found = false;

        if (title == "" && pickedGenre != "") {
            movies.forEach(function(currObj) {
                if (currObj.genre == pickedGenre) {
                    request(queryReview(currObj.title, queryNYTMovie), queryMovie(currObj.title, queryOMDb), currObj);
                    found = true;
                }
            });
        } 
        else {    // Handles when title given, or no genre or title given
            const titleRegEx = new RegExp("^" + title, "i");
            movies.forEach(function(currObj) {
                if (titleRegEx.test(currObj.title)) {
                    request(queryReview(title, queryNYTMovie), queryMovie(title, queryOMDb), currObj);
                    found = true;
                }
            });
        }
        ensureResults(found);
        // reveal results in modal
        modal.style.display = "block";
    });
}

// Make 2 API requests to NYT then to OMDb
// and processes data to display on search page. 
function request(url1, url2, localObj) {
    var rev;
    var movie;
    fetch(url1)
        .then(response => response.json())
        .then((result1) => {        // get first respons from NYT
            rev = result1;
            if (rev["num_results"] == 0)
                throw new Error("No review results");
        })
        .then(() => {
            fetch(url2)
                .then(response2 => response2.json())
                .then(result2 => {      // get next response from OMDb
                    movie = result2;
                    if (movie["Response"] == "False")
                        throw new Error(movie["Error"]);
                    displayCard(movie, rev, localObj);
                })
        })
        .catch(function (error) {
            // handle errors
            // console.log(`Problem with fetch: ${error}; Try again!`);
            ensureResults(false);
        });
}

// Creates the query to make the API request for a NYT review
function queryReview(title, initQLink) {
    let queryAddress = initQLink + title + apiKeyNYT;
    return queryAddress;
}

// Creates the query to make the API request for movie data from OMDb
function queryMovie(title, initQLink) {
    let queryAddress = initQLink + title + apiKeyOMDb;
    return queryAddress;
}

// Formats how a movie is displayed on page
function displayCard(OMDbData, NYTData, dataItemObj) {
    let s = '<div class="poster"><div class="movie_poster">' + '<img src="' + OMDbData["Poster"] + '"></div><div class="info_poster"><div class="title">';

    s += "<span>" + OMDbData["Title"] + "</span><br>";
    s += "</div><div class='specs'><ul class='list'>";
    s += "<li><span>Genre: </span>" + OMDbData["Genre"] + "</li>";

    let book_rate = parseFloat(dataItemObj.book_rating);
    // s += "<li><div class='line'><div><span>Book Rating:</span></div> " + makeRating(book_rate, "Star") + "<div> " + book_rate + "</div></div></li>";
    s += "<li><div><span>Book Rating:</span></div> " + makeRating(book_rate, "Star") + "</li>";

    let movie_rate = parseFloat(OMDbData["imdbRating"]);
    // s += "<li><div class='line'><div><span>Movie Rating:</span></div> " + makeRating(movie_rate, "Star") + "<div> "  + movie_rate + "</div></div></li>";
    s += "<li><div><span>Movie Rating:</span></div> " + makeRating(movie_rate, "Star") + "</li>";

    let cab_score = calcCabbages(book_rate, movie_rate);
    // s += "<li><div class='line'><div><span>Cabbage Rating: </span></div>" + makeRating(cab_score, "Cabbage") + "<div> "  + cab_score + "</div></div></li>";
    s += "<li><div><span>Cabbage Rating: </span></div>" + makeRating(cab_score, "Cabbage") + "</li>";

    s += "<li><span>Read the Review: </span><br>" + createReview(NYTData, OMDbData["Title"]) + "</li>";

    s += "</ul></div></div></div>";

    $("#filteredMovies").append(s);
}

// creates html to display link to reviews on page.
// Assumes non null result from api request
function createReview(data, title) {
    var reviewList = [];
    // const regTitle = new RegExp('^' + title, "i");
    data["results"].forEach(function(currObj) {
        // if (regTitle.test(currObj["display_title"])) {
        if (currObj["display_title"] == title) {
            // console.log(currObj["display_title"]);
            let review = new reviewItem;

            review.reviewLink = currObj["link"]["url"];
            review.title = currObj["headline"];
            review.author = currObj["byline"];

            reviewList.push(review);
        }
    });

    // create the html
    let s = "";
    reviewList.forEach((currReview) => {
        s += "<a href=\"" + currReview.reviewLink + "\" target=\"_blank\">";
        s += currReview.title;
        s += "</a> by " + titleCase(currReview.author) + "<br>";
    });
    return s;
}

/* titleCase
 * apply title case to an person's name(s), i.e. capitalize the first letter of 
 * first/middle/last names.
 */
function titleCase(name) {
    let nameArr = name.split(" ");
    nameArr.forEach(function(curr, idx, arr) {
        arr[idx] = curr.toLowerCase().replace(/\b[a-z]/g, function(first) {
            return first.toUpperCase();
        });
    });

    name = nameArr.join(" ");
    return name;
}

// creates a visual 10 star rating in html
function makeRating(score, symbol) {
    let r = "";
    let s = score;

    r += "<div class='cabbage_rating'>";
    for (let i = 0; i < 10; i++) {
        // console.log(`Score is ${score}`);

        if (score <= 0) {   // blank star
            r += "<img src='./RateImages/"+ symbol +"Blank.png' class='star'>";
        }
        else if (score >= 1) {   // filled star
            r += "<img src='./RateImages/"+ symbol +"Filled.png' class='star'>";
        } 
        else {    // partial star, when 0 < score < 1
            r += "<img src='./RateImages/"+ symbol +"Half.png' class='star'>";
        }
        score -= 1;
    }
    r += ` ${s} / 10 </div>`;

    return r;
}

// calculates cabbage rating from book and movie rating
function calcCabbages(bscore, mscore) {
    let cscore = (bscore/mscore).toFixed(2);
    console.log(`Cscore: ${cscore}`);

    if(cscore > .65 && cscore <= .83){ 
        return 10;
    } else if (cscore > .83 && cscore <= 1.02){
        return 9;
    } else if (cscore > 1.02 && cscore <= 1.20){
        return 8;
    } else if (cscore > 1.20 && cscore <= 1.38){
        return 7;
    } else if (cscore > 1.38 && cscore <= 1.57){
        return 6;
    } else if (cscore > 1.57 && cscore <= 1.75){
        return 5;
    } else if (cscore <= 1.57) {
        return 4;
    }
}


// creates the html for select tag for genres
function makeGenreSelect() {
    let genre = [];
    let g = "<p>";
    g += "<select name='genreSelect'>"
    g += "<option disabled selected>Pick a Genre</option>";
    // <option value="" disabled selected>Choose a drink</option>
    for (i = 0; i < movies.length; i++) {
        if (!genre.includes(movies[i].genre)) {
            genre.push(movies[i].genre);
        }
    }
    genre.sort();

    genre.forEach(function(curr) {
        g += "<option>" + curr + "</option>";
    });
    g += "</select></p>";

    $("#filterForm").prepend(g);
}

// displays all movies to page; images (movie posters) are clickable
// to reveal cabbage scores.
function showAllMovies() {
    var r = "<div class='row' style='background-image: GreenBackground.jpg;'>";
    var collNum = movies.length / 4;
    var i = 0;
    for (i = 0; i < movies.length; i++) {
        if (i % 6 == 0)
            r += "<div class='column'>";

        r += "<img src='" + movies[i].pic + "' onclick='filterByImg(" + JSON.stringify(movies[i]) + ")'>"

        if (i % collNum == collNum - 1)
            r += "</div>";
    }
    if (i % collNum != collNum - 1) {
        r += "</div>";
    }
    r += "</div>";

    $("#allMovies").html(r);
}

// bool value of flag signals if requested data were able to return something;
// and displays appropriate information if not. 
function ensureResults(flag) {
    if (flag == false) {
        $("#filteredMovies").html(errMsg);
    }
}








/*****************************************************************/
/**************             GRAVEYARD           ******************/
/*****************************************************************/


// Formats how a movie is displayed on page
// function displayMovie(dataItemObj, apiData) {
//     console.log(`Here in displayMovie(), and have ${dataItemObj}`);

//     let s = '<div class="poster"><div class="movie_poster">' + '<img src="' + dataItemObj.pic + '" style="width:100%">' + '</div><div class="title">';

//     s += "<span>" + dataItemObj.title + "</span><br>";
//     s += "</div><div class='specs'><ul class='list'>";

//     // s += "<span>Genre: </span>" + dataItemObj.genre + "<br>";
//     s += "<li><span>Genre: </span>" + dataItemObj.genre + "</li>";

//     s += "<li><span>Book Rating:</span> " + makeRating(dataItemObj.book_rating, "Star") + " " + dataItemObj.book_rating + "</li>";

//     s += "<li><span>Movie Rating:</span> " + makeRating(dataItemObj.movie_rating, "Star") + " "  + dataItemObj.movie_rating + "</li>";

//     s += "<li><span>Cabbage Rating: </span>" + makeRating(dataItemObj.sim_rating, "Cabbage") + " "  + dataItemObj.sim_rating + "</li>";

//     s += "<li><span>Read the Review: </span><br>" + createReview(apiData, dataItemObj.title) + "</li>";

//     s += "</ul></div></div>";
//     // return s;
//     $("#filteredMovies").append(s);
//     // openResult();
// }


/* requestData
 * Get json data about movies review.
 * use AJAX.
 */
// function requestData(address, dataObj) {
//     console.log(dataObj);

//     // 1. make a request object to make http requests
//     var reqObj = new XMLHttpRequest();
//     console.log("1 - request object created");

//     // 2. Set the URL for the AJAX request to be the JSON file
//     reqObj.open("GET", address, true);
//     console.log("2 - opened request file")

//     // 3. set event handler/callback
//     reqObj.onreadystatechange = function () {
//         if (reqObj.readyState == 4 && reqObj.status == 200) {
//             // 5. wait for done + success
//             console.log("5 - response received")

//             var result = reqObj.responseText;
//             // console.log(result);     // raw

//             data = JSON.parse(result);

//             displayMovie(dataObj, data)

//         } else if (reqObj.readyState == 4 && reqObj.status != 200) {
//             // $("#filteredMovies").html("Something went wrong! Check logs.");
//             console.log("Something went wrong! Check logs.");
//         } else if (reqObj.readyState == 3) {
//             // $("#filteredMovies").html("Too soon! Try again");
//             console.log("Too soon! Try again");
//         }
//     }

//     // 4. fire off http request
//     reqObj.send();
//     console.log("4 - request sent")
// }

// When a movie result should display, add active class
// to make it appear as though it was a pop up window or modal
// function openResult() {
//     $(".filteredMovies").addClass("active");
//     $("#overlay").addClass("active");
// }

// Clear the movie result display from page
// function closeResult() {
//     // console.log(`closing result`);
//     $(".filteredMovies").removeClass("active");
//     $("#overlay").removeClass("active");
// }