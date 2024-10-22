import {db} from '../Config/fire'
import {convertUtcToLocalTime, checkSameWeek, WEEKDAYS} from './firestore_functions_general'
import {getAllAdminMails} from "./firestore_functions_admin";

/// ############################# USERS FUNCTIONS #######################################
export async function setNewTeachers(uid, email, firstName, lastName, phoneNumber, skype_username, category, working_days,
                               break_time){
    /**
     * Function enters a new teacher to the "teachers" collection.
     * Also enters the teacher to the "users" collection.
     */
    let parsrd_category = [];
    for (const cat of category){
        parsrd_category.push(cat.toLowerCase())
    }
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
        working_hours: setup_working_hours(working_days, break_time),
        working_days: working_days,
        last_log_on: new Date(),
        skype_username: skype_username,
        category: parsrd_category
    };

    let usersData = {
        email: email,
        collection: "teachers",
        uid: uid
    };

    let adminTeacherData = {
        category: category,
        last_log_on: new Date(),
        students: [],
        teacher_name: firstName + " " + lastName,
        teacher_mail: email,
        uid: uid,
        working_days: working_days,
        skype_username: skype_username,
        phone_number: phoneNumber
    };

    db.collection('teachers').doc(email).set(newTeacherData).then(function() {
        console.log('Added teacher with ID: ', email)
    });
    db.collection('users').doc(email).set(usersData).then(function () {
        console.log('Added user to users collection')
    });
    updateAdminDataForTeacher(adminTeacherData);
}

async function updateAdminDataForTeacher(teacherData) {
    let teacherMail = teacherData.teacher_mail;
    let adminMails = await getAllAdminMails();
    let adminData = await db.collection('admins').doc(adminMails[0]).get();
    let noSuccess = (adminData === null || adminData === undefined);

    // error handling
    while (noSuccess){
        adminData = await db.collection('admins').doc(adminMails[0]).get();
        noSuccess = (adminData === null || adminData === undefined);
    }

    let teachers = adminData.data().all_teachers;
    teachers[teacherMail] = teacherData;
    for (const mail of adminMails){
        db.collection('admins').doc(mail).update({
            all_teachers: teachers
        })
    }
}

export function setup_working_hours(working_days, break_time){
    let working_hours_array = [];
    for (const day of working_days){
        if (break_time !== null){
            let hours_to_break = day + "-07:00-" + break_time;
            let break_hour = parseInt(break_time.split(":")[0]);
            let break_min = break_time.split(":")[1];
            let post_break_hour = break_hour + 1;
            if (post_break_hour < 10){
                post_break_hour = "0" + post_break_hour;
            }
            let hours_after_break = day + "-" + post_break_hour + ":" + break_min + "-18:00";
            working_hours_array.push(hours_to_break);
            working_hours_array.push(hours_after_break);
        }
        else {
            let hours_full_day = day + "-07:00-18:00";
            working_hours_array.push(hours_full_day);
        }
    }
    return working_hours_array
}

async function setLogOnTeacher(teacher_data){
    let currentDate = new Date();
    let currentSunday = new Date(currentDate);
    currentSunday.setDate(currentSunday.getUTCDate() - currentSunday.getUTCDay());
    currentSunday.setHours(0,0);
    let lastLogOn = new Date();
    if (teacher_data !== undefined){
        if (teacher_data.last_log_on !== undefined){
            lastLogOn = new Date(teacher_data.last_log_on.toString());
        }
    }
    if (lastLogOn === undefined || !checkSameWeek(currentDate, lastLogOn)){
        let newCurrentWeekLessons = await updateTeacherWeekLessons(teacher_data.email, currentSunday);
        teacher_data.lessons_this_week = newCurrentWeekLessons;
    }
    db.collection('teachers').doc(teacher_data.email).update({
        last_log_on: currentDate
    });
    return teacher_data
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
    let doc = await collectionRef.doc(email).get();
    let noSuccess = (doc === null || doc === undefined);

    // error handling
    while (noSuccess){
        doc = await collectionRef.doc(email).get();
        noSuccess = (doc === null || doc === undefined);
    }

    return  await setLogOnTeacher(doc.data());
}

