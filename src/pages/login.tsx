import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import { z } from 'zod';

const loginUserFormSchema = z.object({
  email: z
    .string()
    .email({ message: 'O email inserido é inválido' })
    .toLowerCase(),
  password: z.string().min(1, { message: 'A senha é obrigatória' })
});

type loginUserFormData = z.infer<typeof loginUserFormSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<loginUserFormData>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    resolver: zodResolver(loginUserFormSchema)
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [showPassword, setShowPassword] = useState<boolean>(false);

  const onSubmit = async (data: loginUserFormData) => {
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3333/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Erro ao fazer login');
      }

      const { token } = responseData;

      document.cookie = `AUTH_TOKEN=${token}; path=/`;

      navigate('/');
    } catch (error) {
      if (
        (error as Error).message.includes("Can't reach database server") ||
        (error as Error).message.includes('Failed to fetch')
      ) {
        toast.error('Erro', {
          description: 'Erro interno do servidor!'
        });
      } else {
        toast.error('Erro', {
          description: (error as Error).message
        });
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="h-screen px-4 py-6 space-y-12 md:px-10 flex items-center justify-center bg-zinc-950 text-zinc-50 antialiased">
      <Toaster richColors />
      <div className="space-y-2">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Entrar</CardTitle>
            <CardDescription>
              Insira suas credenciais abaixo para entrar em sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="m@example.com"
                  type="email"
                  disabled={isLoading}
                  {...register('email')}
                />
                {errors.email && (
                  <span className="inline-block text-sm text-red-500">
                    {errors.email.message}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between space-x-12">
                  <Label htmlFor="password">Senha</Label>
                  <Link
                    className="ml-auto inline-block text-sm underline"
                    to="#"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    disabled={isLoading}
                    {...register('password')}
                  />

                  <Button
                    className="absolute bottom-1 right-1 h-7 w-7"
                    size="icon"
                    variant="ghost"
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={isLoading}
                  >
                    {showPassword && <Eye className="h-4 w-4" />}
                    {!showPassword && <EyeOff className="h-4 w-4" />}
                    <span className="sr-only">
                      Alterar visibilidade da senha
                    </span>
                  </Button>
                </div>
                {errors.password && (
                  <span className="inline-block text-sm text-red-500">
                    {errors.password.message}
                  </span>
                )}
              </div>

              <Button disabled={isLoading} className="w-full" type="submit">
                {isLoading && (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                )}
                Entrar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
