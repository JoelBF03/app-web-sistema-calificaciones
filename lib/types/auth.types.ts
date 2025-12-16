export interface LoginData {
  email: string;
  password: string;
}

export interface Usuario {
  id: string;
  email: string;
  rol: string;
}

export interface LoginResponse {
  access_token: string;
  usuario: Usuario;
}