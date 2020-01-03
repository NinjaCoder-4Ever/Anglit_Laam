import {db} from '../Config/fire'

const WEEKDAYS = {
    0: 'Sunday',
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday'
};

db.settings({ timestampsInSnapshots: true });
/// ############################# USERS FUNCTIONS #######################################

// enters a new student to students collection and the users collection
// will also choose a teacher for the student and add the student to the teachers student list
export async function setNewStudent(uid, email, firstName, lastName, phoneNumber){
    let newStudentData = {
        email: email,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        lessons_this_month:[],
        subscription: 'PAL',
        teacher: {},
        credits: 1,
        uid: uid,
    };

    let teacherInfo = await chooseTeacherForStudent(email);
    newStudentData.teacher = {
        first_name: teacherInfo.first_name,
        last_name: teacherInfo.last_name,
        email: teacherInfo.email
    };

    let usersData = {
        email: email,
        collection: "students",
        uid: uid
    } ;

    Promise.all([
        db.collection('students').doc(email).set(newStudentData).then(function() {
            console.log('Added student with ID: ', email)
        }),
        db.collection('users').doc(email).set(usersData).then(function () {
            console.log('Added user to users collection')
        })
    ]);
}

export async function getStudedntTeacher(student_mail) {
    let teacherInfo = [];
    db.collection('students').doc(student_mail).get().then(function (doc) {
        teacherInfo.push(doc.data().teacher)
    });

    return teacherInfo[0]
}

// gets a student data by mail.
export async function getStudentByMail(email) {
    const values = [];
    const collectionRef = db.collection('students');
    await collectionRef.doc(email).get().then(function(doc){
        values.push(doc.data())
    });
    console.log(values[0]);
    return values[0]
}

// enters a new teacher to teachers collection and users collection
export function setNewTeachers(uid, email, firstName, lastName, phoneNumber, location, working_hours){
    let newTeacherData = {
        email: email,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        lessons_this_week:{
            'Sunday': {},
            'Monday': {},
            'Tuesday': {},
            'Wednesday': {},
            'Thursday': {},
            'Friday': {},
            'Saturday': {}
        },
        uid: uid,
        students: [],
        location: location,
        working_hours: working_hours
    };

    let usersData = {
        email: email,
        collection: "teachers",
        uid: uid
    };

    Promise.all([
        db.collection('teachers').doc(email).set(newTeacherData).then(function() {
            console.log('Added teacher with ID: ', email)
        }),
        db.collection('users').doc(email).set(usersData).then(function () {
            console.log('Added user to users collection')
        })
    ]);
}

// gets the user's collection doc data
// return value looks like so: {email: X, uid: Y, collection: Z}
export async function getUserData(email) {
    let returnVal = [];
    db.collection('users').doc(email).get().then(function (doc) {
        returnVal.push(doc.data())
    });
    return returnVal[0]
}

// gets teacher data from teachers collection.
export async function getTeacherByMail(email) {
    const values = [];
    const collectionRef = db.collection('teachers');
    await collectionRef.doc(email).get().then(function(doc){
        values.push(doc.data())
    });
    console.log(values[0]);
    return values[0]
}

// get all the values from a given collection where the given field has the given value.
export async function lookup(collection, field, value) {
    const values = [];
    const collectionRef = db.collection(collection);
    await collectionRef.where(field, '==', value).get().then(function (snapshot) {
       snapshot.docs.forEach(doc =>{
           values.push(doc.data())
       })
    });

    return values
}

// update the amount of credits the student has.
export async function updateCredits(email, addedCredits) {
    const currentCreditValue = [];
    const collectionRef = db.collection('students');
    await collectionRef.doc(email).get().then(function (doc) {
        currentCreditValue.push(doc.data().credits)
    });

    await collectionRef.doc(email).update({
        "credits": currentCreditValue[0] + addedCredits
    }).then(function () {
       console.log('Updated credit status!')
    });
}

// adds a student's mail to the teacher's student array.
export async function addStudentToTeacher(teacherMail, studentMail){
    const fullStudentList = [studentMail];
    const collectionRef = db.collection('teachers');
    await collectionRef.doc(teacherMail).get().then(function (doc) {
        fullStudentList.concat(doc.data().students)
    });

    await collectionRef.doc(teacherMail).update({
        "students": fullStudentList
    }).then(function () {
        console.log("teacher's student list updated")
    });
}

