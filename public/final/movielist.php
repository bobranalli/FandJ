<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="keywords" content="cabbage, book, movie, rating, genre, app">
    <script src="https://code.jquery.com/jquery-3.6.0.js" integrity="sha256-H+K7U5CnXl1h5ywQfKtSj8PCmoN9aaq30gDh27Xc0jk=" crossorigin="anonymous"></script>
    <link rel="preconnect" href="https://fonts.gstatic.com">
    <link href="https://fonts.googleapis.com/css2?family=Josefin+Sans&display=swap" rel="stylesheet">

    <link rel="stylesheet" type="text/css" href="cabbagestyles.css">
    <link rel="stylesheet" type="text/css" href="resultStyle.css">
    <link rel="shortcut icon" type="image/png" href="CabbageLogo.png">
    <script language="javascript" src="CabsJS.js"></script>

     <title>Movie Search</title>
<style>
    #emphasize{
        color:#FFFFFF; 
        padding-top: 40px;
        font-size: 40px;
    }

    #showcase h2{
        margin-top: 200px;
    }
    .footertitle{
        padding-top: 50px;
        font-size: 25px;
    }
    .small{
        font-size: 20px;
    }
    #showcase{
        max-height:650px;
        border-bottom: 4px solid #000000;
    }
</style>

</head>
    <script>
        movies = [];
        function DataItem(title, genre, book_rating, pic)
        {
            this.title = title;
            this.genre = genre;
            this.book_rating = book_rating;
            this.pic = pic;
        } 
    </script>
<body>
    <!--Nav Bar-->
    <nav id='navbar' class="navbar">
    <ul>
        <div class="logo">
            <li><a href="index.html"><img src = "CabbageLogo.png" height="50"></a></li>
        </div>
        <div class="texttabs">
            <li><a href='tab1.html'>TAB 1</a></li>
            <li><a href='tab2.html'>TAB 2</a></li>
            <li><a href='tab3.html'>TAB 3</a></li>
        </div>
    </ul></nav>

    <section id="showcase">
        <div class="container">
            <h2 style="color:#000000">Here to provide you with a definitive answer to that age-old question - <div id="emphasize">is the movie anything like the book?</div></h2>
            <h1>cabbage.</h1>	
        </div>
    </section>

    <?php
        $server = "sql204.epizy.com";
        $userid = "epiz_27856819";
        $pw = "a3g42bksYbsS"; 
        $db = "epiz_27856819_cabbage_movies"; 

        //create connection 
        $conn = new mysqli($server, $userid, $pw); 

        //check connection
        if($conn->connect_error){
              die("Connection failed: " . $conn->connect_error); 
        } else {
            // echo "Success :)";
        }

        $conn->select_db($db); 

        //run query
        $sql = "SELECT title, genre, book_rating, pic FROM movies"; 
        //echo "The query is: " . $sql ."<br />"; 
        $result = $conn->query($sql);

        //get results
        if($result->num_rows > 0){
              while($row = $result->fetch_array()){
                $item = $row["title"]; 
                $item2 = $row["genre"];
                $item3 = $row["book_rating"]; 
                // $item4 = $row["movie_rating"];
                $item5 = $row["pic"];
                echo "<script language = \"javascript\">movies.push(new DataItem(\"$item\", \"$item2\", \"$item3\", \"$item5\"))</script>"; 
              }
        } else {
              echo "no results"; 
        }
        //close the connection
        $conn->close();  
    ?>

    <!-- Filtering Form starts here -->
    <h1 id="page_head">Start Filtering by Genre or Movie Name To See Their Cabbage Rating!</h1>
    <form id="filterForm" action="">
        <!-- Create Movie Genere Select tag here -->
        <script language="javascript">makeGenreSelect(); </script>

        <p>- or -</p>

        <p><input type="text" name="title" id="title" placeholder="Type in a Movie Title:"></p>
        
        <!-- Filter Button Here -->
        <input type="button" name="filterBtn" id="filterBtn" value="Submit">
    </form>

    <!-- Display All Movies Here -->
    <div id="allMovies"></div>
    <script language="javascript">showAllMovies(); </script>

    <!-- Display results of Movies in Modal -->
    <div class="modal" id="resModal" style="display: none;">
        <div class="popupWindow scrollModal">
            <div class="modalHead">
                <div class="modal_top">Result</div>
                <div class="closeWindow" id="closeBtn">&times;</div>
            </div>
            <!-- Results of search goes here -->
            <div id="filteredMovies"></div>
        </div>
    </div>

    <script>
        // Allows user to close modal when clicking close or clicking
        // away from modal
        var modal = document.getElementById("resModal");
        var closer = document.getElementById("closeBtn");
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }

        closer.addEventListener("click", () => {
            modal.style.display = "none";
        });
    </script>

<!-- <div class='poster'>
        <div class="movie_poster">
            <img src="' + OMDbData["Poster"] + '">
        </div>

        <div class="movie_poster">
        <div class='title'>
            <span>the_title</span><br>
        </div>
        <div class='specs'>
            <ul class='list'>
                <li><span>Genre:</span> the_genre</li>
                <li>
                    <div class='line'>
                    <div><span>Book Rating:</span></div>
                    <div class='cabbage_rating'>
                        <img src='./images/CabbageFilled.png' class='star'>
                        <img src='./images/CabbageBlank.png' class='star'>
                        <img src='./images/CabbageHalf.png' class='star'>

                    </div>
                    <div>the_book_rating</div>
                    </div>
                </li>
                <li class='line'>
                    <div><span>Movie Rating:</span><div>
                    <div class='cabbage_rating'>
                        <img src='./images/CabbageFilled.png' class='star'>
                        <img src='./images/CabbageBlank.png' class='star'>
                        <img src='./images/CabbageHalf.png' class='star'>

                    </div>
                    <div>the_movie_rating</div>
                </li>
                <li class='line'>
                    <div><span>Cabbage Rating:</span></div>
                    <div class='cabbage_rating'>
                        <img src='./images/CabbageFilled.png' class='star'>
                        <img src='./images/CabbageBlank.png' class='star'>
                        <img src='./images/CabbageHalf.png' class='star'>

                    </div>
                    <div>the_cabbage_rating</div>
                </li>
                <li>
                    <span>Read the Review:</span><br>
                    <a href="#" target="_blank">Article_Title</a> by Author Name
                </li>
            </ul>
        </div>
        </div>
    </div> -->



    <footer id="main-footer">
        <div class="foot-block"><div id="foot-address">
            <ul>
                <li class="footertitle"><div class="small">copyright &copy; 2021 </div>cabbage.</li>
            </ul>
        </div>
    </footer>

</body>
</html>