import React from 'react';

interface LoginRegisterProps  {
    onClose: () => void;
    onSubmit: (props: any) => void;
}

export function LoginRegister(props: LoginRegisterProps) {
    let [username, setUsername] = React.useState("");
    let [password, setPassword] = React.useState("");
    let [emailAddress, setEmailAddress] = React.useState("");
    let [repeatPassword, setRepeatPassword] = React.useState("");
    let [isRegistering, setIsRegistering] = React.useState(false);
    return (
        <div className="dialog">
            <div className="dialog-header">
                <h2>{isRegistering ? "Register New User" : "Login User"}</h2>
                <div className="tab-header"><button onClick={() => setIsRegistering(false)}>Login</button><button onClick={() => setIsRegistering(true)}>Register</button></div>
            </div>
            <div className="dialog-body">
                <form>
                    <label htmlFor='username'>
                    Username:
                    <input id="username"type="text" name="username"  className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} />
                    </label>
                    <br />
                    <label htmlFor='password'>
                    Password:
                    <input id="password" type="password" name="password"  className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </label>
                    <br />
                    {isRegistering ? <>
                    <label htmlFor='repeatPassword'>
                    Repeat Password:
                    <input id="repeatPassword" type="password" name="repeatPassword"  className="form-control" value={repeatPassword} onChange={(e) => setRepeatPassword(e.target.value)} />
                    </label>
                    <br />
                    <label htmlFor='emailAddress'>
                    Email Address:
                    <input id="emailAddress" type="email" name="emailAddress"  className="form-control" value={emailAddress} onChange={(e) => setEmailAddress(e.target.value)} />
                    </label>
                    <br />
                    </> : ""}
                    <div className='dialog-footer'>
                        <button onClick={(e) => {e.preventDefault(); props.onSubmit({register: isRegistering, username, password, emailAddress})}} className="dialog-button dialog-button-primary">{isRegistering ? "Register" : "Login"}</button>
                        <button onClick={(e) => {e.preventDefault(); props.onClose()}} className="dialog-button dialog-button-secondary">Close</button>
                    </div>
                    
                </form>
            </div>
        </div>
    );
}
