const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();
//Define Display messages

const HTTP_PORT = 8080;
const collegeData = require("./modules/collegeData.js");
// Adjust the path as needed.

// Middleware to parse cookies
app.use(cookieParser());

// Middleware to handle a custom request property
app.use((req, res, next) => {
  console.log("Handling request");
  req.fromMiddleware = "Hello From Middleware!";
  next();
});

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Define route for the root URL "/"
app.get("/", (req, res) => {
  // This route serves HTML from "home.html"
  console.log(req.fromMiddleware);
  res.sendFile(path.join(__dirname, "views/home.html"));
});

// Define route for "/about"
app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/about.html"));
});

app.get("/htmlDemo", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/htmlDemo.html"));
});

app.get("/students/add", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/addStudent.html"));
});

//Route for getting all students or students for a given course.
app.get("/students", async (req, res) => {
  try {
    if (req.query.course) {
      //convert query string value to integer and store it in course variable
      var course = parseInt(req.query.course);
      //Get students with matching course id by calling getStudentsByCourse from collegeData.
      var students = await collegeData.getStudentsByCourse(course);
      if (students && students.length > 0) {
        res.json(students);
      } else {
        res.json({ message: noResultMessage });
      }
    } else {
      // Get all students by calling getAllStudents function from collegeData.
      const students = await collegeData.getAllStudents();
      if (students && students.length > 0) {
        res.json(students);
      } else {
        res.json({ message: noResultMessage });
      }
    }
  } catch (err) {
    //Check if the error is promise rejection message and then return no results message.
    if (err === promiseRejectionMessage) {
      res.json({ message: noResultMessage });
    } else {
      console.error(err);
      res.status(500).json({ message: internalErrorMessage });
    }
  }
});
//Route for getting TAs with async support
app.get("/tas", async (req, res) => {
  try {
    //Get all TAs using getTAs function from collegeData module (rejections due to empty or undefined is handld in catch block)
    //This else block is added as a safety fallback to ensure a response in sent any situation
    const TAs = await collegeData.getTAs();
    if (TAs && TAs.length > 0) {
      res.json(TAs);
    } else {
      res.json({ message: noResultMessage });
    }
  } catch (err) {
    //Check if the error is promise rejection message and then return no results message.
    if (err === promiseRejectionMessage) {
      res.json({ message: noResultMessage });
    } else {
      console.error(err);
      res.status(500).json({ message: internalErrorMessage });
    }
  }
});

//Route for getting all courses
app.get("/courses", async (req, res) => {
  try {
    //Get all course using getCourses from collegeData module.
    const courses = await collegeData.getCourses();
    if (courses && courses.length > 0) {
      res.json(courses);
    } else {
      res.json({ message: noResultMessage });
    }
  } catch (err) {
    //Check if the error is promise rejection message and then return no results message.
    if (err === promiseRejectionMessage) {
      res.json({ message: noResultMessage });
    } else {
      console.error(err);
      res.status(500).json({ message: internalErrorMessage });
    }
  }
});

// Route for getting student for a given studentNum
app.get("/student/:num", async (req, res) => {
  try {
    //read the request parameter string and store in a variable after converting it to int
    const num = parseInt(req.params.num);
    //Get student for the given studentNum by calling getStudentByNum function from collegeData.
    const matchedStudent = await collegeData.getStudentByNum(num);
    if (matchedStudent) {
      res.json(matchedStudent);
    } else {
      res.json({ message: noResultMessage });
    }
  } catch (err) {
    //Check if the error is promise rejection message and then return no results message.
    if (err === promiseRejectionMessage) {
      res.json({ message: noResultMessage });
    } else {
      console.error(err);
      res.status(500).json({ message: internalErrorMessage });
    }
  }
});

//Route for adding student to the student array
app.post("/students/add", async (req, res) => {
  try {
    // Call the addStudent function with req.body as the parameter
    const createdStudent = await collegeData.addStudent(req.body);

    // Redirect to the "/students" route after successful addition
    res.redirect("/students");
  } catch (error) {
    // Handle any errors here, e.g., send an error response or redirect to an error page
    res.status(500).json({ message: "Error adding student" });
  }
});
collegeData
  .initialize()
  .then(() => {
    // Start the server
    app.listen(HTTP_PORT, () => {
      console.log(`Server is running on port ${HTTP_PORT}`);
    });
  })
  .catch((err) => {
    console.error(`Error initializing data: ${err}`);
    // Optionally,.
  });
