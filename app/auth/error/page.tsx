'use client'

import Link from "next/link"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Erro de Autenticacao</CardTitle>
          <CardDescription className="text-base">
            Ocorreu um erro durante o processo de autenticacao
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Isso pode acontecer se o link expirou ou ja foi utilizado.
            Por favor, tente fazer login novamente.
          </p>
          
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/auth/login">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Login
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link href="/auth/sign-up">
                Criar nova conta
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
