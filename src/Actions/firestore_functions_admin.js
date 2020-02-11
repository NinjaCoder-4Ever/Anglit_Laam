import {db} from '../Config/fire'
import {getTeacherByMail} from "./firestore_functions_teacher";
import {
    addStudentToTeacher,
    chooseTeacherForStudent,
    getStudentByMail, setNewLesson,
    updateCredits
} from "./firestore_functions_student";
import {WEEKDAYS} from "./firestore_functions_general"
import teacher from "../Views/Teacher/teacher";

export async function getAdminByUid(uid){
    let adminInfo = [];
    let snapshot = await db.collection('admins').where('uid', '==', uid).get();
    snapshot.forEach(doc => {
        adminInfo.push(doc.data());
    });
    return adminInfo[0]
}

export async function getAllAdminMails() {
    let adminsMails = [];
    let snapshot = await db.collection('admins').get();
    snapshot.forEach(admin => {
        adminsMails.push(admin.data().email);
    });

    return adminsMails
}

export async function deleteTeacher(teacher_mail) {
    let teacherData = await getTeacherByMail(teacher_mail);

    // delete from teachers collection
    await db.collection('teachers').doc(teacher_mail).delete();

    // change students teacher
    let students = teacherData.students;
    for (const student in students){
        await changeTeacherForStudent(student.student_mail, null, true);
    }

    let adminMails = await getAllAdminMails();
    let adminInfo = await db.collection('admins').doc(adminMails[0]).get();
    let teachers = adminInfo.data().all_teachers;
    delete teachers[teacher_mail];
    for (const mail of adminMails){
        db.collection('admins').doc(mail).update({
            all_teachers: teachers
        });
    }

    await db.collection('users').doc(teacher_mail).delete();
}

export async function changeTeacherForStudent(student_mail, teacher_mail = null, teacher_deleted = false) {
    let studentData = await getStudentByMail(student_mail);
    let old_teacher_mail = studentData.teacher.email;
    let student_name = studentData.first_name + " " + studentData.last_name;
    let student_category = studentData.category;
    let teacherInfo = {};
    // choose a teacher for the student if one is not picked yet - this function also adds the student to the teacher's list of students.
    if (teacher_mail === null) {
        teacherInfo = await chooseTeacherForStudent(student_mail, student_name, student_category, studentData.teacher.email);
        console.log('choose new teacher for student and connected him to the teacher')
    }
    // if a teacher was already picked - get his info and add the student to his list.
    else{
        teacherInfo = await getTeacherByMail(teacher_mail);
        await addStudentToTeacher(teacherInfo.email, student_mail, student_name);
        console.log('selected teacher now connected to student')
    }

    // update the new teacher data in the student's doc.
    let studentTeacherData = {
        first_name: teacherInfo.first_name,
        last_name: teacherInfo.last_name,
        email: teacherInfo.email,
        skype_username: teacherInfo.skype_username
    };
    db.collection('students').doc(student_mail).update({
        teacher: studentTeacherData
    });
    console.log('new teacher updated for student');
    // clear all future lessons of the student and the old teacher.
    await clearAllLessons(student_mail, old_teacher_mail, teacher_deleted);
    console.log('cleared all future lessons with old teacher');
    // go through all the admins
    let allAdminMails = await getAllAdminMails();
    let adminInfo = await db.collection('admins').doc(allAdminMails[0]).get();
    let students = adminInfo.data().all_students;
    let teachers = adminInfo.data().all_teachers;

    // update student's new teacher info
    students[student_mail]['teacher_mail'] = teacherInfo.email;
    students[student_mail]['teacher_name'] = teacherInfo.first_name + " " + teacherInfo.last_name;

    // update the new teacher's student list
    teachers[teacherInfo.email]['students'].push({
        'student_mail': student_mail,
        'student_name': student_name
    });

    // if the old teacher is not deleted take the student out of his list.
    if (!teacher_deleted){
        let old_teacher_new_student_list = [];
        teachers[old_teacher_mail].students.forEach(student => {
            if (student.student_mail !== student_mail){
                old_teacher_new_student_list.push(student);
            }
        });
        teachers[old_teacher_mail].students = old_teacher_new_student_list;
        db.collection('teachers').doc(old_teacher_mail).update({
            students: old_teacher_new_student_list
        });
        console.log('updated old teacher student list');
    }

    for (const mail of allAdminMails){
        console.log(mail);
        await db.collection('admins').doc(mail).update({
            all_students: students,
            all_teachers: teachers
        }).catch(function (error) {
            console.error("problem updating" + mail);
        })
    }
    console.log('updated admins records')
}

