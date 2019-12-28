import {db} from '../Config/fire'

db.settings({ timestampsInSnapshots: true });

export function setNewStudent(email, firstName, lastName, phoneNumber){
    let newStudentData = {
        email: email,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        lessons_this_month:[],
        subscription: 'PAL',
        teacher: {},
        credits: 1
    };
    db.collection('students').add(newStudentData).then(ref =>{
        console.log('Added student with ID: ',ref.id)
    })
}

export async function getStudentByMail(email, ) {
    const values = [];
    const collectionRef = db.collection('students');
    await collectionRef.where('email','==', email).get().then(function(snapshot){
        snapshot.docs.forEach(doc => {
            values.push(doc.data())
        })
    });
    console.log(values[0]);
    return values[0]
}