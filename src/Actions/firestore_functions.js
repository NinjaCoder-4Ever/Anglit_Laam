import {db} from '../Config/fire'
import student from "../Views/Student/student";

const WEEKDAYS = {
    0: 'Sunday',
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday'
};
const LEAP_YEAR = 2020;
const MONTH_DAYS = {
    1: 31,
    2: 28,
    3: 31,
    4: 30,
    5: 31,
    6: 30,
    7: 31,
    8: 31,
    9: 30,
    10: 31,
    11: 30,
    12:31
};

db.settings({ timestampsInSnapshots: true });
/// ############################# USERS FUNCTIONS #######################################

export async function setNewStudent(uid, email, firstName, lastName, phoneNumber){
    /**
     *Function enters a new student to the "students" collection.
     * Chooses a teacher for the student (the one with least students)
     * Also adds the student to "users" collection.
     */
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

export async function getStudentTeacher(student_mail) {
    /**
     * Function gets the teacher's info, for a given student (by mail).
     *
     * Returns teachers info: {first_name: *, last_name: *, email: *}
     */
    let teacherInfo = [];
    await db.collection('students').doc(student_mail).get().then(function (doc) {
        teacherInfo.push(doc.data().teacher)
    });

    return teacherInfo[0]
}

export async function getStudentByMail(email) {
    /**
     * Function gets all the student's data by searching it's mail.
     *
     * Returns mapping of all student's info.
     * {
        email: email,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        lessons_this_month:[],
        subscription: 'PAL',
        teacher: {first_name: *, last_name: *, email: *},
        credits: 1,
        uid: uid,
    }
     */
    const values = [];
    const collectionRef = db.collection('students');
    await collectionRef.doc(email).get().then(function(doc){
        values.push(doc.data())
    });
    console.log(values[0]);
    return values[0]
}

export function setNewTeachers(uid, email, firstName, lastName, phoneNumber, working_hours){
    /**
     * Function enters a new teacher to the "teachers" collection.
     * Also enters the teacher to the "users" collection.
     */
    working_hours = convertWorkingHoursToUTCTime(working_hours);
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

export async function getUserData(email) {
    /**
     * Function gets the data about a given user from the "users" collection.
     *
     * Returns {collection: *, email: *, uid: *}
     */
    let returnVal = [];
    await db.collection('users').doc(email).get().then(function (doc) {
        returnVal.push(doc.data())
    });
    return returnVal[0]
}

export async function getUerDataByUid(uid) {
    /**
     * Function gets the user data from "users" collection by the uid of the user.
     *
     * Returns {collection: *, email: *, uid: *}
     */
    let returnVal = [];
    await db.collection('users').where('uid', '==', uid).get().then(function (snapshot) {
        snapshot.forEach(doc =>{
            returnVal.push(doc.data())
        })
    });
    return returnVal[0]
}

export async function getTeacherByMail(email) {
    /**
     * Function returns the teacher's data from "teachers" collection by mail.
     *
     * Returns: {
        email: email,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        lessons_this_week:{
            'Sunday': {lesson_id:{lesson_info}},
            'Monday': {},
            'Tuesday': {},
            'Wednesday': {},
            'Thursday': {},
            'Friday': {},
            'Saturday': {}
        },
        uid: uid,
        students: [student_mail],
        working_hours: {"Sunday": {
            from: "12:00",
            to: "21:00",
            working: true
        }...}
    };
     */
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
    /**
     * Function is a general lookup function: looks for all the docs that have "value" in "field" in a given
     * "collection"
     *
     * Returns and array of docs data.
     */
    const values = [];
    const collectionRef = db.collection(collection);
    await collectionRef.where(field, '==', value).get().then(function (snapshot) {
       snapshot.docs.forEach(doc =>{
           values.push(doc.data())
       })
    });

    return values
}

export async function updateCredits(email, addedCredits) {
    /**
     * Function updates the amount of credits a student has.
     */
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

export async function addStudentToTeacher(teacherMail, studentMail){
    /**
     * Function adds a student mail to the teacher's student array
     */
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

export async function chooseTeacherForStudent(studentMail) {
    /**
     * Function goes through all the teachers in the "teachers" collection and and brings back the info about
     * the teacher with the least amount of students.
     *
     * Returns teacher info: {first_mail: *, last_mail: *, email: *}
     */
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

function convertWorkingHoursToUTCTime(working_hours){
    /**
     * Convert working hours from local time to utc time.
     *
     * Returns: {Sunday: {from: XX:XX, to: XX:XX, working: True}, Monday: {from: '', to: '', working: False}....}
     * where the times listed are in utc.
     */
    let i;
    for (i=0; i<7; i++){
        let day_data = working_hours[WEEKDAYS[i]];
        if (day_data.working) {
            day_data.from = applyTimezoneoffset(day_data.from);
            day_data.to = applyTimezoneoffset(day_data.to);
        }
        working_hours[WEEKDAYS[i]] = day_data;
    }
    return working_hours
}


export async function updateTeacherWorkingHours(email,working_hours) {
    /**
     * Function updates the teacher's working_hours fields.
     * working_hours field should have the following structure:
     * {Sunday: {from: XX:XX, to: XX:XX, working: True}, Monday: {from: '', to: '', working: False}....}
     */
    working_hours = convertWorkingHoursToUTCTime(working_hours);
    const collectionRef = db.collection('teachers');
    collectionRef.doc(email).update({
        working_hours: working_hours
    }).then(function () {
        console.log("updated teachers working hours");
    });
}

// ################################# LESSON FUNCTIONS #####################################


function constructLessonId(student_mail, teacher_mail, date_utc_time){
    /**
     * Function returns a valid lesson id.
     *
     * Example: student@mail.com_teache@mail.com_2020-01-04T12:00:00.000Z
     */
    return student_mail + "_" + teacher_mail + "_" + date_utc_time
}

function convertUtcToLocalTime(dateUtcTime){
    /**
     * Function converts ISO format UTC time string to local time string
     *
     * Returns: "Sat Jan 04 2020 16:40:29 GMT+0200 (שעון ישראל (חורף)) "
     */
    var localDate = new Date(dateUtcTime).toString();
    return localDate
}

// gets a local time string and converts it to utc ISO format string.
function convertLocalTimeToUtc(localTimeDate){
    /**
     * Function gets a local date string and converts it to ISO format in UTC time.
     *
     * Returns: "2020-01-04T12:00:00.000Z"
     */
    var dateUtcTime = new Date(localTimeDate).toISOString();
    return dateUtcTime
}

export async function getThisMonthLessonsStudent(email){
    /**
     * Function returns all the lessons a student has in this current month.
     *
     * Returns Array of lessons data: {
        teacher_mail: teacher_mail,
        student_mail: student_mail,
        duration: duration,
        date_utc: {
            year: lessonDate.getUTCFullYear(),
            month: lessonDate.getUTCMonth() + 1,
            day: lessonDate.getUTCDate(),
            time: lessonDate.getHours().toString() + ":" + lessonDate.getUTCMinutes().toString(),
            full_date: new Date(utcLessonDate),
            full_date_string: utcLessonDate
        },
        local_time: local_time_string,
        feedback: {
            fields: "None"
        },
        started: false,
        feedback_given: false,
        no_show: false,
        lesson_id: lesson_id
    }
     */
    const thisMontLessons = [];
    const collectionRef = db.collection('students');
    await collectionRef.doc(email).get().then(function (doc) {
        let lessons = doc.data().lessons_this_month;
        let i;
        for (i = 0; i<lessons.length; i++){
            let lesson = lessons[i];
            lesson.local_time = convertUtcToLocalTime(lesson.date_utc.full_date_string);
            thisMontLessons.push(lesson)
        }
    });

    return thisMontLessons
}

export async function getThisWeekLessonsTeacher(email) {
    /**
     * Function returns the lessons a teacher has this week.
     *
     * Returns an array of lesson info: {
        teacher_mail: teacher_mail,
        student_mail: student_mail,
        duration: duration,
        date_utc: {
            year: lessonDate.getUTCFullYear(),
            month: lessonDate.getUTCMonth() + 1,
            day: lessonDate.getUTCDate(),
            time: lessonDate.getHours().toString() + ":" + lessonDate.getUTCMinutes().toString(),
            full_date: new Date(utcLessonDate),
            full_date_string: utcLessonDate
        },
        local_time: local_time_string,
        feedback: {
            fields: "None"
        },
        started: false,
        feedback_given: false,
        no_show: false,
        lesson_id: lesson_id
    }
     */
    const lessonsThisWeek = [];
    const collectionRef = db.collection('teachers');
    await collectionRef.doc(email).get().then(function (doc) {
        let lessons = doc.data().lessons_this_week;
        let i;
        for (i = 0; i < lessons.length; i++){
            let lesson = lessons[i];
            lesson.local_time = convertUtcToLocalTime(lesson.date_utc.full_date_string);
            lessonsThisWeek.push(lesson)
        }
    });

    return lessonsThisWeek
}

export async function getAllPastLessonsForStudent(email){
    /**
     * Gets all the past lessons of a given student.
     * {
        teacher_mail: teacher_mail,
        student_mail: student_mail,
        duration: duration,
        date_utc: {
            year: lessonDate.getUTCFullYear(),
            month: lessonDate.getUTCMonth() + 1,
            day: lessonDate.getUTCDate(),
            time: lessonDate.getHours().toString() + ":" + lessonDate.getUTCMinutes().toString(),
            full_date: new Date(utcLessonDate),
            full_date_string: utcLessonDate
        },
        local_time: local_time_string
        feedback: {
            fields: "None"
        },
        started: false,
        feedback_given: false,
        no_show: false,
        lesson_id: lesson_id
    }
     */
    const pastLessons = [];
    const collectionRef = db.collection('students').doc(email).collection('student_lessons');
    let today = new Date().toISOString();
    await collectionRef.where('date_utc.full_date', '<=', today).get().then(function(snapshot){
       snapshot.forEach(doc =>{
           let lessonData = doc.data();
           lessonData.local_time = convertUtcToLocalTime(lessonData.date_utc.full_date_string);
           pastLessons.push(lessonData)
       })
    });

    return pastLessons
}

export async function getStudentsPastFeedbackssForTeacher(teacher_mail, student_mail){
    /**
     * Function returns all the past lessons a teacher had given a given student where a feedback was given.
     * Returns: and array of {
        teacher_mail: teacher_mail,
        student_mail: student_mail,
        duration: duration,
        date_utc: {
            year: lessonDate.getUTCFullYear(),
            month: lessonDate.getUTCMonth() + 1,
            day: lessonDate.getUTCDate(),
            time: lessonDate.getHours().toString() + ":" + lessonDate.getUTCMinutes().toString(),
            full_date: new Date(utcLessonDate),
            full_date_string: utcLessonDate
        },
        local_time: local_time_string,
        feedback: {
            fields: "None"
        },
        started: true,
        feedback_given: true,
        no_show: false,
        lesson_id: lesson_id
    }
     */
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
    /**
     * Function returns all the teacher's lessons which occurred but a feedback was not given.
     *
     * Returns an array of: {
        teacher_mail: teacher_mail,
        student_mail: student_mail,
        duration: duration,
        date_utc: {
            year: lessonDate.getUTCFullYear(),
            month: lessonDate.getUTCMonth() + 1,
            day: lessonDate.getUTCDate(),
            time: lessonDate.getHours().toString() + ":" + lessonDate.getUTCMinutes().toString(),
            full_date: new Date(utcLessonDate),
            full_date_string: utcLessonDate
        },
        local_time: local_time_string,
        feedback: {
            fields: "None"
        },
        started: true,
        feedback_given: false,
        no_show: false,
        lesson_id: lesson_id
    }
     */
    const futureFeedbacks = [];
    const collectionRef = db.collection('teachers').doc(teacher_mail).collection('teacher_lessons');
    await collectionRef.where('feedback_given', '==', false)
        .where('started', '==', true).get().then(function (snapshot) {
            snapshot.forEach(doc =>{
                let lessonData = doc.data();
                lessonData.local_time = convertUtcToLocalTime(lessonData.date_utc.full_date_string);
                futureFeedbacks.push(lessonData)
            })
        });

    return futureFeedbacks
}

export function setFeedbackForLesson(feedback, lesson_id, teacher_mail, student_mail){
    /**
     * Function sets a feedback to a given lesson both in student_lessons collection and teacher_lessons collection.
     */
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
    /**
     * Function sets a lesson status to "started" in both student_lessons and teacher_lessons collections.
     */
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
    /**
     * Function sets a lesson status to "no_show" in both student_lessons and teacher_lessons collections.
     */
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
    /**
     * Function returns the lesson data of a lesson in a given date.
     * Returns: {
        teacher_mail: teacher_mail,
        student_mail: student_mail,
        duration: duration,
        date_utc: {
            year: lessonDate.getUTCFullYear(),
            month: lessonDate.getUTCMonth() + 1,
            day: lessonDate.getUTCDate(),
            time: lessonDate.getHours().toString() + ":" + lessonDate.getUTCMinutes().toString(),
            full_date: new Date(utcLessonDate),
            full_date_string: utcLessonDate
        },
        local_time: local_time_string,
        feedback: {
            fields: "None"
        },
        started: true,
        feedback_given: true,
        no_show: false,
        lesson_id: lesson_id
    }
     */
    let lessonData = [];
    if (teacher_mail == null){
        teacher_mail = getStudentTeacher(student_mail).email;
    }
    let lesson_id = constructLessonId(student_mail, teacher_mail, convertLocalTimeToUtc(local_date));
    const studentLessons = db.collection('students').doc(student_mail).collection('student_lessons');
    await studentLessons.doc(lesson_id).get().then(function (doc) {
        lessonData.push(doc.data())
    });

    return lessonData[0]
}

function applyTimezoneoffset(localTimeString){
    /**
     * Function converts a time only string ("14:00") to UTC time.
     * meaning if the local time offset is "+2 GMT" and the function is given "14:00"
     * it will return "12:00" - the time in UTC time.
     */
    let localTimeHours = parseInt(localTimeString.split(':')[0]);
    let localTimeMinutes = parseInt(localTimeString.split(':')[1]);
    let offsetInHours = (new Date().getTimezoneOffset() / 60).toString();
    let offsetHours = parseInt(offsetInHours.split('.')[0]);
    let utcHours = localTimeHours + offsetHours;
    let utcMin = localTimeMinutes;
    if ('-' === offsetInHours.slice(0,1)){
        if (offsetInHours.split('.').length === 2) {
            let offsetMin = parseInt(offsetInHours.split('.')[1]) * 60;
            utcMin = localTimeMinutes - offsetMin;
            if (utcMin < 0){
                utcMin = 60 - offsetMin;
                utcHours = utcHours - 1;
            }
        }
        if (utcHours < 0){
            utcHours = 24 + offsetHours;
        }
    }
    else {
         if (offsetInHours.split('.').length === 2) {
            let offsetMin = parseInt(offsetInHours.split('.')[1]) * 60;
            utcMin = localTimeMinutes + offsetMin;
            if (utcMin > 59){
                utcMin = utcMin - 60;
                utcHours = utcHours + 1;
            }
        }
        if (utcHours > 23){
            utcHours = offsetHours - 1;
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
    /**
     * NOTE: All times here should be in utc time.
     *
     * Gets a teacher mail and a given day and constructs and array of the working time slots for the teacher.
     * Example: A teacher's working_hours mapping includes 'Sunday: {from: "12:00", to: "16:00", working : true}
     * Then this function will return an array looking like this:
     * ["12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30"]
     */
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
                if (nextTime === "24"){
                    nextTime = "00";
                }
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

function constructTeacherFreeTime(fullSchedule, busyTime) {
    /**
     * NOTE: All times here should be in utc time.
     *
     * Function is given a full schedule array:
     * ["12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30"]
     * and a busy time mapping - a mapping of existing lessons in that day:
     * {14:00: 30, 15:00: 60} (meaning he has a lesson of 30 min in 14:00 and 60 min in 15:00)
     *
     * This function will return:
     * {12:00:[30, 60], 12:30:[30,60], 13:00:[30, 60], 13:30:[30], 14:30:[30]}
     * meaning for example one can set a lesson in 12:00 for 30 or 60 min but at 13:30 you can only set a 30 min lesson.
     */
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
    if (utcMonth.toString().length === 1){
        utcMonth = "0" + utcMonth;
    }
    if (utcDay.toString().length === 1){
        utcDay = "0" + utcDay;
    }
    let utcFullDate = utcYear + "-" + utcMonth + "-" + utcDay;
    let i;
    let lastUtcTime = -1;
    for (i = 0; Object.keys(freeTimeInUTC).length; i++){
        let utcTime = Object.keys(freeTimeInUTC)[i];
        // check if we passed a day forward
        if (parseInt(utcTime.split(':')[0]) < lastUtcTime){
            utcDay = utcDay + 1;
            // check if we passed a month forward
            if (MONTH_DAYS[parseInt(utcMonth)] < utcDay){
                // take into account the possibility of a leap year (29th of February)
                if (parseInt(utcMonth) !== 2 || (utcYear-LEAP_YEAR) % 4 !== 0){
                    utcMonth = parseInt(utcMonth) + 1;
                    utcDay = "01";
                    // check if we passed a year forward
                    if (utcMonth === 13){
                        utcMonth = "01";
                        utcYear = utcYear + 1;
                    }
                    else {
                        if (utcMonth.toString().length === 1){
                            utcMonth = "0" + utcMonth;
                        }
                    }
                }
            }
        }
        // construct ISO format UTC time.
        let fullUtcDateWithTime = utcFullDate + "T" + utcTime + ":00.000Z";
        // convert to local time
        let localFullDateTime = convertUtcToLocalTime(fullUtcDateWithTime);
        // take only time (without the date nor the milliseconds and timezone offset)
        let localTimeOnly = localFullDateTime.split(" ")[4].slice(0, 5);
        freeTimeInLocalTime[localTimeOnly] = freeTimeInUTC[utcTime];
        lastUtcTime = parseInt(utcTime.split(':')[0]);
    }

    return freeTimeInLocalTime
}

export async function getTeacherFreeTimeInDate(teacher_mail, local_year, local_month, local_day) {
    let busyTime = {};
    let localDate = new Date(parseInt(local_year), parseInt(local_month) - 1, parseInt(local_day));
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

    let freeTime = constructTeacherFreeTime(fullSchedule, busyTime);
    // will return a map looking like so:
    // {free_time: [possible duration (30, 60)]
    //the free time will be in the local time.
    return convertFreeTimeToLocalTime(freeTime, utcDateDay, utcMonth, utcYear)
}

function checkSameWeek(date1, date2){
    let sundayOfDate1 = new Date(date1).setDate(date1.getDate() - date1.getDay());
    let sundayOfDate2 = new Date(date2).setDate(date2.getDate() - date2.getDay());
    return sundayOfDate1.toString() === sundayOfDate2.toString();
}


export async function setNewLesson(student_mail, teacher_mail, local_year, local_month, local_day, local_time, duration){
    let currentLocalDate = new Date();
    const studentLessons = db.collection('students').doc(student_mail).collection('student_lessons');
    const teacherLessons = db.collection('teachers').doc(teacher_mail).collection('teacher_lessons');
    let local_min = local_time.split(':')[1];
    let local_hour = local_time.split(':')[0];
    let lessonDate = new Date(parseInt(local_year), parseInt(local_month) - 1, parseInt(local_day),
        parseInt(local_hour), parseInt(local_min));
    let utcLessonDate = lessonDate.toISOString();
    let lesson_id = constructLessonId(student_mail, teacher_mail, utcLessonDate);
    let lessonInfo = {
        teacher_mail: teacher_mail,
        student_mail: student_mail,
        duration: duration,
        date_utc: {
            year: lessonDate.getUTCFullYear(),
            month: lessonDate.getUTCMonth() + 1,
            day: lessonDate.getUTCDate(),
            time: lessonDate.getHours().toString() + ":" + lessonDate.getUTCMinutes().toString(),
            full_date: new Date(utcLessonDate),
            full_date_string: utcLessonDate
        },
        feedback: {
            fields: "None"
        },
        started: false,
        feedback_given: false,
        no_show: false,
        lesson_id: lesson_id
    };
    studentLessons.doc(lesson_id).set(lessonInfo).then(function () {
        console.log("Lesson set in student lessons")
    });
    teacherLessons.doc(lesson_id).set(lessonInfo).then(function () {
       console.log("Lesson set in teacher lessons")
    });

    if (lessonDate.getUTCMonth() === currentLocalDate.getUTCMonth()){
        const studentCollectionRef = db.collection('students');
        let currentMonthLessons = [];
        await studentCollectionRef.doc(student_mail).get().then(function (doc) {
            currentMonthLessons.push(doc.data().lessons_this_month)
        });
        currentMonthLessons = currentMonthLessons[0];
        currentMonthLessons[lesson_id] = lessonInfo;
        studentCollectionRef.doc(student_mail).update({
            lessons_this_month: currentMonthLessons
        });
    }
    if (checkSameWeek(currentLocalDate, lessonDate)){
        const teacherCollectionRef = db.collection('teachers');
        let currentWeekLessons = [];
        await  teacherCollectionRef.doc(teacher_mail).get().then(function (doc) {
            currentWeekLessons.push(doc.data().lessons_this_week)
        });
        currentWeekLessons = currentWeekLessons[0];
        currentWeekLessons[lesson_id] = lessonInfo;
        teacherCollectionRef.doc(teacher_mail).update({
            lessons_this_week: currentWeekLessons
        });
    }
}

export async function cancelLesson(student_mail, teacher_mail, local_year, local_month, local_day, local_time){
    let currentLocalDate = new Date();
    const studentLessons = db.collection('students').doc(student_mail).collection('student_lessons');
    const teacherLessons = db.collection('teachers').doc(teacher_mail).collection('teacher_lessons');
    let local_min = local_time.split(':')[1];
    let local_hour = local_time.split(':')[0];
    let lessonDate = new Date(parseInt(local_year), parseInt(local_month) - 1, parseInt(local_day),
        parseInt(local_hour), parseInt(local_min));
    let utcLessonDate = lessonDate.toISOString();
    let lesson_id = constructLessonId(student_mail, teacher_mail, utcLessonDate);
    studentLessons.doc(lesson_id).delete().then(function () {
        console.log("Deleted lesson in student lessons")
    });
    teacherLessons.doc(lesson_id).delete().then(function(){
       console.log("Deleted lessin in teacher lessons")
    });

    if (lessonDate.getUTCMonth() === currentLocalDate.getUTCMonth()){
        const studentCollectionRef = db.collection('students');
        let currentMonthLessons = [];
        await studentCollectionRef.doc(student_mail).get().then(function (doc) {
            currentMonthLessons.push(doc.data().lessons_this_month)
        });
        currentMonthLessons = currentMonthLessons[0];
        delete currentMonthLessons[lesson_id];
        studentCollectionRef.doc(student_mail).update({
            lessons_this_month: currentMonthLessons
        });
    }

    if (checkSameWeek(currentLocalDate, lessonDate)){
        const teacherCollectionRef = db.collection('teachers');
        let currentWeekLessons = [];
        await  teacherCollectionRef.doc(teacher_mail).get().then(function (doc) {
            currentWeekLessons.push(doc.data().lessons_this_week)
        });
        currentWeekLessons = currentWeekLessons[0];
        delete currentWeekLessons[lesson_id];
        teacherCollectionRef.doc(teacher_mail).update({
            lessons_this_week: currentWeekLessons
        });
    }

}

export async function getNextFourLessonsStudent(student_mail) {
    const collectionRef = db.collection('students').doc(student_mail).collection('student_lessons');
    let nextLessons = [];
    await collectionRef.where('started', '==', false).where("no_show", '==', false)
        .orderBy('date_utc.full_date').limit(4).get().then(function (snapshot) {
            snapshot.forEach(doc =>{
                let lessonInfo = doc.data();
                lessonInfo['local_date'] = convertUtcToLocalTime(doc.data().date_utc.full_date_string);
                nextLessons.push(lessonInfo)
            })
        });

    return nextLessons
}

export async function getMonthLessonsStudent(student_mail, month_num, year){
    const collectionRef = db.collection('students').doc(student_mail).collection('student_lessons');
    let monthLessons = [];
    await collectionRef.where('date_utc.month', '==', month_num)
        .where('date_utc.year', '==', year).get().then(function(snapshot){
            snapshot.forEach(doc => {
                let lessonInfo = doc.data();
                lessonInfo['local_date'] = convertUtcToLocalTime(doc.data().date_utc.full_date_string);
                monthLessons.push(lessonInfo)
            })
        });

    return monthLessons
}

export async function getWeekLessonByDateTeacher(teacher_mail, local_year, local_month, local_day){
    const collectionRef = db.collection('teachers').doc(teacher_mail).collection('teacher_lessons');
    let weekLessons = [];
    let localDate = new Date(local_year, local_month - 1, local_day);
    let localSunday = new Date(localDate.toString()).setDate(localDate.getDate() - localDate.getDay());
    let localSaturday = new Date(localDate.toString()).setDate(localDate.getDate() + (6 - localDate.getDay()));
    await collectionRef.orderBy('date_utc.full_date')
        .where('date_utc.full_date', '>=', new Date(localSunday.toISOString()))
        .where('date_utc.full_date', '<=', new Date(localSaturday.toISOString())).get()
        .then(function (snapshot){
            snapshot.forEach(doc => {
                let lessonInfo = doc.data();
                lessonInfo['local_date'] = convertUtcToLocalTime(doc.data().date_utc.full_date_string);
                weekLessons.push(lessonInfo)
            })
        });

    return weekLessons
}

export async function updateStudentMonthLessons(student_mail){
    let currentDate = new Date();
    let nextMontLessons = await getMonthLessonsStudent(student_mail,
        currentDate.getUTCMonth() + 1, currentDate.getUTCFullYear())
    const collectionRef = db.collection('students').doc(student_mail);
    let formattedMonthLessons = {};
    nextMontLessons.forEach(lesson => {
        formattedMonthLessons[lesson.lesson_id] = lesson
    });
    await collectionRef.update({
        lessons_this_month: formattedMonthLessons
    });
}

export async function updateTeacherWeekLessons(teacher_mail) {
    let currentDate = new Date();
    let nextWeekLessons = await getWeekLessonByDateTeacher(teacher_mail,
        currentDate.getUTCFullYear(), currentDate.getUTCMonth() +1, currentDate.getDate());
    const collectionRef = db.collection('teachers').doc(teacher_mail);
    let formattedWeekLessons = {};
    nextWeekLessons.forEach(lesson => {
        formattedWeekLessons[lesson.lesson_id] = lesson
    });

    await collectionRef.update({
        lessons_this_week: formattedWeekLessons
    })
}