async function clearAllLessons(student_mail, teacher_mail, deleted = false){
    let lessons = [];
    let snapshot = await db.collection('students').doc(student_mail).collection('student_lessons')
        .where('student_mail', '==', student_mail)
        .where('teacher_mail', '==', teacher_mail)
        .where('date_utc.full_date', '>=', new Date()).get();
    snapshot.forEach(doc => {
        lessons.push(doc.data());
    });
    let creditsToReturn = lessons.length;
    for (const lesson of lessons){
        db.collection('students').doc(student_mail).collection('student_lessons').doc(lesson.lesson_id).delete();
        if (!deleted){
            db.collection('teachers').doc(teacher_mail).collection('teacher_lessons').doc(lesson.lesson_id).delete();
        }
    }
    // finally return credits for deleted lessons
    await updateCredits(student_mail, creditsToReturn);
}

export async function deleteStudent(student_mail){

    //should delete student from firebase
    //var user = firebase.auth().currentUser;

    //user.delete().then(function() {
        // User deleted.
    //}, function(error) {
        // An error happened.
    //});
    let studentData = await getStudentByMail(student_mail);
    console.log(studentData);
    let teacherMail = studentData.teacher.email;
    let teacherData = await getTeacherByMail(teacherMail);
    let studentList = teacherData.students;
    let newStudentList = [];
    for (const student of studentList){
        if (student.student_mail !== student_mail){
            newStudentList.push(student);
        }
    }
    db.collection('teachers').doc(teacherMail).update({
        students: newStudentList
    });
    // delete all future lessons
    let lessons = [];
    let snapshot = await db.collection('students').doc(student_mail).collection('student_lessons')
        .where('date_utc.full_date', '>=', new Date()).get();

    snapshot.forEach( doc => {
        lessons.push(doc.data())
    });

    for (const lesson of lessons){
        db.collection('teachers').doc(lesson.teacher_mail).collection('teacher_lessons').doc(lesson.lesson_id).delete();
    }

    db.collection('students').doc(student_mail).delete();

    let adminMails = await getAllAdminMails();
    let adminInfo = await db.collection('admins').doc(adminMails[0]).get();
    let teachers = adminInfo.data().all_teachers;
    let students = adminInfo.data().all_students;
    delete students[student_mail];
    teachers[teacherMail].students = newStudentList;
    for (const mail of adminMails){
        db.collection('admins').doc(mail).update({
            all_teachers: teachers,
            all_students: students
        });
    }

    await db.collection('users').doc(student_mail).delete();
}

export async function updateSubscriptionForStudent(student_mail, recurring, lessons_num) {
    await db.collection('students').doc(student_mail).update({
        subscription: {
            recurring: recurring,
            lessons_num: lessons_num
        }
    });

    let adminMails = await getAllAdminMails();
    let adminInfo = await db.collection('admins').doc(adminMails[0]).get();
    let students = adminInfo.data().all_students;
    students[student_mail]['subscription'] ={
        recurring: recurring,
        lessons_num: lessons_num
    };
    for (const mail of adminMails){
        db.collection('admins').doc(mail).update({
            all_students: students
        });
    }
}