export async function getTeacherByUID(uid) {
    /**
     * Function returns the teacher's data from "teachers" collection by uid.
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
    let snapshot = await collectionRef.where('uid', '==', uid).get();
    let noSuccess = (snapshot === null || snapshot === undefined);

    // error handling
    while (noSuccess){
        snapshot = await collectionRef.where('uid', '==', uid).get();
        noSuccess = (snapshot === null || snapshot === undefined);
    }

    let docs = [];
    snapshot.forEach(doc => {
        docs.push(doc.data())
    });

    return  await setLogOnTeacher(docs[0])
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
    let doc = await collectionRef.doc(email).get();
    let noSuccess = (doc === null || doc === undefined);

    // error handling
    while (noSuccess){
        doc = await collectionRef.doc(email).get();
        noSuccess = (doc === null || doc === undefined);
    }

    let lessons = doc.data().lessons_this_week;
    let i;
    for (i = 0; i < lessons.length; i++){
        let lesson = lessons[i];
        lesson.local_date = convertUtcToLocalTime(lesson.date_utc.full_date_string);
        lessonsThisWeek.push(lesson)
    }

    return lessonsThisWeek
}

export async function getStudentsPastFeedbackForTeacher(teacher_mail, student_mail){
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
    let snapshot = await collectionRef.where('student_mail', '==', student_mail)
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
    let snapshot = await collectionRef.where('feedback_given', '==', false)
        .where('started', '==', true).orderBy("date_utc.full_date").get();

    snapshot.forEach(doc =>{
        let lessonData = doc.data();
        lessonData.local_date = convertUtcToLocalTime(lessonData.date_utc.full_date_string);
        futureFeedbacks.push(lessonData)
    });

    return futureFeedbacks
}

export async function setFeedbackForLesson(feedback, lesson_id, teacher_mail, student_mail){
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

    let lessonInfo = await studentLessons.doc(lesson_id).get();
    let noSuccess = (lessonInfo === null || lessonInfo === undefined);

    // error handling
    while (noSuccess){
        lessonInfo = await studentLessons.doc(lesson_id).get();
        noSuccess = (lessonInfo === null || lessonInfo === undefined);
    }

    let studentInfo = await db.collection('students').doc(student_mail).get();
    noSuccess = (studentInfo === null || studentInfo === undefined);

    // error handling
    while (noSuccess){
        studentInfo = await db.collection('students').doc(student_mail).get();
        noSuccess = (studentInfo === null || studentInfo === undefined);
    }

    if ( studentInfo.data().last_feedback_given === undefined || studentInfo.data().last_feedback_given.lesson_date === undefined ||
        new Date(studentInfo.data().last_feedback_given.lesson_date) < new Date(lessonInfo.data().date_utc.full_date)){
        let last_feedback_updated = {
            lesson_id: lesson_id,
            lesson_date: lessonInfo.data().date_utc.full_date_string,
            teacher_mail: lessonInfo.data().teacher_mail,
            teacher_name: lessonInfo.data().teacher_name,
            grammar_corrections: lessonInfo.data().feedback.grammar_corrections,
            pronunciation_corrections: lessonInfo.data().feedback.pronunciation_corrections,
            vocabulary: lessonInfo.data().feedback.vocabulary,
            home_work: lessonInfo.data().feedback.home_work,
        };
        if (lessonInfo.data().teacher_name === undefined){
            last_feedback_updated["teacher_name"] = "";
        }
        db.collection('students').doc(student_mail).update({
            last_feedback_given: last_feedback_updated
        });
    }
}

export async function saveFeedback(feedback, lesson_id, teacher_mail) {
    const teacherLessons = db.collection('teachers').doc(teacher_mail).collection('teacher_lessons');
    teacherLessons.doc(lesson_id).update({
        "feedback": feedback,
    }).then(function () {
        console.log("Feedback updated for teacher")
    });
}

export async function setLessonStarted(lesson_id, teacher_mail, student_mail, start_time){
    /**
     * Function sets a lesson status to "started" in both student_lessons and teacher_lessons collections.
     */
    let currentLocalDate = new Date();
    const studentLessons = db.collection('students').doc(student_mail).collection('student_lessons');
    const teacherLessons = db.collection('teachers').doc(teacher_mail).collection('teacher_lessons');

    studentLessons.doc(lesson_id).update({
        "started": true,
        "no_show": false
    }).then(function () {
        console.log("Lesson started status updated for student")
    });

    teacherLessons.doc(lesson_id).update({
        "started": true,
        "no_show": false
    }).then(function () {
        console.log("Lesson started status updated for teacher")
    });

    // if (start_time.getUTCMonth() === currentLocalDate.getUTCMonth()){
    //     const studentCollectionRef = db.collection('students');
    //     let studentData = await studentCollectionRef.doc(student_mail).get();
    //     let currentMonthLessons = studentData.data().lessons_this_month;
    //     let currentLessonInfo = currentMonthLessons[lesson_id];
    //     currentLessonInfo.started = true;
    //     currentMonthLessons.no_show = false;
    //     currentMonthLessons[lesson_id] = currentLessonInfo;
    //     studentCollectionRef.doc(student_mail).update({
    //         lessons_this_month: currentMonthLessons
    //     });
    // }

    // if (checkSameWeek(currentLocalDate, start_time)){
    //     const teacherCollectionRef = db.collection('teachers');
    //     let teacherData = await teacherCollectionRef.doc(teacher_mail).get();
    //     let currentWeekLessons = teacherData.data().lessons_this_week;
    //     let currentLessonInfo = currentWeekLessons[WEEKDAYS[start_time.getUTCDay()]][lesson_id];
    //     currentLessonInfo.started = true;
    //     currentLessonInfo.no_show = false;
    //     currentWeekLessons[WEEKDAYS[start_time.getUTCDay()]][lesson_id] = currentLessonInfo;
    //     teacherCollectionRef.doc(teacher_mail).update({
    //         lessons_this_week: currentWeekLessons
    //     });
    // }
}

