import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verificar autenticacao
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { conversationId, message } = await request.json()

    if (!conversationId || !message) {
      return NextResponse.json({ error: "Missing conversationId or message" }, { status: 400 })
    }

    // Buscar conversa
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .eq("user_id", user.id)
      .single()

    if (convError || !conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    // Buscar integracao WhatsApp
    const { data: integration, error: intError } = await supabase
      .from("whatsapp_integrations")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()

    if (intError || !integration) {
      return NextResponse.json({ error: "WhatsApp not connected" }, { status: 400 })
    }

    // Enviar mensagem via WhatsApp Cloud API
    const whatsappResponse = await fetch(
      `https://graph.facebook.com/v18.0/${integration.phone_number_id}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${integration.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: conversation.contact_phone,
          type: "text",
          text: { body: message },
        }),
      }
    )

    const whatsappData = await whatsappResponse.json()

    if (!whatsappResponse.ok) {
      console.error("WhatsApp API error:", whatsappData)
      return NextResponse.json({ 
        error: whatsappData.error?.message || "Failed to send message" 
      }, { status: 500 })
    }

    const waMessageId = whatsappData.messages?.[0]?.id

    // Salvar mensagem no banco
    const { data: newMessage, error: msgError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        direction: "outgoing",
        content: message,
        message_type: "text",
        provider_message_id: waMessageId,
        status: "sent",
      })
      .select()
      .single()

    if (msgError) {
      console.error("Error saving message:", msgError)
    }

    // Atualizar ultima mensagem da conversa
    await supabase
      .from("conversations")
      .update({
        last_message: message,
        last_message_at: new Date().toISOString(),
      })
      .eq("id", conversationId)

    return NextResponse.json({ 
      success: true, 
      message: newMessage,
      waMessageId 
    })

  } catch (error) {
    console.error("Send message error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
