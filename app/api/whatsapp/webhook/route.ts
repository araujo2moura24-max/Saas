import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// Verificacao do webhook do WhatsApp (GET request)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  // Verificar o token de verificacao
  // O token deve ser configurado no dashboard do Meta
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "opscore_webhook_verify"

  if (mode === "subscribe" && token === verifyToken) {
    return new NextResponse(challenge, { status: 200 })
  }

  return new NextResponse("Forbidden", { status: 403 })
}

// Receber mensagens do WhatsApp (POST request)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Verificar se é uma notificacao de mensagem
    if (body.object !== "whatsapp_business_account") {
      return NextResponse.json({ status: "ignored" })
    }

    const supabase = await createClient()

    for (const entry of body.entry || []) {
      const businessAccountId = entry.id

      for (const change of entry.changes || []) {
        if (change.field !== "messages") continue

        const value = change.value
        const phoneNumberId = value.metadata?.phone_number_id

        // Buscar a integracao correspondente
        const { data: integration } = await supabase
          .from("whatsapp_integrations")
          .select("user_id")
          .eq("phone_number_id", phoneNumberId)
          .eq("status", "active")
          .single()

        if (!integration) continue

        const userId = integration.user_id

        // Processar contatos
        for (const contact of value.contacts || []) {
          const waId = contact.wa_id
          const profileName = contact.profile?.name || waId

          // Criar ou atualizar conversa
          const { data: conversation } = await supabase
            .from("conversations")
            .upsert({
              user_id: userId,
              contact_phone: waId,
              contact_name: profileName,
              channel: "whatsapp",
              updated_at: new Date().toISOString(),
            }, {
              onConflict: "user_id,contact_phone,channel",
            })
            .select()
            .single()

          if (!conversation) continue

          // Processar mensagens recebidas
          for (const message of value.messages || []) {
            if (message.from !== waId) continue

            let content = ""
            let messageType = message.type

            if (message.type === "text") {
              content = message.text?.body || ""
            } else if (message.type === "image") {
              content = "[Imagem]"
            } else if (message.type === "audio") {
              content = "[Audio]"
            } else if (message.type === "video") {
              content = "[Video]"
            } else if (message.type === "document") {
              content = "[Documento]"
            } else if (message.type === "location") {
              content = "[Localizacao]"
            } else if (message.type === "sticker") {
              content = "[Sticker]"
            } else {
              content = `[${message.type}]`
            }

            // Inserir mensagem
            await supabase.from("messages").insert({
              conversation_id: conversation.id,
              direction: "incoming",
              content,
              message_type: messageType,
              provider_message_id: message.id,
              status: "received",
            })

            // Atualizar ultima mensagem da conversa
            await supabase
              .from("conversations")
              .update({
                last_message: content,
                last_message_at: new Date().toISOString(),
                unread_count: conversation.unread_count + 1,
              })
              .eq("id", conversation.id)
          }

          // Processar status de mensagens enviadas
          for (const status of value.statuses || []) {
            const providerMessageId = status.id
            const newStatus = status.status // sent, delivered, read, failed

            await supabase
              .from("messages")
              .update({ status: newStatus })
              .eq("provider_message_id", providerMessageId)
          }
        }
      }
    }

    return NextResponse.json({ status: "ok" })
  } catch (error) {
    console.error("WhatsApp webhook error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
