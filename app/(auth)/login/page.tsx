'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { authService } from '@/lib/services/auth';
import { LoginData } from '@/lib/types/auth.types';
import { useAuthStore } from '@/lib/store/auth-store';
import Image from 'next/image';
import { Role } from '@/lib/types';
import { toast } from 'sonner';

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const login = useAuthStore((state) => state.login);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginData>();

    const onSubmit = async (data: LoginData) => {
        setIsLoading(true);
        setError('');

        try {
            const response = await authService.login(data);
            login(response.access_token, response.usuario);

            if (response.usuario.rol === Role.ADMIN) {
                router.replace('/admin');
            } else if (response.usuario.rol === Role.DOCENTE) {
                router.replace('/docente');
            }

        } catch (err: any) {
            const mensajeError = err.response?.data?.message || 'Error al iniciar sesión. Intenta nuevamente.';

            toast.error(mensajeError);
            setError(mensajeError);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 font-sans">
            <div className="flex justify-center items-center w-full max-w-7xl p-5">

                <div className="bg-white rounded-3xl shadow-2xl flex w-full max-w-5xl overflow-hidden 
                                md:max-w-3xl lg:max-w-5xl 
                                flex-col md:flex-row">

                    <div className="flex-[0.9] p-6 md:p-8 lg:p-10 flex flex-col justify-center gap-3 md:gap-4">

                        <div className="text-center mb-2">
                            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-600 to-yellow-500 bg-clip-text text-transparent tracking-wide">
                                Sistema Académico Institucional
                            </h2>
                        </div>
                        <div className="flex justify-center mb-4">
                            <Image
                                src="/logo.png"
                                alt="Logo de la Institución"
                                width={120}
                                height={120}
                                className="max-w-[80px] md:max-w-[100px] lg:max-w-[120px] h-auto"
                            />
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-5xl font-bold text-red-700 text-center mb-1">
                            Bienvenido
                        </h1>

                        <p className="text-base text-gray-600 text-center -mt-1 mb-6">
                            Ingrese sus credenciales para acceder
                        </p>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                            <div className="mb-4 relative">
                                <label className="block text-sm font-medium text-gray-900 mb-1">
                                    Correo Institucional
                                </label>
                                <input
                                    {...register('email', {
                                        required: 'El email es requerido'
                                    })}
                                    type="email"
                                    placeholder="correo@institucion.edu"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-black outline-none transition-all duration-300 focus:border-yellow-400 focus:shadow-[0_0_0_3px_rgba(255,215,0,0.2)]"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                                )}
                            </div>

                            <div className="mb-4 relative">
                                <label className="block text-sm font-medium text-gray-900 mb-1">
                                    Contraseña
                                </label>
                                <input
                                    {...register('password', {
                                        required: 'La contraseña es requerida',
                                        minLength: { value: 8, message: 'Mínimo 8 caracteres' }
                                    })}
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-black outline-none transition-all duration-300 focus:border-yellow-400 focus:shadow-[0_0_0_3px_rgba(255,215,0,0.2)]"
                                />
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                                )}
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-red-600 text-white border-none rounded-xl text-lg font-semibold cursor-pointer transition-colors duration-300 mt-3 tracking-wide hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Ingresando...
                                    </span>
                                ) : (
                                    'Ingresar'
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="hidden sm:hidden md:flex flex-[1.1] bg-cover bg-center bg-no-repeat 
                                    rounded-b-3xl md:rounded-r-3xl md:rounded-bl-none 
                                    flex-col justify-end items-center p-5 md:p-8 
                                    relative text-white min-h-[200px] md:min-h-[400px]"
                        style={{
                            backgroundImage: "url('/colegio.jpg')",
                            textShadow: '0 2px 5px rgba(0,0,0,0.4)'
                        }}>

                        <div className="absolute top-5 right-5 flex gap-3">
                            <div className="w-4 h-4 bg-yellow-400 rounded-full border border-white/70"></div>
                            <div className="w-4 h-4 bg-red-600 rounded-full border border-white/70"></div>
                            <div className="w-4 h-4 bg-gray-800 rounded-full border border-white/70"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}