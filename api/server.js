const express = require("express");
//const { open } = require("sqlite");
//const sqlite3 = require("sqlite3");
const path = require("path");
//const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const dbPath = path.join(__dirname, "twitterClone.db");

const app = express();
const cors = require("cors")

const bodyParser = require('body-parser');
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL|| 'postgres://postgres:twozero.20@localhost:5432/jobbyapp',
  ssl: process.env.DATABASE_URL ? true : false
})

app.use(cors())
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let db = null;

// const getUserById = async(req,res) => {
//   const id = req.params.id;
//   const response = await pool.query('SELECT * FROM users WHERE id = $1',[id]);
//   res.json(response.rows);
// };
app.post("/api/login", async (request, response) => {
  console.log("got it !")
  const { username, password } = request.body;
  //console.log("re.p",request.params)
  console.log("username",username)
  const ans = await pool.query('SELECT * FROM usermanual WHERE "um_username" = $1',[username]);
  console.log(ans);
  if (ans.rowCount === 0) {
    response.status(400);
    response.send("Invalid user");
  }
  else{
    const payload = {
      username: username,
    };
    const jwtToken = jwt.sign(payload, "MY_SECRET_TOKEN");
    response.send({ jwtToken });
  }
  
});

// app.post("/api/login", async (request, response) => {
//   console.log("got t !")
//   const { username, password } = request.body;
//   console.log("usn",username)
//   const payload = {
//             username: username,
//          };
//   const jwtToken = jwt.sign(payload, "MY_SECRET_TOKEN");
//   response.send({ jwtToken });
// });

// app.listen(4000, () =>
//       console.log("Server Runing at http://localhost:3000/")
// );

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`server is up and listening on port ${port}`);
});

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

// initializeDbAndServer();

const convertFollowerDbObjectToResponseObject = (dbObject) => {
  return {
    followerId: dbObject.follower_id,
    followerUserId: dbObject.follower_user_id,
    followingUserId: dbObject.following_user_id,
  };
};

const convertTweetDbObjectToResponseObject = (dbObject) => {
  return {
    tweetId: dbObject.tweet_id,
    tweet: dbObject.tweet,
    userId: dbObject.user_id,
    dateTime: dbObject.date_time,
  };
};

//authentication
function authenticateToken(request, response, next) {
  let jwtToken;
  const authHeader = request.headers["authorization"];
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(" ")[1];
  }
  if (jwtToken === undefined) {
    response.status(401);
    response.send("Invalid JWT Token");
  } else {
    jwt.verify(jwtToken, "MY_SECRET_TOKEN", (error, payload) => {
      if (error) {
        response.status(401);
        response.send("Invalid JWT Token");
      } else {
        request.username = payload.username;
        next();
      }
    });
  }
}

// app.post("/login", async (request, response) => {
//   const { username, password } = request.body;
//   console.log(username);
//   const selectUserQuery = `SELECT * FROM user WHERE username = '${username}';`;
//   const dbUser = await db.get(selectUserQuery);
//   console.log(dbUser);
//   if (dbUser === undefined) {
//     response.status(400);
//     response.send("Invalid user");
//   } else {
//     const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
//     if (isPasswordMatched === true) {
//       const payload = {
//         username: username,
//       };
//       const jwtToken = jwt.sign(payload, "MY_SECRET_TOKEN");
//       response.send({ jwtToken });
//       console.log({ jwtToken });
//     } else {
//       response.status(400);
//       response.send("Invalid password");
//     }
//   }
// });

app.post("/register", async (request, response) => {
  const { username, password, name, gender } = request.body;
  console.log(username);
  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}';`;
  const dbUser = await db.get(selectUserQuery);
  console.log(dbUser);
  if (dbUser === undefined) {
    const { username, password, name, gender } = request.body;
    if (password.length < 6) {
      response.status(400);
      response.send("Password is too short");
    } else {
      const registerQuery = `
        INSERT INTO
          user (username, password, name, gender)
        VALUES
          ('${username}', '${password}', '${name}', '${gender}');`;
      await db.run(registerQuery);
      response.send("User created successfully");
    }
  } else {
    response.status(400);
    response.send("User already exists");
  }
});

