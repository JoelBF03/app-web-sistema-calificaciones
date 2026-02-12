'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from '@/lib/components/ui/card';
import { Button } from '@/lib/components/ui/button';
import { Input } from '@/lib/components/ui/input';
import { Label } from '@/lib/components/ui/label';
import { Separator } from '@/lib/components/ui/separator';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/lib/components/ui/dialog';
import { Badge } from '@/lib/components/ui/badge';
import { 
  Loader2, Lock, Mail, Eye, EyeOff, ShieldCheck, 
  ArrowLeft, KeyRound, UserCog, CheckCircle2 
} from 'lucide-react';
import { useUsuarios } from '@/lib/hooks/useUsuarios';
import { toast } from 'sonner';
import { Role, Estado } from '@/lib/types';

export default function ConfiguracionPage() {
  const router = useRouter();
  const { cambiarMiPassword, actualizarEmail, loading } = useUsuarios();
  
  const [usuario, setUsuario] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [showPasswords, setShowPasswords] = useState({ old: false, new: false, confirm: false });
  const [modalPasswordOpen, setModalPasswordOpen] = useState(false);
  const [emailData, setEmailData] = useState({ newEmail: '', confirmEmail: '' });
  const [modalEmailOpen, setModalEmailOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const usuarioData = localStorage.getItem('usuario');
    if (!token || !usuarioData) { router.push('/login'); return; }

    const parsedUser = JSON.parse(usuarioData);
    if (parsedUser.rol !== Role.ADMIN) {
      toast.error('Acceso restringido a administradores');
      router.push('/');
      return;
    }
    setUsuario(parsedUser);
    setIsAuthenticated(true);
  }, [router]);

  const getPasswordStrength = (pass: string) => {
    if (pass.length === 0) return { label: 'Esperando...', color: 'text-gray-400', pct: 0 };
    if (pass.length < 8) return { label: 'Débil', color: 'text-red-500', pct: 33 };
    if (pass.match(/[A-Z]/) && pass.match(/[0-9]/)) return { label: 'Fuerte', color: 'text-green-500', pct: 100 };
    return { label: 'Media', color: 'text-yellow-500', pct: 66 };
  };

  const handleCambiarPassword = async () => {
    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Todos los campos son obligatorios');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (passwordData.newPassword.length > 20) {
      toast.error('La contraseña no puede tener más de 20 caracteres');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Las contraseñas nuevas no coinciden');
      return;
    }

    if (passwordData.oldPassword === passwordData.newPassword) {
      toast.error('La nueva contraseña debe ser diferente a la actual');
      return;
    }

    try {
      await cambiarMiPassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      
      toast.success('Contraseña actualizada exitosamente');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setModalPasswordOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Error al cambiar la contraseña');
    }
  };

  const handleCambiarEmail = async () => {
    if (!emailData.newEmail || !emailData.confirmEmail) {
      toast.error('Todos los campos son obligatorios');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailData.newEmail)) {
      toast.error('El formato del email no es válido');
      return;
    }

    if (emailData.newEmail !== emailData.confirmEmail) {
      toast.error('Los emails no coinciden');
      return;
    }

    if (emailData.newEmail === usuario.email) {
      toast.error('El nuevo email debe ser diferente al actual');
      return;
    }

    try {
      await actualizarEmail(usuario.id, { email: emailData.newEmail });
      
      const updatedUser = { ...usuario, email: emailData.newEmail };
      localStorage.setItem('usuario', JSON.stringify(updatedUser));
      setUsuario(updatedUser);
      
      toast.success('Email actualizado exitosamente');
      setEmailData({ newEmail: '', confirmEmail: '' });
      setModalEmailOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Error al cambiar el email');
    }
  };

  const getRolLabel = (rol: string) => {
    switch (rol) {
      case Role.ADMIN: return 'ADMINISTRADOR';
      case Role.DOCENTE: return 'DOCENTE';
      case Role.SECRETARIA: return 'SECRETARÍA';
      default: return rol;
    }
  };

  const getRolColor = (rol: string) => {
    switch (rol) {
      case Role.ADMIN: return 'bg-blue-600';
      case Role.DOCENTE: return 'bg-green-600';
      case Role.SECRETARIA: return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  if (!isAuthenticated) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </Link>

              <UserCog className="w-8 h-8 text-blue-600" />

              <div>
                <CardTitle className="text-3xl">Configuración de Cuenta</CardTitle>
                <CardDescription>
                  Administra tus credenciales de acceso y seguridad del sistema
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                Estado de la Cuenta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label className="text-xs uppercase text-gray-500 font-bold">Rol Asignado</Label>
                <div className="flex">
                  <Badge className={`${getRolColor(usuario.rol)} px-3 py-1 text-white`}>
                    {getRolLabel(usuario.rol)}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase text-gray-500 font-bold">Estado de Acceso</Label>
                <div className="flex items-center gap-2 text-green-600 font-medium">
                  <div className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
                  Activo
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 text-slate-100 border-none shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Seguridad Recomendada
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-3 opacity-90">
              <p>• Usa más de 8 caracteres.</p>
              <p>• Combina Mayúsculas y Números.</p>
              <p>• Cambia tu clave cada 90 días.</p>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <Card className="border-t-4 border-t-blue-500 shadow-sm hover:shadow-md transition-all">
              <CardHeader>
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-1">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Email</CardTitle>
                <CardDescription>Acceso al sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium text-gray-700 bg-gray-50 p-3 rounded-md border border-dashed truncate">
                  {usuario.email}
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50/50 border-t pt-4">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setModalEmailOpen(true)}
                  disabled={loading}
                >
                  Cambiar Email
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-t-4 border-t-red-500 shadow-sm hover:shadow-md transition-all">
              <CardHeader>
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center mb-1">
                  <KeyRound className="h-5 w-5 text-red-600" />
                </div>
                <CardTitle className="text-xl">Contraseña</CardTitle>
                <CardDescription>Seguridad de cuenta</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium text-gray-700 bg-gray-50 p-3 rounded-md border border-dashed">
                  ••••••••••••
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50/50 border-t pt-4">
                <Button 
                  variant="outline" 
                  className="w-full text-red-600 hover:text-red-700" 
                  onClick={() => setModalPasswordOpen(true)}
                  disabled={loading}
                >
                  Actualizar Clave
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={modalPasswordOpen} onOpenChange={setModalPasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-600" />
              Cambiar Contraseña
            </DialogTitle>
            <DialogDescription>
              Ingresa tu contraseña actual y la nueva que deseas usar
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Contraseña Actual</Label>
              <div className="relative">
                <Input 
                   type={showPasswords.old ? 'text' : 'password'} 
                   value={passwordData.oldPassword}
                   onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                   disabled={loading}
                   placeholder="••••••••"
                />
                <button 
                  type="button"
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPasswords({...showPasswords, old: !showPasswords.old})}
                >
                  {showPasswords.old ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Nueva Contraseña</Label>
                <span className={`text-[10px] font-bold ${getPasswordStrength(passwordData.newPassword).color}`}>
                  {getPasswordStrength(passwordData.newPassword).label}
                </span>
              </div>
              <div className="relative">
                <Input 
                   type={showPasswords.new ? 'text' : 'password'} 
                   value={passwordData.newPassword}
                   onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                   disabled={loading}
                   placeholder="••••••••"
                />
                <button 
                  type="button"
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                >
                  {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${getPasswordStrength(passwordData.newPassword).color.replace('text', 'bg')}`}
                  style={{ width: `${getPasswordStrength(passwordData.newPassword).pct}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">Mínimo 8 caracteres, máximo 20</p>
            </div>
            <div className="space-y-2">
              <Label>Confirmar Nueva Contraseña</Label>
              <div className="relative">
                <Input 
                   type={showPasswords.confirm ? 'text' : 'password'} 
                   value={passwordData.confirmPassword}
                   onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                   disabled={loading}
                   placeholder="••••••••"
                />
                <button 
                  type="button"
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                >
                  {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                setModalPasswordOpen(false);
              }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700"
              onClick={handleCambiarPassword}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modalEmailOpen} onOpenChange={setModalEmailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 w-5 text-blue-600" />
              Actualizar Correo
            </DialogTitle>
            <DialogDescription>
              Ingresa tu nuevo correo electrónico
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm">
              <span className="text-blue-700 font-bold">Email actual:</span>
              <p className="text-blue-900 truncate">{usuario?.email}</p>
            </div>
            <div className="space-y-2">
              <Label>Nuevo Email</Label>
              <Input 
                type="email" 
                value={emailData.newEmail}
                onChange={(e) => setEmailData({...emailData, newEmail: e.target.value})}
                disabled={loading}
                placeholder="nuevo@ejemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Confirmar Nuevo Email</Label>
              <Input 
                type="email" 
                value={emailData.confirmEmail}
                onChange={(e) => setEmailData({...emailData, confirmEmail: e.target.value})}
                disabled={loading}
                placeholder="nuevo@ejemplo.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setEmailData({ newEmail: '', confirmEmail: '' });
                setModalEmailOpen(false);
              }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleCambiarEmail}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Actualizando...
                </>
              ) : (
                'Actualizar Correo'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}