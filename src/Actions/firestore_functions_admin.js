import {db} from '../Config/fire'
import {getTeacherByMail} from "./firestore_functions_teacher";
import {
    addStudentToTeacher,
    chooseTeacherForStudent,
    getStudentByMail,
    updateCredits
} from "./firestore_functions_student";

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
}

async function changeTeacherForStudent(student_mail, teacher_mail = null, teacher_deleted = false) {
    let studentData = await getStudentByMail(student_mail);
    let old_teacher_mail = studentData.teacher.email;
    let student_name = studentData.first_name + " " + studentData.last_name;
    let student_category = studentData.category;
    let teacherInfo = {};
    // choose a teacher for the student if one is not picked yet - this function also adds the student to the teacher's list of students.
    if (teacher_mail === null) {
        teacherInfo = await chooseTeacherForStudent(student_mail, student_name, student_category);
    }
    // if a teacher was already picked - get his info and add the student to his list.
    else{
        teacherInfo = await getTeacherByMail(teacher_mail);
        await addStudentToTeacher(teacherInfo.email, student_mail, student_name);
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
    // clear all future lessons of the student and the old teacher.
    await clearAllLessons(student_mail, old_teacher_mail, teacher_deleted);

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
    }

    for (const mail in allAdminMails){
        db.collection('admins').doc(mail.toString()).update({
            all_students: students,
            all_teachers: teachers
        })
    }
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
    let studentData = await getStudentByMail(student_mail);
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
    let lessons = [];
    let snapshot = db.collection('teachers').doc(teacherMail).collection('teacher_lessons')
        .where('student_mail', '==', student_mail)
        .where('date_utc.full_date', '>=', new Date()).get();

    snapshot.forEach(doc => {
        lessons.push(doc.data());
    });

    for (const lesson of lessons){
        db.collection('teachers').doc(teacherMail).collection('teacher_lessons').doc(lesson.lesson_id).delete();
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

}