import {db} from '../Config/fire'
import {getTeacherByMail} from "./firestore_functions_teacher";
import {chooseTeacherForStudent, getStudentByMail} from "./firestore_functions_student";

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

    students.forEach(student => {
        changeTeacherForStudent(student.student_mail, null, true)
    })
}

async function changeTeacherForStudent(student_mail, teacher_mail = null, teacher_deleted = false) {
    let studentData = await getStudentByMail(student_mail);
    let student_name = studentData.first_name + " " + studentData.last_name;
    let student_category = studentData.category;
    let teacherInfo = {};
    // choose a teacher for the student if one is not picked yet.
    if (teacher_mail === null) {
        teacherInfo = await chooseTeacherForStudent(student_mail, student_name, student_category);
    }
    else{
        teacherInfo = await getTeacherByMail(teacher_mail);
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

    // go through all the admins
    let allAdmins = await getAllAdminMails();
    allAdmins.forEach(adminMail => {
        let adminData = db.collection('admins').doc(adminMail).get();
        let teachers = adminData.data().all_teachers;
        let newTeachers = [];
        teachers.forEach(teacher => {
            // update the students array for the new teacher (in admin's doc)
            if (teacher.teacher_mail === teacherInfo.email){
                teacher.students.push({
                    student_mail: student_mail,
                    student_name: student_name
                });
            }
            // if the old teacher was not deleted
            if (!teacher_deleted){
                // take the student out of the old teacher's students array list (in admin doc)
                if (teacher.teacher_mail === studentData.teacher.email){
                    let students = teacher.students;
                    let newStudentsList = [];
                    students.forEach(student => {
                        if (student.student_mail !== student_mail){
                            newStudentsList.push(student);
                        }
                    });
                    teacher.students = newStudentsList;
                }
                newTeachers.push(teacher)
            }
            // if the old teacher was deleted take him out of the teachers array (in the admin doc)
            else {
                if (teacher.teacher_mail !== studentData.teacher.email){
                    newTeachers.push(teacher)
                }
            }

        });
        // update teachers list in admins doc
        db.collection('admins').doc(adminMail).update({
            all_teachers: newTeachers
        });
    });
}