app.get("/follower/", authenticateToken, async (request, response) => {
  const getFollowerQuery = `
    SELECT
      *
    FROM
      follower;`;
  const statesArray = await db.all(getFollowerQuery);
  response.send(
    statesArray.map((eachState) =>
      convertFollowerDbObjectToResponseObject(eachState)
    )
  );
});

app.get("/twee/", authenticateToken, async (request, response) => {
  const getFollowerQuery = `
    SELECT
      *
    FROM
      tweet;`;
  const statesArray = await db.all(getFollowerQuery);
  response.send(
    statesArray.map((eachState) =>
      convertTweetDbObjectToResponseObject(eachState)
    )
  );
});

app.get("/user/", authenticateToken, async (request, response) => {
  const getFollowerQuery = `
    SELECT
      *
    FROM
      user;`;
  const statesArray = await db.all(getFollowerQuery);
  response.send(statesArray);
});

app.get("/user/tweets/feed/", authenticateToken, async (request, response) => {
  let { username } = request;
  const getFollowerQuery = `
    SELECT
      username,
      tweet,
      date_time
    FROM
      tweet
      LEFT JOIN follower ON follower.following_user_id=tweet.user_id
      LEFT JOIN user ON user.user_id=follower.follower_user_id
    WHERE
      username='${username}'
    ORDER BY
      date_time DESC
    LIMIT
      4
    ;`;
  const statesArray = await db.all(getFollowerQuery);
  const result = statesArray.map((num) =>
    JSON.parse(JSON.stringify(num).replace("date_time", "dateTime"))
  );
  response.send(result);
});

//api4
app.get("/user/following/", authenticateToken, async (request, response) => {
  let { username } = request;
  const getFollowerQuery = `
  SELECT
    user.name
  FROM
    (SELECT
      *
    FROM
      follower
    LEFT JOIN user ON user.user_id=follower.follower_user_id
    WHERE
     username='${username}')
  LEFT JOIN user ON user.user_id=following_user_id
  ;`;
  const statesArray = await db.all(getFollowerQuery);
  response.send(statesArray);
});

//api5
app.get("/user/followers/", authenticateToken, async (request, response) => {
  let { username } = request;
  const getFollowerQuery = `
  SELECT
    user.name
  FROM
    (SELECT
      *
    FROM
      follower
    LEFT JOIN user ON user.user_id=follower.following_user_id
    WHERE
     username='${username}')
  LEFT JOIN user ON user.user_id=follower_user_id
  ;`;
  const statesArray = await db.all(getFollowerQuery);
  response.send(statesArray);
});

//api6
app.get("/tweets/:tweetId/", authenticateToken, async (request, response) => {
  let { username } = request;
  const { tweetId } = request.params;
  const getFollowerQuery = `
  SELECT
    *
  FROM
    (SELECT
      tweet,count(like_id) as likes
    FROM
      (SELECT
        *
      FROM
        (SELECT
          *
        FROM
          follower
        LEFT JOIN user ON user.user_id=follower.follower_user_id
        WHERE
         username='${username}')
      LEFT JOIN user ON user.user_id=following_user_id)
    LEFT JOIN tweet ON following_user_id=tweet.user_id
    LEFT JOIN like ON like.tweet_id=tweet.tweet_id
    WHERE
    tweet.tweet_id=${tweetId})
    NATURAL JOIN
    (SELECT
      tweet,count(reply) as replies,tweet.date_time as dateTime
    FROM
      (SELECT
        *
      FROM
        (SELECT
          *
        FROM
          follower
        LEFT JOIN user ON user.user_id=follower.follower_user_id
        WHERE
         username='${username}')
      LEFT JOIN user ON user.user_id=following_user_id)
    LEFT JOIN tweet ON following_user_id=tweet.user_id
    LEFT JOIN reply ON reply.tweet_id=tweet.tweet_id
    WHERE
    tweet.tweet_id=${tweetId})
  ;`;
  const statesArray = await db.all(getFollowerQuery);
  if (statesArray === [] || statesArray.length === 0) {
    response.status(401);
    response.send("Invalid Request");
  } else {
    response.send(statesArray);
  }
});