// goes through all existing teachers and chooses the one with the least amount of students.
export async function chooseTeacherForStudent(studentMail) {
    const chosenTeacher = [];
    const teacherCollection = db.collection('teachers');
    await teacherCollection.get().then(function (querySnapshot) {
        let minimalStudents = 10000000000000000000;
        querySnapshot.forEach(doc => {
            let studentArray = doc.data().students;
            let numberOfStudents = studentArray.length;
            if (numberOfStudents <= minimalStudents) {

                if (chosenTeacher.length > 0){
                    chosenTeacher.pop();
                }

                chosenTeacher.push(doc.data());
                minimalStudents = numberOfStudents;
            }
        })
    });

    await addStudentToTeacher(chosenTeacher[0].email, studentMail);
     return {
        email: chosenTeacher[0].email,
        first_name: chosenTeacher[0].first_name,
        last_name: chosenTeacher[0].last_name
    }
}

// update a teacher's working hours
// working hours has the following structure:
// {Sunday: {from: XX:XX, to: XX:XX, working: True}, Monday: {from: '', to: '', working: False}....}
export async function updateTeacherWorkingHours(email,working_hours) {
    const collectionRef = db.collection('teachers');
    collectionRef.doc(email).update({
        working_hours: working_hours
    }).then(function () {
        console.log("updated teachers working hours");
    });
}

// ################################# LESSON FUNCTIONS #####################################


function constructLessonId(student_mail, teacher_mail, date_utc_time){
    return student_mail + "_" + teacher_mail + "_" + date_utc_time
}

// gets a dateUtcTime in ISO format and returns a local time string.
function convertUtcToLocalTime(dateUtcTime){
    var localDate = new Date(dateUtcTime).toString();
    return localDate
}

// gets a local time string and converts it to utc ISO format string.
function convertLocalTimeToUtc(localTimeDate){
    var dateUtcTime = new Date(localTimeDate).toISOString();
    return dateUtcTime
}

export async function getThisMonthLessonsStudent(email){
    const thisMontLessons = [];
    const collectionRef = db.collection('students');
    await collectionRef.doc(email).get().then(function (doc) {
        let lessons = doc.data().lessons_this_month;
        let i;
        for (i = 0; i<lessons.length; i++){
            let lesson = lessons[i];
            lesson.local_time = convertUtcToLocalTime(lesson.date_utc.full_date);
            thisMontLessons.push(lesson)
        }
    });

    return thisMontLessons
}

export async function getThisWeekLessonsTeacher(email) {
    const lessonsThisWeek = [];
    const collectionRef = db.collection('teachers');
    await collectionRef.doc(email).get().then(function (doc) {
        let lessons = doc.data().lessons_this_week;
        let i;
        for (i = 0; i < lessons.length; i++){
            let lesson = lessons[i];
            lesson.local_time = convertUtcToLocalTime(lesson.date_utc.full_date);
            lessonsThisWeek.push(lesson)
        }
    });

    return lessonsThisWeek
}

export async function getAllPastLessonsForStudent(email){
    const pastLessons = [];
    const collectionRef = db.collection('students').doc(email).collection('student_lessons');
    let today = new Date().toISOString();
    await collectionRef.where('date_utc', '<=', today).get().then(function(snapshot){
       snapshot.forEach(doc =>{
           let lessonData = doc.data();
           lessonData.local_time = convertUtcToLocalTime(lessonData.date_utc.full_date);
           pastLessons.push(lessonData)
       })
    });

    return pastLessons
}

export async function getStudentsPastFeedbackssForTeacher(teacher_mail, student_mail){
    const pastFeedbacks = [];
    const collectionRef = db.collection('teachers').doc(teacher_mail).collection('teacher_lessons');
    await collectionRef.where('student_mail', '==', student_mail)
        .where('feedback_given', '==', true).get().then(function (snapshot) {
           snapshot.forEach(doc =>{
               let lessonData = doc.data();
               lessonData.local_time = convertUtcToLocalTime(lessonData.date_utc.full_date);
               pastFeedbacks.push(lessonData)
           })
        });

    return pastFeedbacks
}

export async function getFeedbackNecessaryLessonsForTeacher(teacher_mail) {
    const futureFeedbacks = [];
    const collectionRef = db.collection('teachers').doc(teacher_mail).collection('teacher_lessons');
    await collectionRef.where('feedback_given', '==', false)
        .where('started', '==', true).get().then(function (snapshot) {
            snapshot.forEach(doc =>{
                let lessonData = doc.data();
                lessonData.local_time = convertUtcToLocalTime(lessonData.date_utc.full_date);
                futureFeedbacks.push(lessonData)
            })
        });

    return futureFeedbacks
}

