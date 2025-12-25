// Auth (login/register) daha sonra eklenecek.
// Burada sadece fonksiyon imzalarını tutacağız.
export const auth = {
  login: async (_payload) => { throw new Error('Login henüz eklenmedi.'); },
  register: async (_payload) => { throw new Error('Register henüz eklenmedi.'); },
  logout: async () => { /* ileride */ }
};
