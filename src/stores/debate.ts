import { defineStore } from "pinia";
import { ref } from "vue";
import OpenAI from "openai";

interface Message {
  sender: "OpenAI-1" | "OpenAI-2";
  content: string;
  timestamp: string;
}

export const useDebateStore = defineStore("debate", () => {
  const messages = ref<Message[]>([]);
  const isActive = ref(false);
  const isLoading = ref(false);
  const currentSpeaker = ref<"OpenAI-1" | "OpenAI-2">("OpenAI-1");
  const topic = ref("");
  const currentMessage = ref("");

  const openai1 = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const openai2 = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const addMessage = (message: Message) => {
    messages.value.push(message);
    currentMessage.value = "";
  };

  const startDebate = async (debateTopic: string) => {
    console.log("🚀 Démarrage du débat sur le sujet:", debateTopic);
    isActive.value = true;
    topic.value = debateTopic;
    currentSpeaker.value = "OpenAI-1";

    try {
      console.log(`🤖 ${currentSpeaker.value} prépare sa réponse...`);
      isLoading.value = true;

      console.log("📤 Envoi de la requête à OpenAI...");
      const stream = await openai1.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `Tu es un expert en débat. Tu dois débattre sur le sujet : ${debateTopic}. 
            Tu es le premier débatteur. Commence le débat en présentant ton point de vue de manière concise et argumentée.
            Ne t'identifie pas dans ta réponse, commence directement par ton argument.`,
          },
        ] as OpenAI.Chat.ChatCompletionMessageParam[],
        stream: true,
      });

      let fullContent = "";
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        fullContent += content;
        currentMessage.value = fullContent;
      }

      console.log("📥 Réponse complète reçue de OpenAI");
      addMessage({
        sender: currentSpeaker.value,
        content: fullContent,
        timestamp: new Date().toLocaleTimeString(),
      });

      console.log(`🔄 Passage au prochain débatteur: OpenAI-2`);
      currentSpeaker.value = "OpenAI-2";
    } catch (error) {
      console.error("❌ Erreur lors du débat:", error);
    } finally {
      isLoading.value = false;
    }
  };

  const continueDebate = async () => {
    if (!isActive.value) return;

    try {
      console.log(`🤖 ${currentSpeaker.value} prépare sa réponse...`);
      isLoading.value = true;
      const currentLLM =
        currentSpeaker.value === "OpenAI-1" ? openai1 : openai2;
      const nextSpeaker =
        currentSpeaker.value === "OpenAI-1" ? "OpenAI-2" : "OpenAI-1";

      console.log("📤 Envoi de la requête à OpenAI...");
      const stream = await currentLLM.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `Tu es un expert en débat. Tu dois débattre sur le sujet : ${
              topic.value
            }. 
            Tu es ${
              currentSpeaker.value === "OpenAI-1" ? "le premier" : "le second"
            } débatteur.
            Réponds de manière concise et argumentée, en tenant compte des messages précédents.
            Ne t'identifie pas dans ta réponse, commence directement par ton argument.`,
          },
          ...messages.value.map((msg) => ({
            role: msg.sender === currentSpeaker.value ? "assistant" : "user",
            content: msg.content,
          })),
        ] as OpenAI.Chat.ChatCompletionMessageParam[],
        stream: true,
      });

      let fullContent = "";
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        fullContent += content;
        currentMessage.value = fullContent;
      }

      console.log("📥 Réponse complète reçue de OpenAI");
      addMessage({
        sender: currentSpeaker.value,
        content: fullContent,
        timestamp: new Date().toLocaleTimeString(),
      });

      console.log(`🔄 Passage au prochain débatteur: ${nextSpeaker}`);
      currentSpeaker.value = nextSpeaker;
    } catch (error) {
      console.error("❌ Erreur lors du débat:", error);
    } finally {
      isLoading.value = false;
    }
  };

  const stopDebate = () => {
    console.log("🛑 Arrêt du débat");
    isActive.value = false;
    isLoading.value = false;
    topic.value = "";
    messages.value = [];
    currentMessage.value = "";
  };

  return {
    messages,
    isActive,
    isLoading,
    currentSpeaker,
    topic,
    currentMessage,
    startDebate,
    continueDebate,
    stopDebate,
  };
});