export async function unmarkLessonStatus(lesson_id, teacher_mail, student_mail, start_time){
    /**
     * Function sets a lesson status to unmarked (both not started and not " no_show")
     * in both student_lessons and teacher_lessons collections.
     */
    let currentLocalDate = new Date();
    const studentLessons = db.collection('students').doc(student_mail).collection('student_lessons');
    const teacherLessons = db.collection('teachers').doc(teacher_mail).collection('teacher_lessons');

    studentLessons.doc(lesson_id).update({
        "started": false,
        "no_show": false
    }).then(function () {
        console.log("Lesson started status updated for student")
    });

    teacherLessons.doc(lesson_id).update({
        "started": false,
        "no_show": false
    }).then(function () {
        console.log("Lesson started status updated for teacher")
    });

    // if (start_time.getUTCMonth() === currentLocalDate.getUTCMonth()){
    //     const studentCollectionRef = db.collection('students');
    //     let studentData = await studentCollectionRef.doc(student_mail).get();
    //     let currentMonthLessons = studentData.data().lessons_this_month;
    //     let currentLessonInfo = currentMonthLessons[lesson_id];
    //     currentLessonInfo.started = false;
    //     currentMonthLessons.no_show = false;
    //     currentMonthLessons[lesson_id] = currentLessonInfo;
    //     studentCollectionRef.doc(student_mail).update({
    //         lessons_this_month: currentMonthLessons
    //     });
    // }

    // if (checkSameWeek(currentLocalDate, start_time)){
    //     const teacherCollectionRef = db.collection('teachers');
    //     let teacherData = await teacherCollectionRef.doc(teacher_mail).get();
    //     let currentWeekLessons = teacherData.data().lessons_this_week;
    //     let currentLessonInfo = currentWeekLessons[WEEKDAYS[start_time.getUTCDay()]][lesson_id];
    //     currentLessonInfo.started = false;
    //     currentLessonInfo.no_show = false;
    //     currentWeekLessons[WEEKDAYS[start_time.getUTCDay()]][lesson_id] = currentLessonInfo;
    //     teacherCollectionRef.doc(teacher_mail).update({
    //         lessons_this_week: currentWeekLessons
    //     });
    // }
}

