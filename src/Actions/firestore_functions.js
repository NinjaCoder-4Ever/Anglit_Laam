import {db} from '../Config/fire'

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
export function setNewTeachers(uid, email, firstName, lastName, phoneNumber){
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
        students: []
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

    return chosenTeacher[0]
}

// ################################# LESSON FUNCTIONS #####################################