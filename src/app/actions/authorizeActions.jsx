import { firebaseRef, firebaseAuth } from 'app/firebase/';
import moment from 'moment';
import { push } from 'react-router-redux';

// - Import action types
import * as types from 'actionTypes';

// - Import actions
import * as globalActions from 'globalActions';

import forge from 'node-forge';

/* _____________ CRUD DB _____________ */

/**
 * Log in user in server
 * @param {string} email 
 * @param {string} password 
 */
export var dbLogin = (email, password) => {
    return (dispatch, getState) => {

        // Encrypt password input to compare with that stored in db
        let bcrypt = require('bcryptjs');
        let ref = firebase.database().ref('/users');;
        ref.once('value', (snapshot) => {
            // find info of user with proper email
            for (let key in snapshot.val()) {
                let info = snapshot.val()[key]['info'];
                if (email.localeCompare(info.email) === 0) {
                    password = bcrypt.compareSync(password, info.password) ? info.password : password;
                    break;
                };
            }

            // Log in user if input matches credentials in db
            return firebaseAuth().signInWithEmailAndPassword(email, password).then((result) => {
                dispatch(globalActions.showNotificationSuccess());
                dispatch(login(result.uid));
                dispatch(push('/'));
            }, (error) => dispatch(globalActions.showErrorMessage(error.code)))
        });
    }
}

// Log out user in server
export var dbLogout = () => {
    return (dispatch, getState) => {
        return firebaseAuth().signOut().then((result) => {
            dispatch(logout());
            dispatch(push('/login'));

        }, (error) => dispatch(globalActions.showErrorMessage(error.code)));
    }
}

/**
 * Register user in database
 * @param {object} user 
 */
export var dbSignup = (user) => {
    return (dispatch, getState) => {
        dispatch(globalActions.showNotificationRequest());
        return firebaseAuth().createUserWithEmailAndPassword(user.email, user.password).then((signupResult) => {
            console.log("OUTPUT: Firebase signup")
            let rsa = forge.pki.rsa;
            console.log('OUTPUT: USERID is ' + signupResult.uid);
            // generate an RSA key pair asynchronously (uses web workers if available)
            // use workers: -1 to run a fast core estimator to optimize # of workers
            rsa.generateKeyPair({bits: 2048, workers: -1}, function(err, keypair) {
                if(err) {
                    console.log(err)
                } else {
                    let localStorage = window.localStorage;
                    // Generate a public key for symmetric encryption
                    // Note: a key size of 16 bytes will use AES-128, 24 => AES-192, 32 => AES-256
                    let key = forge.random.getBytesSync(16);
                    let iv = forge.random.getBytesSync(16);
                    localStorage.setItem('PUBkey', key);
                    localStorage.setItem('PUBiv', iv);
            
                    // keypair.privateKey, keypair.publicKey
                    let privateKey = keypair.privateKey;
                    let publicKey = keypair.publicKey;
            
                    // TODO: Save publicKey, key, iv to DB
                    // Save privateKey locally
                    localStorage.setItem('privPair', privateKey);
                    localStorage.setItem('pubPair', publicKey);
                    
                    firebase.database().ref(`keys/${signupResult.uid}/`).set({
                        key: key,
                        iv: iv
                    });
                    console.log('OUTPUT: KEY is ' + key);
                }
            });
            firebaseRef.child(`users/${signupResult.uid}/info`).set({
                ...user,
                avatar: 'noImage'
            }).then((result) => {
                dispatch(globalActions.showNotificationSuccess())
            }, (error) => dispatch(globalActions.showErrorMessage(error.code)));

            dispatch(signup({
                uid: signupResult.uid,
                ...user
            }));

            dispatch(push('/'));
             
        }, (error) => dispatch(globalActions.showErrorMessage(error.code)))
    }

}

/**
 * Change user's password
 * @param {string} newPassword 
 */
export const dbUpdatePassword = (newPassword) => {
    return (dispatch, getState) => {
        dispatch(globalActions.showNotificationRequest());
        firebaseAuth().onAuthStateChanged((user) => {
            if (user) {
                user.updatePassword(newPassword).then(() => {
                    // Update successful.
                    dispatch(globalActions.showNotificationSuccess());
                    dispatch(updatePassword());
                    dispatch(push('/'));
                }, (error) => {
                    // An error happened.
                    switch (error.code) {
                        case 'auth/requires-recent-login':
                            dispatch(globalActions.showErrorMessage(error.code));
                            dispatch(dbLogout());
                            break;
                        default:
                    }
                })
            }

        })
    }
}

/* _____________ CRUD State _____________ */

/**
 * Loing user
 * @param {string} uid 
 */
export var login = (uid) => {
    return { type: types.LOGIN, authed: true, uid };
}

/**
 * Logout user
 */
export var logout = () => {
    return { type: types.LOGOUT };
}

/**
 *  Register user
 * @param {object} user 
 */
export var signup = (user) => {
    return {
        type: types.SIGNUP,
        ...user
    };
}

/**
 * Update user's password
 */
export const updatePassword = () => {
    return { type: types.UPDATE_PASSWORD };
}

