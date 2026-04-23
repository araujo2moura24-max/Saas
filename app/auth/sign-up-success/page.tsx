'use client'

import Link from "next/link"
import { CheckCircle, Mail, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <CardTitle className="text-2xl">Conta criada com sucesso!</CardTitle>
          <CardDescription className="text-base">
            Enviamos um email de confirmacao para voce
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-muted">
            <Mail className="w-5 h-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Verifique sua caixa de entrada e clique no link para ativar sua conta
            </p>
          </div>
          
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/auth/login">
                Ir para Login
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            
            <p className="text-xs text-muted-foreground">
              Nao recebeu o email? Verifique sua pasta de spam ou{" "}
              <Link href="/auth/sign-up" className="text-primary hover:underline">
                tente novamente
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
