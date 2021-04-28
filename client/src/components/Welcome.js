import React, { Component } from 'react'

export default class Welcome extends Component {
    constructor() {
        super();
        this.state = { msg: '' };
    }
    componentDidMount()
    {
        var msg = <h4>Your account is confirmed!! Please Login</h4>;
        console.log("inside welcome",this.props.match.params.confirmationCode);
        fetch('/confirm',{
            method:'POST',
            headers:{
                "Content-Type":"application/json"
            },
            body: JSON.stringify({
                confirmationCode:this.props.match.params.confirmationCode
            })
        }).then(res => res.json())
        .then(json => {
            if(json.status===400&&json.result!=="Account already active")
            {
                msg = <h4>Wrong code</h4>;
                
            }
            else if(json.result==="Account already active")
            {
                msg = <h4>Your account is already confirmed.</h4>
            }
            this.setState({msg:msg});
            
        });
        
        
    }
    render() {
        return (
            <div>
                {this.state.msg}
            </div>
        )
    }
}
