import React from 'react'
import {getStudentByMail} from "../../Actions/firestore_functions_student";


class Home extends React.Component {
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
    }

    render() {
        return (
            <div>
                <div className="container">
                    <h4 className="center">Contact us</h4>
                    <p id = "demo">this is it:</p>
                </div>
            </div>
        );
    }
}
export default Home