export function setFeedbackForLesson(feedback, lesson_id, teacher_mail, student_mail){
    const studentLessons = db.collection('students').doc(student_mail).collection('student_lessons');
    const teacherLessons = db.collection('teachers').doc(teacher_mail).collection('teacher_lessons');

    studentLessons.doc(lesson_id).update({
        "feedback": feedback,
        "feedback_given": true
    }).then(function () {
        console.log("Feedback updated for student")
    });

    teacherLessons.doc(lesson_id).update({
        "feedback": feedback,
        "feedback_given": true
    }).then(function () {
        console.log("Feedback updated for teacher")
    });
}

export function setLessonStarted(lesson_id, teacher_mail, student_mail){
    const studentLessons = db.collection('students').doc(student_mail).collection('student_lessons');
    const teacherLessons = db.collection('teachers').doc(teacher_mail).collection('teacher_lessons');

    studentLessons.doc(lesson_id).update({
        "started": true
    }).then(function () {
        console.log("Lesson started status updated for student")
    });

    teacherLessons.doc(lesson_id).update({
        "started": true
    }).then(function () {
        console.log("Lesson started status updated for teacher")
    });
}


export function setLessonNoShow(lesson_id, teacher_mail, student_mail){
    const studentLessons = db.collection('students').doc(student_mail).collection('student_lessons');
    const teacherLessons = db.collection('teachers').doc(teacher_mail).collection('teacher_lessons');

    studentLessons.doc(lesson_id).update({
        "no_show": true
    }).then(function () {
        console.log("Lesson no show status updated for student")
    });

    teacherLessons.doc(lesson_id).update({
        "no_show": true
    }).then(function () {
        console.log("Lesson no show status updated for teacher")
    });
}

export async function getLessonByDateForStudent(student_mail, local_date, teacher_mail=null){
    let lessonData = [];
    if (teacher_mail == null){
        teacher_mail = getStudedntTeacher(student_mail).email;
    }
    let lesson_id = constructLessonId(student_mail, teacher_mail, convertLocalTimeToUtc(local_date));
    const studentLessons = db.collection('students').doc(student_mail).collection('student_lessons');
    await studentLessons.doc(lesson_id).get().then(function (doc) {
        lessonData.push(doc.data())
    });

    return lessonData[0]
}

function applyTimezoneoffset(localTimeString){
    let localTimeHours = parseInt(localTimeString.split(':')[0]);
    let localTimeMinutes = parseInt(localTimeString.split(':')[1]);
    let offsetInHours = (new Date().getTimezoneOffset() / 60).toString();
    let offsetHours = parseInt(offsetInHours.split('.')[0]);
    let utcHours = localTimeHours + offsetHours;
    let utcMin = localTimeMinutes;
    if ('-' === offsetInHours.slice(0,1)){
        if (utcHours < 0){
            utcHours = 24 + offsetHours;
        }
        if (offsetInHours.split('.').length === 2) {
            let offsetMin = parseInt(offsetInHours.split('.')[1]) * 60;
            utcMin = localTimeMinutes - offsetMin;
            if (utcMin < 0){
                utcMin = 60 - offsetMin;
                utcHours = utcHours - 1;
            }
        }
    }
    else {
         if (utcHours > 23){
             utcHours = offsetHours - 1;
         }
         if (offsetInHours.split('.').length === 2) {
            let offsetMin = parseInt(offsetInHours.split('.')[1]) * 60;
            utcMin = localTimeMinutes + offsetMin;
            if (utcMin > 59){
                utcMin = utcMin - 60;
                utcHours = utcHours + 1;
            }
        }

    }
    utcHours = utcHours.toString();
    utcMin = utcMin.toString();
    if (utcHours.length === 1){
        utcHours = "0" + utcHours;
    }
    if (utcMin.length === 1){
        utcMin = "0" + utcMin;
    }
    return utcHours + ":" + utcMin
}


