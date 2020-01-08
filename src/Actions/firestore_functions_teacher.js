import {db} from '../Config/fire'
import {constructLessonId, convertLocalTimeToUtc, convertUtcToLocalTime, applyTimezoneoffset, checkSameWeek} from 'firestore_fucntions_general.js'

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
    12: 31
};

db.settings({ timestampsInSnapshots: true });
/// ############################# USERS FUNCTIONS #######################################
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
        local_date: local_date_string,
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
            lesson.local_date = convertUtcToLocalTime(lesson.date_utc.full_date_string);
            lessonsThisWeek.push(lesson)
        }
    });

    return lessonsThisWeek
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
        local_date: local_date_string,
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
                lessonData.local_date = convertUtcToLocalTime(lessonData.date_utc.full_date);
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
        local_date: local_date_string,
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
                lessonData.local_date = convertUtcToLocalTime(lessonData.date_utc.full_date_string);
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

export async function getWeekLessonByDateTeacher(teacher_mail, searchedSunday, searchedSaturday){
    /**
     * Function gets a teacher's week lessons in the week of a given date.
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
        local_date: local_date_string,
        feedback: {
            fields: "None"
        },
        started: false,
        feedback_given: false,
        no_show: false,
        lesson_id: lesson_id
    };
     */
    const collectionRef = db.collection('teachers').doc(teacher_mail).collection('teacher_lessons');
    let weekLessons = [];
    let snapshot = await collectionRef.orderBy('date_utc.full_date')
        .where('date_utc.full_date', '>=', searchedSunday)
        .where('date_utc.full_date', '<=', searchedSaturday).get();

    snapshot.forEach(doc =>{
        weekLessons.push(doc.data())
    });

    return weekLessons
}

export async function updateTeacherWeekLessons(teacher_mail) {
    /**
     * Function updates the lessons_this_week field under a teacher's doc in "teachers" collection.
     *
     * This function is meant to run in the beginning of each week.
     */
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

export async function getTeachersWeekFreeTime(year, month, day, teacher_mail) {
    /**
     * Function gets a year, month and day and a teacher's mail and returns the free time slots for the the teacher
     * in that week
     * Returns: {
     *     2020-01-08:[
     *     {time: "18:00", duration: [30,60]},
     *     {time: "19:00", duration: [30]}
     *     ]
     * }
     * The above means that the teacher is free on the Jan 8th 2020 on 18:00 for 30 or 60 min and on 19:00 for 30 min
     *
     * NOTE: All time are returned in UTC time!!!
     */
    let currentDate = new Date();
    let searchedDate = new Date(year, month, day);
    let searchedSunday = new Date(searchedDate.setDate(searchedDate.getDate() - searchedDate.getUTCDay()));
    let searchedSaturday = new Date(searchedDate.setDate(searchedDate.getDate() + (6 - searchedDate.getDay())));
    let weeksLessons = parseWeeksLessons(await getWeekLessonByDateTeacher(teacher_mail, searchedSunday, searchedSaturday));
    let working = await getTeacherWorkingDaysAndHours(teacher_mail);
    let workingDays = working[0];
    let workingHours = working[1];
    let i;
    let teacherFreeTime = {};
    for (i =0; i<=6; i++){
        let day = new Date(searchedSunday.setDate(searchedSunday.getDate() + i));
        let key = day.getUTCFullYear() + "-" + day.getUTCMonth() + day.getUTCDate();
        if (day < currentDate){
            teacherFreeTime[key] = [];
            continue
        }
        if (workingDays.includes(WEEKDAYS[day.getUTCDay()])){
            teacherFreeTime[key] = getFreeTimeOnDay(workingHours, weeksLessons, day);
        }
    }
    return teacherFreeTime
}

function parseWeeksLessons(weeksLessons) {
    if (weeksLessons.length === 0){
        return {}
    }

    let formattedWeekLessons = {};
    weeksLessons.forEach(lesson =>{
        let lessonDate = new Date(lesson.date_utc.full_date_string);
        if (!Object.keys(formattedWeekLessons).includes(WEEKDAYS[lessonDate.getUTCDay()])){
            formattedWeekLessons[WEEKDAYS[lessonDate.getUTCDay()]] = [];
        }
        formattedWeekLessons[WEEKDAYS[lessonDate.getUTCDay()]].push({
            time: lesson.date_utc.time,
            duration: lesson.duration
        })
    });

    return formattedWeekLessons
}

async function getTeacherWorkingDaysAndHours(teacher_mail) {
    const docRef = db.collection('teachers').doc(teacher_mail);
    let teacher_doc = await docRef.get();
    let working_days = teacher_doc.data().working_days;
    let working_hours = teacher_doc.data().working_hours;

    return [working_days, working_hours]
}

function getFreeTimeOnDay(working_hours, weeks_lessons, day) {
    let working_hours_array = getWorkingHoursForDay(working_hours, day);
    let dayLessons = weeks_lessons[WEEKDAYS[day.getUTCDay()]];
    let freeTime = [];
    working_hours_array.forEach(working_hours_subarray => {
        let i, j;
        for (i=0; i< working_hours_subarray.length; i++){
            if (working_hours_subarray[i] === 'busy'){
                continue
            }
            for (j=0; j<dayLessons.length; j++)
                if (working_hours_subarray[i] === dayLessons[j].time){
                    working_hours_subarray[i] = 'busy';
                    if (dayLessons[j].duration === 60){
                        working_hours_subarray[i + 1] = 'busy';
                    }
                }
        }
        freeTime.concat(constructFreeTime(working_hours_subarray))
    });

    return freeTime
}

function constructFreeTime(free_hours) {
    let freeTimeArray = [];
    let i;
    for (i=0; i<free_hours.length-1; i++){
        if (free_hours[i] !== 'busy'){
            if (free_hours[i+1] !== 'busy'){
                freeTimeArray.push({
                    time: free_hours[i],
                    duration: [30, 60]
                });
            }
            else {
                freeTimeArray.push({
                    time: free_hours[i],
                    duration: [30]
                });
            }
        }
    }
    return freeTimeArray
}

function getWorkingHoursForDay(working_hours, day) {
    let working_hours_array = [];
    let i;
    for (i=0; i< working_hours.length; i++){
        if (working_hours[i].includes(WEEKDAYS[day.getUTCDay()])){
            let start = working_hours[i].split('-')[0];
            let end = working_hours[i].split('-')[1];
            let continueCreation = true;
            let totalSchedule = [start];

            while (continueCreation){
                let currentTime = totalSchedule[-1];
                if (currentTime === end){
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
            working_hours_array.push(totalSchedule)
        }
    }

    return working_hours_array
}