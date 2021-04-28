import React,{Component} from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import NavDropdown from 'react-bootstrap/NavDropdown'


export default class navbar extends Component {
    constructor() {
        super();
        this.state = { msg: '' };
    }
    componentWillMount()
    {
        var msg = <li className="nav-item">
        <a className="nav-link" href="/logout">Logout</a>
        </li> ;
        console.log("inside postdata");
        fetch('/secret',{
            method:'GET',
            headers:{
                "Content-Type":"application/json"
            }
        }).then(res => res.json())
        .then(json => {
            console.log(json.status);
            if(json.status===400)
            {
                msg = (<>
                    <li className="nav-item">
                    <a className="nav-link" href="/login">Login</a>
                    </li> 
                    <li className="nav-item">
                    <a className="nav-link" href="/signup">Register</a>
                    </li>  </>);
                
            }
            this.setState({msg:msg});
            
        });
        
        
    }
    render() {
        return (
            
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <a className="navbar-brand" href="#Home">Talent Pool</a>
                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                <ul className="navbar-nav ml-auto">
                    <li className="nav-item">
                    <a className="nav-link" href="/">Home</a>
                    </li>
                    <li className="nav-item">
                    <a className="nav-link" href="/profile">Profile</a>
                    </li> 
                    
                    {this.state.msg}
                        
                </ul>
                </div>
            </nav>
        )
    }
}