async function constructTeacherWorkingHours(weekday, teacher_mail) {
    let startTime = [];
    let endTime = [];
    await db.collection('teachers').doc(teacher_mail).get().then(function(doc){
        let working_hours = doc.data().working_hours;
        if (working_hours[weekday].working === true){
            startTime.push(applyTimezoneoffset(working_hours[weekday].from));
            endTime.push(applyTimezoneoffset(working_hours[weekday].to));
        }
        else {
            startTime.push("00:00");
            endTime.push("00:00");
        }
    });

    let continueCreation = true;
    let totalSchedule = startTime;
    while (continueCreation){
        let currentTime = totalSchedule[-1];
        if (currentTime === endTime[0]){
            continueCreation = false;
        }
        else{
            if (currentTime.split(':')[1] === "30"){
                let nextTime = (parseInt(currentTime.split(':')[0]) + 1).toString();
                if (nextTime.length === 1){
                    nextTime = "0" + nextTime;
                }
                nextTime = nextTime + ":00";
                totalSchedule.push(nextTime)
            }
            else {
                let nextTime = currentTime.split(':')[0] + ":30";
                totalSchedule.push(nextTime)
            }
        }
    }

    return totalSchedule.slice(0,-1)
}

function getFreeTime(fullSchedule, busyTime) {
    let freeTime = {};
    let i;
    for (i = 0; i < fullSchedule.length; i++){
        // if the time is already marked as busy continue to next element.
        if (fullSchedule[i] === "busy"){
            continue
        }
        // if time is not marked as busy check if a class is already scheduled there
        if (Object.keys(busyTime).includes(fullSchedule[i]) === true){
            // if a lesson is scheduled check if it 30 min or 60 min
            if (busyTime[fullSchedule[i]] === 30){
                // if only 30 min this only the current time is not available
                fullSchedule[i] = "busy";
            }
            else {
                // if not then the lesson is 60 min and then the next half hour is also busy
                fullSchedule[i] = "busy";
                fullSchedule[i+1] = "busy"
            }
        }
        else {
            // if no lesson is scheduled than add it to the free time map with available time of 30 min
            freeTime[fullSchedule[i]] = [30];
            // if this is the last half hour of the day only 30 min class is available
            if (i !== fullSchedule.length-1){
                // if this is not the last 30 min of the day check if the next half hour is free
                if (Object.keys(busyTime).includes(fullSchedule[i+1]) === false){
                    // if the next half hour is free add the option for 60 min lesson
                    freeTime[fullSchedule[i]].push(60)
                }
            }
        }
    }
    // this will return a map looking like so:
    // {free_time:[30, 60]} where free time is the free time that day and the array is how long is the teacher free at that time.

    return freeTime
}

function convertFreeTimeToLocalTime(freeTimeInUTC, utcDay, utcMonth, utcYear) {
    let freeTimeInLocalTime = {};
    let utcFullDate = utcYear + "-" + utcMonth + "-" + utcDay;
    let i;
    for (i = 0; Object.keys(freeTimeInUTC).length; i++){
        let utcTime = Object.keys(freeTimeInUTC)[i];
        // construct ISO format UTC time.
        let fullUtcDateWithTime = utcFullDate + "T" + utcTime + ":00.000Z";
        // convert to local time
        let localFullDateTime = convertUtcToLocalTime(fullUtcDateWithTime);
        // take only time (without the date nor the milliseconds and timezone offset
        let localTimeOnly = localFullDateTime.split(" ")[4].slice(0, 5);
        freeTimeInLocalTime[localTimeOnly] = freeTimeInUTC[utcTime];
    }

    return freeTimeInLocalTime
}

export async function getTeacherFreeTimeInDate(teacher_mail, date_in_student_local_time) {
    let busyTime = {};
    let localDate = new Date(date_in_student_local_time);
    let dayOfWeek = WEEKDAYS[localDate.getUTCDay()];
    let utcDateDay = localDate.getUTCDate();
    let utcMonth = localDate.getUTCMonth() + 1;
    let utcYear = localDate.getUTCFullYear();
    let fullSchedule = await constructTeacherWorkingHours(dayOfWeek, teacher_mail);
    const teacherLessons = db.collection('teachers').doc(teacher_mail).collection('teacher_lessons');
    await teacherLessons.where('date_utc.day', '==', utcDateDay)
        .where('date_utc.month', '==', utcMonth).where('date_utc.year', '==', utcYear)
        .get().then(function (snapshot) {
            snapshot.forEach(doc =>{
                busyTime[doc.data().date_utc.time] = doc.data().duration
            })
        });

    let freeTime = getFreeTime(fullSchedule, busyTime);
    // will return a map looking like so:
    // {free_time: [possible duration (30, 60)]
    //the free time will be in the local time.
    return convertFreeTimeToLocalTime(freeTime, utcDateDay, utcMonth, utcYear)
}