export async function setLessonNoShow(lesson_id, teacher_mail, student_mail, start_time){
    /**
     * Function sets a lesson status to "no_show" in both student_lessons and teacher_lessons collections.
     */
    let currentLocalDate = new Date();
    const studentLessons = db.collection('students').doc(student_mail).collection('student_lessons');
    const teacherLessons = db.collection('teachers').doc(teacher_mail).collection('teacher_lessons');

    studentLessons.doc(lesson_id).update({
        "no_show": true,
        "started": false
    }).then(function () {
        console.log("Lesson no show status updated for student")
    });

    teacherLessons.doc(lesson_id).update({
        "no_show": true,
        "started": false
    }).then(function () {
        console.log("Lesson no show status updated for teacher")
    });

    // if (start_time.getUTCMonth() === currentLocalDate.getUTCMonth()){
    //     const studentCollectionRef = db.collection('students');
    //     let studentData = await studentCollectionRef.doc(student_mail).get();
    //     let currentMonthLessons = studentData.data().lessons_this_month;
    //     let currentLessonInfo = currentMonthLessons[lesson_id];
    //     currentLessonInfo.no_show = true;
    //     currentLessonInfo.started = false;
    //     currentMonthLessons[lesson_id] = currentLessonInfo;
    //     studentCollectionRef.doc(student_mail).update({
    //         lessons_this_month: currentMonthLessons
    //     });
    // }

    // if (checkSameWeek(currentLocalDate, start_time)){
    //     const teacherCollectionRef = db.collection('teachers');
    //     let teacherData = await teacherCollectionRef.doc(teacher_mail).get();
    //     let currentWeekLessons = teacherData.data().lessons_this_week;
    //     let currentLessonInfo = currentWeekLessons[WEEKDAYS[start_time.getUTCDay()]][lesson_id];
    //     currentLessonInfo.no_show = true;
    //     currentLessonInfo.started = false;
    //     currentWeekLessons[WEEKDAYS[start_time.getUTCDay()]][lesson_id] = currentLessonInfo;
    //     teacherCollectionRef.doc(teacher_mail).update({
    //         lessons_this_week: currentWeekLessons
    //     });
    // }
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
    let searchedSunday2 = new Date(searchedSunday);
    let oneDayMore = new Date(searchedSaturday);
    oneDayMore.setDate(oneDayMore.getDate() + 1);
    let snapshot = await collectionRef.orderBy('date_utc.full_date')
        .where('date_utc.full_date', '>=', searchedSunday2)
        .where('date_utc.full_date', '<', oneDayMore).get();
    if (snapshot === null){
        return []
    }
    snapshot.forEach(doc =>{
        weekLessons.push(doc.data());
    });
    return weekLessons
}