export async function getAvailableTeachersInDate(uid, current_teacher_mail, student_mail, lesson_date) {
    let admin_data = await getAdminByUid(uid);
    let teacherMailList = Object.keys(admin_data.all_teachers);
    delete teacherMailList[current_teacher_mail];
    let lessonDay = WEEKDAYS[lesson_date.getDay()];
    let filteredTeacherList = [];
    let fullTeachersList = admin_data.all_teachers;

    // filter teachers who are not working on that day.
    for (const teacherMail of teacherMailList){
        if (teacherMail !== undefined) {
            if (fullTeachersList[teacherMail].working_days.includes(lessonDay)) {
                filteredTeacherList.push(teacherMail);
            }
        }
    }

    // no available teachers
    if (filteredTeacherList.length === 0){
        return [];
    }

    let studentData = await getStudentByMail(student_mail);
    let categoryFilteredList = [];
    for (const teacherMail of filteredTeacherList){
        if (teacherMail !== undefined){
            if (fullTeachersList[teacherMail].category.includes(studentData.category)){
                categoryFilteredList.push(teacherMail);
            }
        }
    }
    let finalList = [];
   let backupList = [];
   // prefer category applicable teachers to non applicable.
    //teachers who are working on that day and not in the same category will go in the backup list
    for (const teacherMail of filteredTeacherList){
        if (!categoryFilteredList.includes(teacherMail)){
            backupList.push(teacherMail);
        }
    }

    // get all category applicable teachers who are free on the lesson date.
    for (const teacherMail of categoryFilteredList){
        let snapshot = await db.collection('teachers').doc(teacherMail).collection('teacher_lessons')
            .where('date_utc.full_date', '==', lesson_date).get();
        if (snapshot.length !== 0){
            finalList.push({
                teacher_mail: teacherMail,
                teacher_name: fullTeachersList[teacherMail].teacher_name
            });
        }
    }

    // if no category applicable teachers are free - search the backup list.
    if (finalList.length === 0){
        for (const teacherMail of backupList){
            let snapshot = await db.collection('teachers').doc(teacherMail).collection('teacher_lessons')
                .where('date_utc.full_date', '==', lesson_date).get();
            if (snapshot.length !== 0){
                finalList.push({
                    teacher_mail: teacherMail,
                    teacher_name: fullTeachersList[teacherMail].teacher_name
                });
            }
        }
    }

    return finalList;
}

export async function swapTeachersForLesson(lesson_data, new_teacher_mail, new_teacher_name) {
    let old_lesson_id = lesson_data.lesson_id;
    let old_teacher_mail = lesson_data.teacher_mail;
    let student_mail = lesson_data.student_mail;
    // delete existing lesson.
    await db.collection('students').doc(student_mail).collection('student_lessons').doc(old_lesson_id).delete();
    await db.collection('teachers').doc(old_teacher_mail).collection('teacher_lessons').doc(old_lesson_id).delete();

    await setNewLesson(student_mail, new_teacher_mail,
        lesson_data.start, lesson_data.duration, lesson_data.student_name, new_teacher_name, false);
}

export async function getAllStudents(){
    let studentsInfo = [];
    let snapshot = await db.collection('students').get();
    snapshot.forEach(student => {
        studentsInfo.push(student.data());
    });
    return studentsInfo;
}

export async function editTeacherContactInfo(teacher_mail, phone_number, skype_username, student_list) {
    await db.collection('teachers').doc(teacher_mail).update({
        phone_number: phone_number,
        skype_username: skype_username
    });
    for (const studentInfo of student_list){
        await db.collection('students').doc(studentInfo.student_mail).update({
            "teacher.skype_username": skype_username
        });
    }

    let adminMails = await getAllAdminMails();
    let adminInfo = await db.collection('admins').doc(adminMails[0]).get();
    let teachers = adminInfo.data().all_teachers;
    teachers[teacher_mail]['phone_number'] = phone_number;
    teachers[teacher_mail]['skype_username'] = skype_username;
    for (const mail of adminMails){
        db.collection('admins').doc(mail).update({
            all_teachers: teachers
        });
    }
}

export async function editTeacherCategory(teacher_mail, category_list) {
    await db.collection('teachers').doc(teacher_mail).update({
        category: category_list
    });

    let adminMails = await getAllAdminMails();
    let adminInfo = await db.collection('admins').doc(adminMails[0]).get();
    let teachers = adminInfo.data().all_teachers;
    teachers[teacher_mail]['category'] = category_list;
    for (const mail of adminMails){
        db.collection('admins').doc(mail).update({
            all_teachers: teachers
        });
    }
}

export async function editStudentCategory(stuent_mail, category) {
    await db.collection('students').doc(stuent_mail).update({
        category: category
    });

    let adminMails = await getAllAdminMails();
    let adminInfo = await db.collection('admins').doc(adminMails[0]).get();
    let students = adminInfo.data().all_students;
    students[stuent_mail]['category'] = category;
    for (const mail of adminMails){
        db.collection('admins').doc(mail).update({
            all_students: students
        });
    }
}