import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Potato Seeds Portal Login';

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/dashboard');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (error) {
      setError('Invalid email or password. Please try again.');
      setTimeout(() => {
        setError('');
      }, 5000);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="hidden md:flex md:w-4/5 bg-cover bg-center relative" style={{ backgroundImage: "url('/assets/images/1.jpg')" }}>
        <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center">
          {/* <h1 className="text-white text-5xl font-bold">Guide to the Best Harvest</h1> */}
        </div>
      </div>
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-16">
        <form className="w-full max-w-md" onSubmit={handleLogin}>
          <h2 className="text-3xl font-bold mb-1">Potato Seeds Portal</h2>
          <p className="text-sm text-gray-600 mb-6">Harvest Management System</p>
          {error && <div className="mb-6 p-3 bg-red-100 text-sm text-red-700 border border-red-400 rounded">{error}</div>}
          <div className="mb-5 relative">
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(email !== '')}
              required
              placeholder={emailFocused ? '' : 'Email'}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-700 focus:border-amber-400 sm:text-sm"
            />
            {(email || emailFocused) && <label htmlFor="email" className="absolute left-3 -top-3.5 bg-white px-1 text-sm text-gray-700">Email</label>}
          </div>
          <div className="mb-6 relative">
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(password !== '')}
              required
              placeholder={passwordFocused ? '' : 'Password'}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-700 focus:border-amber-400 sm:text-sm"
            />
            {(password || passwordFocused) && <label htmlFor="password" className="absolute left-3 -top-3.5 bg-white px-1 text-sm text-gray-700">Password</label>}
          </div>
          <div className="flex justify-center">
            <button type="submit" className="w-full py-2 px-4 bg-amber-800 text-white font-semibold rounded-full hover:bg-amber-900 duration-200">Login</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;