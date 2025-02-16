// Validate email
const validEmail = (email) => {
  return /^[a-zA-Z0-9_.+-]+\.e\d+@cumail\.in$/i.test(email);
};

// Extract username
const extractUsername = (email) => {
    const match = email.match(/(?:^|\.)(e\d+)@/i);
    return match ? match[1] : null;
  };

export { validEmail, extractUsername };
