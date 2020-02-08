import {db} from "../Config/fire";

export const WEEKDAYS = {
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

export async function getUserData(email) {
    /**
     * Function gets the data about a given user from the "users" collection.
     *
     * Returns {collection: *, email: *, uid: *}
     */
    const doc = await db.collection('users').doc(email).get();

    return doc.data()
}

export async function getUserDataByUid(uid) {
    /**
     * Function gets the user data from "users" collection by the uid of the user.
     *
     * Returns {collection: *, email: *, uid: *}
     */
    let returnVal = [];
    const snapshot = await db.collection('users').where('uid', '==', uid).get();
    snapshot.forEach(doc =>{
        returnVal.push(doc.data())
    });
    return returnVal[0]
}

// get all the values from a given collection where the given field has the given value.
export async function lookup(collection, field, value) {
    /**
     * Function is a general lookup function: looks for all the docs that have "value" in "field" in a given
     * "collection"
     *
     * Returns and array of docs data.
     */
    const values = [];
    const collectionRef = db.collection(collection);
    const snapshot = await collectionRef.where(field, '==', value).get();

    snapshot.docs.forEach(doc =>{
        values.push(doc.data())
    });

    return values
}

export function constructLessonId(student_mail, teacher_mail, date_utc_time){
    /**
     * Function returns a valid lesson id.
     *
     * Example: student@mail.com_teache@mail.com_2020-01-04T12:00:00.000Z
     */
    return student_mail + "_" + teacher_mail + "_" + date_utc_time
}

export function convertUtcToLocalTime(dateUtcTime){
    /**
     * Function converts ISO format UTC time string to local time string
     *
     * Returns: "Sat Jan 04 2020 16:40:29 GMT+0200 (שעון ישראל (חורף)) "
     */
    var localDate = new Date(dateUtcTime).toString();
    return localDate
}

// gets a local time string and converts it to utc ISO format string.
export function convertLocalTimeToUtc(localTimeDate){
    /**
     * Function gets a local date string and converts it to ISO format in UTC time.
     *
     * Returns: "2020-01-04T12:00:00.000Z"
     */
    var dateUtcTime = new Date(localTimeDate).toISOString();
    return dateUtcTime
}

export function applyTimezoneoffset(localTimeString){
    /**
     * Function converts a time only string ("14:00") to UTC time.
     * meaning if the local time offset is "+2 GMT" and the function is given "14:00"
     * it will return "12:00" - the time in UTC time.
     */
    let localTimeHours = parseInt(localTimeString.split(':')[0]);
    let localTimeMinutes = parseInt(localTimeString.split(':')[1]);
    let offsetInHours = (new Date().getTimezoneOffset() / 60).toString();
    let offsetHours = parseInt(offsetInHours.split('.')[0]);
    let utcHours = localTimeHours + offsetHours;
    let utcMin = localTimeMinutes;
    if ('-' === offsetInHours.slice(0,1)){
        if (offsetInHours.split('.').length === 2) {
            let offsetMin = parseInt(offsetInHours.split('.')[1]) * 60;
            utcMin = localTimeMinutes - offsetMin;
            if (utcMin < 0){
                utcMin = 60 - offsetMin;
                utcHours = utcHours - 1;
            }
        }
        if (utcHours < 0){
            utcHours = 24 + offsetHours;
        }
    }
    else {
        if (offsetInHours.split('.').length === 2) {
            let offsetMin = parseInt(offsetInHours.split('.')[1]) * 60;
            utcMin = localTimeMinutes + offsetMin;
            if (utcMin > 59){
                utcMin = utcMin - 60;
                utcHours = utcHours + 1;
            }
        }
        if (utcHours > 23){
            utcHours = offsetHours - 1;
        }

    }
    utcHours = utcHours.toString();
    utcMin = utcMin.toString();
    if (utcHours.length === 1){
        utcHours = "0" + utcHours;
    }
    if (utcMin.length === 1){
        utcMin = "0" + utcMin;
    }
    return utcHours + ":" + utcMin
}

export function checkSameWeek(date1, date2){
    /**
     * Function gets two dates and checks if they are in the same week.
     * function works by checking it both date's Sundays are the same.
     *
     * Returns true if both in the same week, and false otherwise.
     */
    let sundayOfDate1 = new Date(date1);
    sundayOfDate1.setDate(sundayOfDate1.getUTCDate() - sundayOfDate1.getUTCDay());
    let sundayOfDate2 = new Date(date2);
    sundayOfDate2.setDate(sundayOfDate2.getUTCDate() - sundayOfDate2.getUTCDay());
    return sundayOfDate1.toDateString() === sundayOfDate2.toDateString();
}

export async function getFullNameByUID(uid) {
    let userData = await getUserDataByUid(uid);
    let docRef = await db.collection(userData.collection).doc(userData.email).get();
    let first_name = docRef.data().first_name;
    let last_name = docRef.data().last_name;

    return first_name + " " + last_name
}