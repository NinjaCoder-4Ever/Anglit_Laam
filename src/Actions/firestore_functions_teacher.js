import {db} from '../Config/fire'
import {constructLessonId, convertLocalTimeToUtc, convertUtcToLocalTime, applyTimezoneoffset, checkSameWeek} from './firestore_functions_general'

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
    let parsed_working_hours = setWorkingHours(working_hours);
    let working_days = setWorkingDays(parsed_working_hours);
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
        working_hours: parsed_working_hours,
        working_days: working_days
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

function setWorkingHours(working_hours){
    /**
     * Function gets working_hours and parses them to utc and returns a working hours struct for the teacher's working_hours field
     *
     * Return example: ["Sunday-12:00-21:00", "Monday-13:00-17:00"]
     */
    let i;
    let currentDate = new Date();
    let parsed_working_hours = [];
    for (i = 0; i < 7; i++){
        if (working_hours[WEEKDAYS[i]].from !== "00:00" && working_hours[WEEKDAYS[i]].to !== "00:00"){
            let startTime = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(),
                parseInt(working_hours[WEEKDAYS[i]].from.split(':')[0]),
                parseInt(working_hours[WEEKDAYS[i]].from.split(':')[1]));
            let endtTime = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(),
                parseInt(working_hours[WEEKDAYS[i]].to.split(':')[0]),
                parseInt(working_hours[WEEKDAYS[i]].to.split(':')[1]));
            if (startTime.getUTCDay() === endtTime.getUTCDay()){
                parsed_working_hours.push(startTime.getUTCDay() + "-" + startTime.getUTCHours() + ":" + startTime.getUTCMinutes()
                + "-" + endtTime.getUTCHours() + ":" + endtTime.getUTCMinutes());
            }
            else {
                parsed_working_hours.push(startTime.getUTCDay() + "-" + startTime.getUTCHours() + ":" + startTime.getUTCMinutes()
                + "-00:00");
                parsed_working_hours.push(endtTime.getUTCDay() + "-00:00-" + endtTime.getUTCHours() + ":" + endtTime.getUTCMinutes());
            }
        }
    }
}

function setWorkingDays(working_hours){
    /**
     * gets the working days and creates working days array.
     */
    let i, j;
    let workingDays = []
    for (i=0; i< working_hours.length; i++){
        for (j=0; j< 7; j++){
            if (working_hours[i].includes(WEEKDAYS[j])){
                if (!workingDays.includes(WEEKDAYS[j])){
                    workingDays.push(WEEKDAYS[j]);
                }
            }
        }
    }
    return workingDays
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
        working_hours: ["Sunday-12:00-21:00", "Monday-13:00-17:00"]
        working_days: [Sunday, Monday]
    };
     */

    const collectionRef = db.collection('teachers');
    const doc = await collectionRef.doc(email).get();

    return doc.data()
}

export async function updateTeacherWorkingHours(email,working_hours) {
    /**
     * Function updates the teacher's working_hours fields.
     * working_hours field should have the following structure:
     * {Sunday: {from: XX:XX, to: XX:XX, working: True}, Monday: {from: '', to: '', working: False}....}
     */
    let parsed_working_hours = setWorkingHours(working_hours);
    let working_days = setWorkingDays(parsed_working_hours);
    const collectionRef = db.collection('teachers');
    collectionRef.doc(email).update({
        working_hours: parsed_working_hours,
        working_days: working_days
    }).then(function () {
        console.log("updated teachers working hours");
    });
}

