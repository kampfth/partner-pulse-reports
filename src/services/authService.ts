
export async function authenticate(password: string): Promise<boolean> {
  // In a real app, this would make an API call to verify the password
  return new Promise((resolve) => {
    setTimeout(() => {
      // Updated password as requested
      const isValid = password === '4simmers@';
      resolve(isValid);
    }, 500);
  });
}
