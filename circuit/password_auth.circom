pragma circom 2.0.0;

template PasswordAuth() {
    signal input passwordHash;
    signal input secret;
    signal output isValid;

    isValid <== (passwordHash == secret);
}

component main = PasswordAuth();