// ################################# LESSON FUNCTIONS #####################################

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
    const doc = await collectionRef.doc(email).get();

    let lessons = doc.data().lessons_this_week;
    let i;
    for (i = 0; i < lessons.length; i++){
        let lesson = lessons[i];
        lesson.local_date = convertUtcToLocalTime(lesson.date_utc.full_date_string);
        lessonsThisWeek.push(lesson)
    }

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
    const snapshot = await collectionRef.where('student_mail', '==', student_mail)
        .where('feedback_given', '==', true).get();

    snapshot.forEach(doc =>{
        let lessonData = doc.data();
        lessonData.local_date = convertUtcToLocalTime(lessonData.date_utc.full_date);
        pastFeedbacks.push(lessonData)
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
    const snapshot = await collectionRef.where('feedback_given', '==', false)
        .where('started', '==', true).get();

    snapshot.forEach(doc =>{
        let lessonData = doc.data();
        lessonData.local_date = convertUtcToLocalTime(lessonData.date_utc.full_date_string);
        futureFeedbacks.push(lessonData)
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
    const snapshot = await collectionRef.orderBy('date_utc.full_date')
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
    let searchedSunday = new Date(currentDate.toISOString());
    searchedSunday = searchedSunday.setDate(searchedSunday.getUTCDate()) - searchedSunday.getUTCDay();
    let searchedSaturday = new Date(searchedSunday.toString());
    searchedSaturday.setDate(searchedSaturday.getDate() + 6);
    let nextWeekLessons = await getWeekLessonByDateTeacher(teacher_mail,searchedSunday, searchedSaturday);
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
    let searchedDate = new Date(year, month -1, day);
    let searchedSunday = new Date(searchedDate.toISOString());
    searchedSunday.setDate(searchedSunday.getDate()- searchedSunday.getDay());
    let searchedSaturday = new Date(searchedSunday.toISOString());
    searchedSaturday.setDate(searchedSaturday.getDate() + 6);
    let weeksLessons = parseWeeksLessons(await getWeekLessonByDateTeacher(teacher_mail, searchedSunday, searchedSaturday));
    let working = await getTeacherWorkingDaysAndHours(teacher_mail);
    let workingDays = working[0];
    let workingHours = working[1];
    let i;
    let teacherFreeTime = {};
    for (i =0; i<=6; i++){
        let day = new Date(searchedSunday.toISOString());
        day.setDate(day.getDate() + i);
        let month = day.getMonth() +1;
        if (month < 10){
            month = "0" + month;
        }
        let dayDate = day.getDate();
        if (dayDate < 10){
            dayDate = "0" + dayDate;
        }
        let key = day.getFullYear() + "-" + month + "-" + dayDate;
        if (day.getDate() < currentDate.getDate()){
            continue
        }
        if (workingDays.includes(WEEKDAYS[day.getDay()])){
            teacherFreeTime[key] = getFreeTimeOnDay(workingHours, weeksLessons, day);
        }
    }
    return teacherFreeTime
}

function parseWeeksLessons(weeksLessons) {
    /**
     * Function gets this weeks lessons and parses them to a structure:
     * {
     *  Sunday: [
     *      {
     *          time: 18:00,
     *          duration: 30
     *      }
     *   ]
     * }
     * meaning on Sunday the teacher has a lesson of 30 min starting at 18:00
     * empty days will return empty arrays
     */
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
    /**
     * Function returns the working hours and working days of a teacher
     */
    const docRef = db.collection('teachers').doc(teacher_mail);
    const teacher_doc = await docRef.get();
    let working_days = teacher_doc.data().working_days;
    let working_hours = teacher_doc.data().working_hours;

    return [working_days, working_hours]
}

function getFreeTimeOnDay(working_hours, weeks_lessons, day) {
    /**
     * Function gets a fay and working hours and scheduled lessons for a teacher and constructs the
     * free time struct for that day
     */
    let working_hours_array = getWorkingHoursForDay(working_hours, day);
    let dayLessons = weeks_lessons[WEEKDAYS[day.getDay()]];
    let freeTime = [];
    working_hours_array.forEach(working_hours_subarray => {
        let i, j;
        for (i=0; i< working_hours_subarray.length; i++){
            if (working_hours_subarray[i] === 'busy'){
                continue
            }
            if (dayLessons) {
                for (j = 0; j < dayLessons.length; j++)
                    if (working_hours_subarray[i] === dayLessons[j].time) {
                        working_hours_subarray[i] = 'busy';
                        if (dayLessons[j].duration === 60) {
                            working_hours_subarray[i + 1] = 'busy';
                        }
                    }
            }
        }
        freeTime = freeTime.concat(constructFreeTime(working_hours_subarray))
    });
    return freeTime
}

function constructFreeTime(free_hours) {
    /**
     * Construct the free time struct out of fully parsed schedule
     */
    let freeTimeArray = [];
    let i;
    for (i=0; i<free_hours.length-1; i++){
        if (free_hours[i] !== 'busy'){
            if (free_hours[i+1] !== 'busy' && i !== free_hours.length-2){
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
    /**
     * Function gets the working hours for a teacher and a given day and returns an array of arrays
     * each sub-array represents all the working hour sequence for the teacher
     * for example:
     * [[12:00,12:30,13:00], [14:00, 14:30, 15:00]]
     * meaning the teacher works on 2 sequences 12:00-13:00 and 14:00-15:00 on the given day
     */
    let working_hours_array = [];
    let i;
    for (i=0; i< working_hours.length; i++){
        if (working_hours[i].includes(WEEKDAYS[day.getDay()])){
            let start = working_hours[i].split('-')[1];
            let end = working_hours[i].split('-')[2];
            let continueCreation = true;
            let totalSchedule = [start];

            while (continueCreation){
                let currentTime = totalSchedule[totalSchedule.length-1];
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