import CryptoJS from 'crypto-js';

const secretKey = process.env.REACT_APP_SECRET_KEY + Date.now().toString();

export const encryptData = (data) => {
  return CryptoJS.AES.encrypt(data, secretKey).toString();
};

export const decryptData = (ciphertext) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export const setEncryptedUserRole = (role) => {
  const encryptedRole = encryptData(role);
  localStorage.setItem('userRole', encryptedRole);
};

export const getDecryptedUserRole = () => {
  const encryptedRole = localStorage.getItem('userRole');
  if (encryptedRole) {
    return decryptData(encryptedRole);
  }
  return null;
};
