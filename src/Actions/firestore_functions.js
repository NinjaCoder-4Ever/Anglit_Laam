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
        teacher: {}
    };
    db.collection('students').add(newStudentData).then(ref =>{
        console.log('Added student with ID: ',ref.id)
    })

}