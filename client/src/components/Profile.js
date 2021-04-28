import React, { Component } from 'react'

import Navbar from './navbar';
import UserProfile from './UserProfile';

export default class Profile extends Component {
    constructor() {
        super();
        this.state = { msg: '' };
    }
    componentWillMount()
    {
        var msg = '';
        console.log("inside postdata");
        fetch('/secret',{
            method:'GET',
            headers:{
                "Content-Type":"application/json"
            }
        }).then(res => res.json())
        .then(json => {
            if(json.status===400)
            {
                msg = <h4>Please Login first...</h4>;
                
            }
            else
            {
                msg = <UserProfile data={json.data} />;
            }
            this.setState({msg:msg});
            
        });
        
        
    }
    
    
    render() {
        return (
            <>
                <div>
                    <Navbar></Navbar>
                    {this.state.msg}
                </div>
            </>
        )
    }
}
