import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '../firebase';
import { signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword } from 'firebase/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [showSignup, setShowSignup] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupError, setSignupError] = useState(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      const response = await fetch('http://localhost:5000/api/protected', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      console.log(data);
      navigate('/'); // Redirect to home page
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const token = await userCredential.user.getIdToken();
      const response = await fetch('http://localhost:5000/api/protected', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      console.log(data);
      navigate('/'); // Redirect to home page
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, signupEmail, signupPassword);
      setShowSuccessPopup(true);
      setTimeout(() => {
        setShowSuccessPopup(false);
        // Automatically log in with new credentials
        signInWithEmailAndPassword(auth, signupEmail, signupPassword)
          .then((userCredential) => {
            const token = userCredential.user.getIdToken();
            fetch('http://localhost:5000/api/protected', {
              headers: { Authorization: `Bearer ${token}` },
            })
              .then((response) => response.json())
              .then((data) => {
                console.log(data);
                navigate('/');
              });
          })
          .catch((err) => setSignupError(err.message));
      }, 2000); // Show success popup for 2 seconds
      setSignupEmail('');
      setSignupPassword('');
      setShowSignup(false);
    } catch (err) {
      setSignupError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleEmailLogin}>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              className="w-full p-2 border rounded"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              className="w-full p-2 border rounded"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Log In
          </button>
        </form>
        <button
          type="button"
          className="w-full mt-4 bg-red-500 text-white p-2 rounded hover:bg-red-600"
          onClick={handleGoogleLogin}
        >
          Sign In with Google
        </button>
        <p className="text-center mt-4 text-gray-600">Or create an account</p>
        <button
          type="button"
          className="w-full mt-2 bg-green-500 text-white p-2 rounded hover:bg-green-600"
          onClick={() => setShowSignup(true)}
        >
          Create Account
        </button>

        {showSignup && (
          <div className="mt-6">
            <h3 className="text-xl font-bold mb-4 text-center">Create Account</h3>
            {signupError && <p className="text-red-500 mb-4">{signupError}</p>}
            <form onSubmit={handleSignup}>
              <div className="mb-4">
                <label className="block text-gray-700">Email</label>
                <input
                  type="email"
                  className="w-full p-2 border rounded"
                  placeholder="Enter your email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700">Password</label>
                <input
                  type="password"
                  className="w-full p-2 border rounded"
                  placeholder="Enter your password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
              >
                Create
              </button>
              <button
                type="button"
                className="w-full mt-2 bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
                onClick={() => setShowSignup(false)}
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {showSuccessPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
            <div className="bg-white text-black p-4 rounded shadow-lg text-center">
              <p>Account created successfully!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;