import React from 'react'
import {getStudentByMail} from "../../Actions/firestore_functions_student";


class ContactUs extends React.Component {
    constructor() {
        super();
        this.state = {
            first_name: '',
            last_name: '',
            email: '',
            credits: 0,
            lessons_this_month: {},
            phone_number: '',
            subscription: '',
            teacher: {},
            uid: ''
        };
    }
    connectData(data){
        this.setState({
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            credits: data.credits,
            lessons_this_month: data.lessons_this_month,
            phone_number: data.phone_number,
            subscription: data.subscription,
            teacher: data.teacher,
            uid: ''
        })
    }
    componentDidMount() {
        getStudentByMail('some@mail.com').then(this.connectData.bind(this));
    }

    render() {
        return (
            <div>
                <div className="container">
                    <h4 className="center">Contact us</h4>
                    <p id = "demo">this is it: {this.state.first_name}</p>
                </div>
            </div>
        );
    }
}
export default ContactUs;