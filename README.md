# Anglit Laam Project

Anglit Laam is the first low cost English school in Israel. They connect students to certified teachers from low-income countries - thus keeping the prices low without sacrificing the quality of the lessons.

They believe that learning English is a basic necessity in this day and age, and having access to quality lessons should not tear a hole in the student's pocket.

We agreed with their goal and looked for a way to help them work better and have an easier time sustaining their business.
Upon sitting with them we saw that most if not all of their processes are done manually - from signing up a new student and setting a new lesson.
The entire business is managed on complex spreadsheets. 

We set a goal to create a system which will serve a single source of truth system for Anglit Laam.
A system that will hold all the information used for the business and organizes it automatically while syncing all the relevant users.
We wanted to automate as much as possible and give some agency to the users themselves without involving Anglit Laam's staff.

This documentation is designed to give a overall look into the the development and structure of this project.
We will cover the the feature and architectural overview of the project, some installation pointers and finally a few words about the development process itself. 

## Feature overview

We have 3 types of users in the system, each with their own features. Here is a list encompassing all the features per user.

#### Student
1) Can see his upcoming lessons.
2) Can set a new lesson.
3) Can cancel an existing lesson.
4) Can see his past lessons and their given feedback.
5) Can edit his contact info.
6) If he is on a recurring subscription - Will get credits upon entering for the first time in each new week.

#### Teacher
1) Can see his schedule - this week, two weeks back and two weeks ahead.
2) Can change the lesson status to `started`, `absent student`. Can also reset the lesson status.
3) Can see all the lessons he needs to give a feedback to.
4) Can start a feedback and save it without submitting it to the student.
5) Can submit a feedback to the student.
6) Can see his student's last given feedback.
7) Can change his contact info.

#### Admin
There are two types of admins: super admins and minor admins.
super admins have access to the firebase console while minor admins do not.
##### Minor Admins
1) Can see all the teachers and students info.
2) Can change a permanent teacher for a student.
3) Can substitute a teacher for a given lesson.
4) Can add credits to students.
5) Can change a student's subscription.
6) Can change the lesson status to `started`, `absent student`. Can also reset the lesson status.
7) Can change a student's or teacher's category.
8) Can edit a student's or teacher's contact info.
##### Super Admins
9) Can delete a student or teacher from the system.
10) Can sign-up a new teacher.
11) Can change the working days of teachers.
* The super admin's capabilities lean on the fact that they can approach the firebase console and authenticate new users as well as change minute details in the database itself.

## Architectural Overview

### Directory Guide

The entire code for this project can be found in the `src` directory.
Within it there are several sub-directories each holding an element of the project.

1) Actions - Holds all the functions used for Authentication and Firestore.
2) assets & Layouts - Holds images and the style code used in the project.
3) Components - Holds all the Components used in the project - we used [Creative-Tim](https://www.creative-tim.com/product/material-dashboard-pro-react) components which we purchased for this project.
4) Config - Hold general configurations including the connection of this app to firebase (fire.js file).
5) Views - Holds all our screens - divided by users to Admin, Student and Teacher as well as the signup and login pages.
6) Common - Holds copyright info - for future use.

Additionally we have the App.js that holds general information and routing rules for the app.


### Database Overview

The basis of this entire app os our Firestore Database.
We used Firestore as it seemed to fit our needs as a fast, easy to update and reliable database. <br/>

Our only concern was the amount of reads and writes that are able to be done each day - we had to plan the data stored on each document carefully.<br/>

Here is an overview of all the collections we used and their connections:
#### users 
A general collection that saves the basic info about the user - this is used mostly to connect each user to the right part of the app.

#### admins
Admins do a lot of complex database manipulations like changing a student's teacher and setting a substitute teacher for a given lesson.
 
Thus the admins keep a mapping of all registered students and teachers in order to save reads and writes as much a possible.

#### students & student_lessons

Each student has it's own document and sub-collection called student_lessons.
The document holds general info about the student like his personal info, teacher and credit status.<br/>

The student_lessons is a collection of the student's past and future lessons (each in the form of a doc).
The lesson docs also contain the feedback given for that lesson as well as his status.

#### teachers & teacher_lessons

Each teacher, like students, has it's own document holding general personal info.<br/>

Each teacher doc has a sub collection of teacher_lessons which holds all the teacher's past and future lessons. 
Each lesson is a doc and contains the feedback for that lesson as well.<br/>

*Note: why did we separate the teacher_lessons and student_lessons sub-collections?*
*- A privacy concern - We did not want to expose the student's personal info to the teacher and vice versa in cases a user wants to get info about a lesson.*
*Also this gives the future option to input extra information on the teacher's side that we do not risk it's exposure for the students.* 

## Installation and Usage
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

In the project directory, you can run:

### `npm install`

This will install the the required packages and components used for this project.
Any addition of new packages will be accompanied by additional run of this command.

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

### `firebase deploy`

After a build runs - we use [firebase to deploy](https://firebase.google.com/docs/hosting/deploying) a new version of this system.
This deployment already creates a web address which uses SSL certification built in. 

## Development Overview

We used GitHub to manage our project - using issues to document all the existing assignments and bugs we had.
We split our responsibilities between the group members by these general guidelines:<br/>

Roy - Took the DB aspects: design, creation and functions.
Netanel - Took responsibility on routing and authentication.
Yuval - Was our main contact to Anglit Laam - getting all the information from them, getting their needs and running all design choices by them.

We all took part in UI and UX design.

Originally we took an approach of a user-oriented development - meaning we thought of users as a self contained element that needs his own features and design.
As time passed we ran into some issues with that development approach:
* The flow of information is depended between users - looking from only a single perspective posed a challenge.
* We could not test some features because of lack of design on a different user (mostly students and teachers).

We changed our approach to be more feature oriented and redesigned our process around it in 4 phases:
1) Lessons - The main feature of the system - letting students set their own lessons and handling it on the teacher's side as well.
2) Feedback - A lesson has a feedback - we wanted to create a simple flow of submitting feedback and reading it.
3) Complex features - mainly the Credit system and the Admin capabilities.
4) Bugs, Improvements and Nice To Haves- Additional development on things we put off in order to make the system the best that we could.

We wanted to finish (1-2) to milestone 2, (3) to milestone 3 and (4) for the final submission and we did exactly that.

## Contact Info
Yuval - 0524477032<br/>
Roy - 0547505893<br/>
Netanel - 0508439005
