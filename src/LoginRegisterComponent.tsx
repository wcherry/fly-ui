import React from 'react';

interface LoginRegisterProps  {
    onClose: () => void;
    onSubmit: (props: any) => void;
}

export function LoginRegister(props: LoginRegisterProps) {
    let [username, setUsername] = React.useState("");
    let [password, setPassword] = React.useState("");
    let [emailAddress, setEmailAddress] = React.useState("");
    let [isRegistering, setIsRegistering] = React.useState(false);
    return (
        <div className="dialog">
            <div className="dialog-header">
                <h2>Login/Register</h2>
            </div>
            <div className="dialog-body">
                <form>
                    <label>
                    Username:
                    <input type="text" name="username"  className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} />
                    </label>
                    <br />
                    <label>
                    Password:
                    <input type="password" name="password"  className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </label>
                    <br />
                    <div className='dialog-footer'>
                        <button onClick={(e) => {e.preventDefault(); props.onSubmit({register: isRegistering, username, password, emailAddress})}} className="dialog-button dialog-button-primary">Login</button>
                        <button onClick={(e) => {e.preventDefault(); props.onClose()}} className="dialog-button dialog-button-secondary">Close</button>
                    </div>
                    
                </form>
            </div>
        </div>
    );
}
