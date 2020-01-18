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
        lessons_this_month:{},
        subscription: 'PAL',
        teacher: {},
        credits: 1,
        uid: uid,
        last_log_on: new Date()
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
    const teacherInfo = await db.collection('students').doc(student_mail).get();

    return teacherInfo.data().teacher
}

async function setLogOnStudent(student_data){
    let currentDate = new Date();
    let lastLogOn = new Date();
    if (teacher_data !== undefined){
        if (teacher_data.last_log_on !== undefined){
            lastLogOn = new Date(teacher_data.last_log_on.toString());
        }
    }
    if (lastLogOn === undefined || currentDate.getMonth() !== lastLogOn.getMonth()){
        let newCurrentMonthLessons = await updateStudentMonthLessons(student_data.email,
            currentDate.getMonth() + 1, currentDate.getFullYear());
        student_data.lessons_this_month = newCurrentMonthLessons;
    }
    db.collection('students').doc(student_data.email).update({
        last_log_on: currentDate
    });
    return student_data
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
    const collectionRef = db.collection('students');
    const doc = await collectionRef.doc(email).get();

    return await setLogOnStudent(doc.data())
}

export async function getStudentByUID(uid) {
    /**
     * Function gets all the student's data by searching it's uid.
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
    let docs = [];
    const collectionRef = db.collection('students');
    const snapshot = await collectionRef.where('uid', '==', uid).get();

    snapshot.forEach(doc =>{
       docs.push(doc.data())
    });

    return await setLogOnStudent(docs[0])
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
    const collectionRef = db.collection('teachers');
    const doc = await collectionRef.doc(teacherMail).get();
    let current_student_list = doc.data().students;
    current_student_list.push(studentMail);

    await collectionRef.doc(teacherMail).update({
        "students": current_student_list
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
    const snapshot = await teacherCollection.get();
    let minimalStudents = 10000000000000000000;
    snapshot.forEach(doc => {
        let studentArray = doc.data().students;
        let numberOfStudents = studentArray.length;
        if (numberOfStudents <= minimalStudents) {

            if (chosenTeacher.length > 0){
                chosenTeacher.pop();
            }

            chosenTeacher.push(doc.data());
            minimalStudents = numberOfStudents;
        }
    });

    await addStudentToTeacher(chosenTeacher[0].email, studentMail);
     return {
        email: chosenTeacher[0].email,
        first_name: chosenTeacher[0].first_name,
        last_name: chosenTeacher[0].last_name
    }
}

// ################################# LESSON FUNCTIONS #####################################


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
    const thisMontLessons = [];
    const collectionRef = db.collection('students');
    const doc = await collectionRef.doc(email).get();
    let lessons = doc.data().lessons_this_month;
    let i;
    for (i = 0; i<lessons.length; i++){
        let lesson = lessons[i];
        lesson.local_date = convertUtcToLocalTime(lesson.date_utc.full_date_string);
        thisMontLessons.push(lesson)
    }

    return thisMontLessons
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
        local_date: local_date_string
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
    let today = new Date();
    const snapshot = await collectionRef.where('date_utc.full_date', '<=', today).get();
    snapshot.forEach(doc =>{
        let lessonData = doc.data();
        lessonData.local_date = convertUtcToLocalTime(lessonData.date_utc.full_date_string);
        pastLessons.push(lessonData)
     });

    return pastLessons
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
    if (teacher_mail == null){
        teacher_mail = getStudentTeacher(student_mail).email;
    }
    let lesson_id = constructLessonId(student_mail, teacher_mail, convertLocalTimeToUtc(local_date));
    const studentLessons = db.collection('students').doc(student_mail).collection('student_lessons');
    const doc = await studentLessons.doc(lesson_id).get();

    return doc.data()
}

async function checkLessonAvailability(student_mail, teacher_mail, start_time, duration) {
    const teacherLessons = db.collection('teachers').doc(teacher_mail).collection('teacher_lessons');
    let existingLessons = [];

    const snapshot = await teacherLessons.where('date_utc.full_date', '==', start_time).get();
    snapshot.forEach(doc => {
        existingLessons.push(doc.data());
    });

    if (existingLessons.length > 0){
        return false
    }

    if (duration > 30){
        let nextHalfHour = new Date(start_time.getTime() + 60000*30);
        const snapshot = await teacherLessons.where('date_utc.full_date', '==', nextHalfHour).get();
        snapshot.forEach(doc => {
            existingLessons.push(doc.data());
        });

        if (existingLessons.length > 0){
            return false
        }
    }

    return true
}

export async function setNewLesson(student_mail, teacher_mail, start_time, duration){
    /**
     * Function sets a new lesson in both "student_lessons" and "teacher_lessons" collections.
     *
     * If the lesson is in the current month, it will also be entered to the student's lessons_this_month field under
     * the "students" collection.
     *
     * If the lesson is in the current week, it will also be entered to the teacher's lessons_this_week field under
     * the "teachers" collection.
     *
     * returns true if lesson has been set and false otherwise
     */
    if (!(await checkLessonAvailability(student_mail, teacher_mail, start_time, duration))){
        return false
    }
    let currentLocalDate = new Date();
    const studentLessons = db.collection('students').doc(student_mail).collection('student_lessons');
    const teacherLessons = db.collection('teachers').doc(teacher_mail).collection('teacher_lessons');
    let utcLessonDate = start_time.toISOString();
    let lesson_id = constructLessonId(student_mail, teacher_mail, utcLessonDate);
    let hour = start_time.getUTCHours();
    let min = start_time.getUTCMinutes();
    if (hour < 10){
        hour = "0" + hour;
    }
    if (min < 10){
        min = "0" + min;
    }
    let lessonInfo = {
        teacher_mail: teacher_mail,
        student_mail: student_mail,
        duration: duration,
        date_utc: {
            year: start_time.getUTCFullYear(),
            month: start_time.getUTCMonth() + 1,
            day: start_time.getUTCDate(),
            time: hour + ":" + min,
            full_date: new Date(utcLessonDate),
            full_date_string: utcLessonDate
        },
        feedback: {
            grammar_corrections: "",
            pronunciation_corrections: "",
            vocabulary: "",
            home_work: "",
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

    if (start_time.getUTCMonth() === currentLocalDate.getUTCMonth()){
        const studentCollectionRef = db.collection('students');
        let studentData = await studentCollectionRef.doc(student_mail).get();
        let currentMonthLessons = studentData.data().lessons_this_month;
        currentMonthLessons[lesson_id] = lessonInfo;
        studentCollectionRef.doc(student_mail).update({
            lessons_this_month: currentMonthLessons
        });
    }
    if (checkSameWeek(currentLocalDate, start_time)){
        const teacherCollectionRef = db.collection('teachers');
        let teacherData = await  teacherCollectionRef.doc(teacher_mail).get();
        let currentWeekLessons = teacherData.data().lessons_this_week;
        currentWeekLessons[WEEKDAYS[start_time.getUTCDay()]][lesson_id] = lessonInfo;
        teacherCollectionRef.doc(teacher_mail).update({
            lessons_this_week: currentWeekLessons
        });
    }
    return true
}

export async function cancelLesson(student_mail, teacher_mail, lesson_date){
    /**
     * Function deletes an existing lesson in "student_lessons" and "teacher_lessons" collection.
     *
     * If the lesson is this month it will also be deleted from the student's lessons_this_month field under
     * the "students" collection.
     *
     * If the lesson is this week it will also be deleted from the teacher's lessons_this_week field under
     * the "teachers" collection.
     */
    let currentLocalDate = new Date();
    const studentLessons = db.collection('students').doc(student_mail).collection('student_lessons');
    const teacherLessons = db.collection('teachers').doc(teacher_mail).collection('teacher_lessons');
    let utcLessonDate = lesson_date.toISOString();
    let lesson_id = constructLessonId(student_mail, teacher_mail, utcLessonDate);
    studentLessons.doc(lesson_id).delete().then(function () {
        console.log("Deleted lesson in student lessons")
    });
    teacherLessons.doc(lesson_id).delete().then(function(){
       console.log("Deleted lesson in teacher lessons")
    });

    if (lesson_date.getUTCMonth() === currentLocalDate.getUTCMonth()){
        const studentCollectionRef = db.collection('students');
        let studentData = await studentCollectionRef.doc(student_mail).get();
        let currentMonthLessons = studentData.data().lessons_this_month;
        delete currentMonthLessons[lesson_id];
        studentCollectionRef.doc(student_mail).update({
            lessons_this_month: currentMonthLessons
        });
    }

    if (checkSameWeek(currentLocalDate, lesson_date)){
        const teacherCollectionRef = db.collection('teachers');
        let teacherData = await  teacherCollectionRef.doc(teacher_mail).get();
        let currentWeekLessons = teacherData.data().lessons_this_week;
        delete currentWeekLessons[WEEKDAYS[lesson_date.getUTCDay()]][lesson_id];
        teacherCollectionRef.doc(teacher_mail).update({
            lessons_this_week: currentWeekLessons
        });
    }

}

export async function getNextFourLessonsStudent(student_mail) {
    /**
     * Function returns the next four lessons in the "student_lessons" collection for a given student.
     *
     * Returns an array of size 4 of: {
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
            grammar_corrections: "",
            pronunciation_corrections: "",
            vocabulary: "",
            home_work: "",
        },
        started: false,
        feedback_given: false,
        no_show: false,
        lesson_id: lesson_id
    };
     */
    const collectionRef = db.collection('students').doc(student_mail).collection('student_lessons');
    let nextLessons = [];
    const snapshot = await collectionRef.where('started', '==', false).where("no_show", '==', false)
        .orderBy('date_utc.full_date').limit(4).get();

    snapshot.forEach(doc =>{
        let lessonInfo = doc.data();
        lessonInfo['local_date'] = convertUtcToLocalTime(doc.data().date_utc.full_date_string);
        nextLessons.push(lessonInfo)
    });

    return nextLessons
}

export async function getMonthLessonsStudent(student_mail, month_num, year){
    /**
     * Function gets the student's lessons occurring in the given month (and year)
     *
     * returns an array of: {
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
            grammar_corrections: "",
            pronunciation_corrections: "",
            vocabulary: "",
            home_work: "",
        },
        started: false,
        feedback_given: false,
        no_show: false,
        lesson_id: lesson_id
    };
     */
    const collectionRef = db.collection('students').doc(student_mail).collection('student_lessons');
    let monthLessons = [];
    const snapshot = await collectionRef.where('date_utc.month', '==', month_num)
        .where('date_utc.year', '==', year).get();

    snapshot.forEach(doc => {
        let lessonInfo = doc.data();
        lessonInfo['local_date'] = convertUtcToLocalTime(doc.data().date_utc.full_date_string);
        monthLessons.push(lessonInfo)
    });

    return monthLessons
}

export async function updateStudentMonthLessons(student_mail, month, year){
    /**
     * Function updates the lessons_this_month field under a student's doc in "students" collection.
     *
     * This function is meant to run at the beginning of each month.
     * @type {Date}
     */
    let currentDate = new Date();
    let nextMontLessons = await getMonthLessonsStudent(student_mail,
        month, year);
    const collectionRef = db.collection('students').doc(student_mail);
    let formattedMonthLessons = {};
    nextMontLessons.forEach(lesson => {
        formattedMonthLessons[lesson.lesson_id] = lesson
    });
    await collectionRef.update({
        lessons_this_month: formattedMonthLessons
    });
    return formattedMonthLessons
}
