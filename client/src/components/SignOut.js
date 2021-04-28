import React, { Component } from 'react'
import Navbar from './navbar'

export default class SignOut extends Component {
    constructor() {
        super();
        this.state = { msg: '' };
    }
    componentWillMount()
    {
        var msg = <h4>Logged Out</h4>;
        console.log("inside logout");
        fetch('/logout',{
            method:'GET',
            headers:{
                "Content-Type":"application/json"
            }
        }).then(res => res.json())
        .then(json => {
            if(json.status===400)
            {
                msg = <h4>Please Login first...</h4>;
                this.setState({msg:msg});
            }
            else
            {
                this.props.history.push('/login');

            }
            
            
        });
        
        
    }
    
    
    render() {
        //let msg = this.PostData();
        console.log("render");
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
