import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verificar autenticacao
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
    }

    const { accessToken, phoneNumberId, businessAccountId, phoneNumber, accountName } = await request.json()

    // Validacao apenas dos campos obrigatorios (frontend validation)
    if (!accessToken?.trim() || !phoneNumberId?.trim() || !businessAccountId?.trim()) {
      return NextResponse.json({ error: "Preencha todos os campos obrigatorios" }, { status: 400 })
    }

    // Usar UPSERT para atualizar se já existir (UNIQUE constraint em user_id)
    const { data: integration, error: insertError } = await supabase
      .from("whatsapp_integrations")
      .upsert({
        user_id: user.id,
        access_token: accessToken.trim(),
        phone_number_id: phoneNumberId.trim(),
        business_account_id: businessAccountId.trim(),
        phone_number: phoneNumber?.trim() || phoneNumberId.trim(),
        account_name: accountName?.trim() || null,
        status: 'active',
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      })
      .select()
      .single()

    if (insertError) {
      console.error("Error saving integration:", insertError)
      return NextResponse.json({ 
        error: `Erro ao salvar: ${insertError.message}`,
        details: {
          code: insertError.code,
          hint: insertError.hint,
          message: insertError.message,
        }
      }, { status: 500 })
    }

    // Tentar validar com a Meta API em background (nao bloqueia)
    let validationStatus = "pending"
    let displayPhoneNumber = phoneNumber?.trim() || phoneNumberId.trim()

    try {
      const testResponse = await fetch(
        `https://graph.facebook.com/v18.0/${phoneNumberId.trim()}`,
        {
          headers: {
            "Authorization": `Bearer ${accessToken.trim()}`,
          },
        }
      )

      if (testResponse.ok) {
        const phoneData = await testResponse.json()
        validationStatus = "valid"
        displayPhoneNumber = phoneData.display_phone_number || displayPhoneNumber

        // Atualizar com o numero de telefone real se disponivel
        if (phoneData.display_phone_number) {
          await supabase
            .from("whatsapp_integrations")
            .update({ phone_number: phoneData.display_phone_number })
            .eq("id", integration.id)
        }
      } else {
        validationStatus = "unverified"
      }
    } catch {
      // Erro de validacao nao impede o salvamento
      validationStatus = "unverified"
    }

    return NextResponse.json({ 
      success: true, 
      validationStatus,
      integration: {
        id: integration.id,
        phoneNumber: displayPhoneNumber,
        connectedAt: integration.created_at,
      }
    })

  } catch (error) {
    console.error("Connect WhatsApp error:", error)
    return NextResponse.json({ error: "Erro interno. Tente novamente." }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verificar autenticacao
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Desativar integracao (usar status em vez de is_active)
    await supabase
      .from("whatsapp_integrations")
      .update({ status: 'inactive', updated_at: new Date().toISOString() })
      .eq("user_id", user.id)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Disconnect WhatsApp error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verificar autenticacao
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Buscar integracao ativa (usar status em vez de is_active)
    const { data: integration } = await supabase
      .from("whatsapp_integrations")
      .select("id, phone_number, created_at, status, account_name")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()

    if (!integration) {
      return NextResponse.json({ connected: false })
    }

    return NextResponse.json({ 
      connected: true,
      integration: {
        id: integration.id,
        phoneNumber: integration.phone_number,
        accountName: integration.account_name,
        connectedAt: integration.created_at,
      }
    })

  } catch (error) {
    console.error("Get WhatsApp status error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