export async function updateTeacherWeekLessons(teacher_mail, date) {
    /**
     * Function updates the lessons_this_week field under a teacher's doc in "teachers" collection.
     *
     * This function is meant to run in the beginning of each week.
     */
    let searchedSunday = new Date(date.toISOString());
    searchedSunday = searchedSunday.setDate(searchedSunday.getUTCDate()) - searchedSunday.getUTCDay();
    let searchedSaturday = new Date(searchedSunday);
    searchedSaturday.setDate(searchedSaturday.getDate() + 6);
    let nextWeekLessons = await getWeekLessonByDateTeacher(teacher_mail,searchedSunday, searchedSaturday);
    const collectionRef = db.collection('teachers').doc(teacher_mail);
    let formattedWeekLessons = {
        'Sunday': {},
        'Monday': {},
        'Tuesday': {},
        'Wednesday': {},
        'Thursday': {},
        'Friday': {},
        'Saturday': {}
    };
    nextWeekLessons.forEach(lesson => {
        if (checkSameWeek(searchedSunday, lesson.date_utc.full_date)) {
            formattedWeekLessons[WEEKDAYS[lesson.date_utc.full_date.getUTCDay()]][lesson.lesson_id] = lesson;
        }
    });

    await collectionRef.update({
        lessons_this_week: formattedWeekLessons
    });

    return formattedWeekLessons
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
    searchedSunday.setHours(0,0);
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
        // if the day is today and the teacher is working on that day check only future hours.
        if (day.toDateString() === currentDate.toDateString() && workingDays.includes(WEEKDAYS[day.getDay()])){
            teacherFreeTime[key] = getFreeTimeToday(workingHours, weeksLessons, day);
        }
        // if the day is before today - dont display it.
        if (day < currentDate){
            continue
        }
        // if it is a future day and the teacher is working on that day - get all possible hours
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

function checkIfBeforeNow(currentHour, currentMin, time){
    /**
     * Get current hour and min and a time string (XX:XX)
     * check if the time is before the current time.
     *
     * if so - return true, else return false
     */
    let hour = parseInt(time.split(":")[0]);
    let min = parseInt(time.split(":")[1]);

    if (hour < currentHour){
        return true
    }
    if (hour > currentHour){
        return false
    }
    if (min < currentMin){
        return true
    }
    return false
}

function getFreeTimeToday(working_hours, weeks_lessons, day) {
    let currentDate = new Date();
    let currentHour = currentDate.getUTCHours();
    let currentMin = currentDate.getUTCMinutes();
    let working_hours_array = getWorkingHoursForDay(working_hours, day);
    // get the day's lessons - if no lessons exist this would be undefined.
    let dayLessons = weeks_lessons[WEEKDAYS[day.getDay()]];
    let freeTime = [];
    working_hours_array.forEach(working_hours_subarray => {
        let i, j;
        for (i=0; i< working_hours_subarray.length; i++){
            if (working_hours_subarray[i] === 'busy'){
                continue
            }
            if (checkIfBeforeNow(currentHour, currentMin, working_hours_subarray[i])){
                working_hours_subarray[i] = 'busy';
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

function getFreeTimeOnDay(working_hours, weeks_lessons, day) {
    /**
     * Function gets a fay and working hours and scheduled lessons for a teacher and constructs the
     * free time struct for that day
     */
    let working_hours_array = getWorkingHoursForDay(working_hours, day);
    // get the day's lessons - if no lessons exist this would be undefined.
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
            // working_hours[i] should look like Sunday-11:00-14:00
            let start = working_hours[i].split('-')[1]; // gets start time (11:00 in example)
            let end = working_hours[i].split('-')[2]; // gets end time (14:00 in example)
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

export async function getStudentLastFeedbackByMail(student_mail) {
    const collectionRef = db.collection('students').doc(student_mail).collection('student_lessons');
    let studentLastLessonWithFeedback = [];
    let querySnapshot = await collectionRef.where('feedback_given', '==', true).
    orderBy('date_utc.full_date', 'desc').limit(1).get();

    querySnapshot.forEach(doc => {
        studentLastLessonWithFeedback.push(doc.data());
    });

    // no feedback given to student as of yet
    if (studentLastLessonWithFeedback.length === 0){
        return null
    }

    return studentLastLessonWithFeedback[0]

}