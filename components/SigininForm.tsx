export function SigninForm() {
    return (
        <form method='POST'>
            <div>
                <label for='username'>Email</label> <br />
                <input type='email' id='username' name='username' required autofocus />
            </div>
            <div>
                <label for='password'>Password</label> <br />
                <input type='password' name='password' id='password' required />
            </div>
            <button>Sign In</button>
        </form>
    );
}