//api7
app.get(
  "/tweets/:tweetId/likes/",
  authenticateToken,
  async (request, response) => {
    const { tweetId } = request.params;
    let { username } = request;
    const getFollowerQuery = `
  SELECT
    username as likes
  FROM
    (SELECT
      tweet,like_id,like.user_id
    FROM
      (SELECT
        *
      FROM
        (SELECT
          *
        FROM
          follower
        LEFT JOIN user ON user.user_id=follower.follower_user_id
        WHERE
         username='${username}')
      LEFT JOIN user ON user.user_id=following_user_id)
    LEFT JOIN tweet ON following_user_id=tweet.user_id
    LEFT JOIN like ON like.tweet_id=tweet.tweet_id
    WHERE
    tweet.tweet_id=${tweetId}) c
    LEFT JOIN user ON user.user_id=c.user_id
  ;`;
    const statesArray = await db.all(getFollowerQuery);
    if (statesArray === [] || statesArray.length === 0) {
      response.status(401);
      response.send("Invalid Request");
    } else {
      let a = [];
      let c;
      for (let i = 0; i < statesArray.length; i++) {
        a.push(statesArray[i].likes);
        c = { likes: a };
      }
      response.send(c);
    }
  }
);

//api8
app.get(
  "/tweets/:tweetId/replies/",
  authenticateToken,
  async (request, response) => {
    const { tweetId } = request.params;
    let { username } = request;
    const getFollowerQuery = `
  SELECT
    name,reply
  FROM
    (SELECT
      tweet,reply,reply.user_id
    FROM
      (SELECT
        *
      FROM
        (SELECT
          *
        FROM
          follower
        LEFT JOIN user ON user.user_id=follower.follower_user_id
        WHERE
         username='${username}')
      LEFT JOIN user ON user.user_id=following_user_id)
    LEFT JOIN tweet ON following_user_id=tweet.user_id
    LEFT JOIN reply ON reply.tweet_id=tweet.tweet_id
    WHERE
    tweet.tweet_id=${tweetId}) c
    LEFT JOIN user ON user.user_id=c.user_id
  ;`;
    const statesArray = await db.all(getFollowerQuery);
    if (statesArray === [] || statesArray.length === 0) {
      response.status(401);
      response.send("Invalid Request");
    } else {
      let c = { replies: statesArray };
      response.send(c);
    }
  }
);

//9
app.get("/user/tweets/", authenticateToken, async (request, response) => {
  let { username } = request;
  const getFollowerQuery = `
      SELECT
        *
      FROM
        (SELECT
          tweet,COUNT(like_id) as likes
        FROM
          tweet
        LEFT JOIN user ON user.user_id=tweet.user_id
        LEFT JOIN like ON tweet.tweet_id=like.tweet_id
        WHERE
         username='${username}'
        GROUP BY
          tweet.tweet_id)
        NATURAL JOIN
        (SELECT
          tweet,COUNT(reply_id) as replies,tweet.date_time as dateTime
        FROM
          tweet
        LEFT JOIN user ON user.user_id=tweet.user_id
        LEFT JOIN reply ON tweet.tweet_id=reply.tweet_id
        WHERE
         username='${username}'
        GROUP BY
          tweet.tweet_id)
  ;`;
  const statesArray = await db.all(getFollowerQuery);
  response.send(statesArray);
});

//10
app.post("/user/tweets/", authenticateToken, async (request, response) => {
  const { tweet } = request.body;
  const postDistrictQuery = `
  INSERT INTO
    tweet (tweet)
  VALUES
    ('${tweet}');`;
  await db.run(postDistrictQuery);
  response.send("Created a Tweet");
});

//11
app.delete(
  "/tweets/:tweetId/",
  authenticateToken,
  async (request, response) => {
    const { tweetId } = request.params;
    let { username } = request;
    const deleteDistrictQuery = `
  DELETE FROM
    tweet
  WHERE
  tweet.user_id=
  (SELECT
    tweet.user_id
    FROM
    tweet
    LEFT JOIN user on user.user_id=tweet.user_id
    WHERE
    tweet_id = ${tweetId} and
    username='${username}'
    )
  `;
    const getFollowerQuery = `
    SELECT
      *
    FROM
      tweet;`;
    const statesArray1 = await db.all(getFollowerQuery);
    await db.run(deleteDistrictQuery);
    const statesArray2 = await db.all(getFollowerQuery);
    if (statesArray1 !== statesArray2) {
      response.send("Tweet Removed");
    } else {
      response.status(401);
      response.send("Invalid Request");
    }
  }
);

module.exports = app;

