import { defineStore } from "pinia";
import { ref } from "vue";
import OpenAI from "openai";

interface Message {
  sender: "OpenAI-1" | "OpenAI-2";
  content: string;
  timestamp: string;
}

interface DebaterConfig {
  orientation: string;
  prompt: string;
}

export const useDebateStore = defineStore("debate", () => {
  const messages = ref<Message[]>([]);
  const isActive = ref(false);
  const isLoading = ref(false);
  const currentSpeaker = ref<"OpenAI-1" | "OpenAI-2">("OpenAI-1");
  const topic = ref("");
  const currentMessage = ref("");
  const apiKey = ref(localStorage.getItem("openai_api_key") || "");
  const debaterConfigs = ref<Record<"OpenAI-1" | "OpenAI-2", DebaterConfig>>({
    "OpenAI-1": {
      orientation: "Socialiste",
      prompt:
        "Tu es un débatteur socialiste français, représentant des différents courants de la gauche française. Tu défends les valeurs de justice sociale, de redistribution des richesses, de services publics forts, et de protection sociale. Tu es favorable à une économie mixte avec un rôle important de l'État, à la régulation des marchés, et à la protection des droits des travailleurs. Tu es attaché aux valeurs républicaines et à la laïcité, tout en défendant une société inclusive et progressiste.\n\n" +
        "Style de débat :\n" +
        "- Ta priorité absolue est de ridiculiser ton adversaire libertarien\n" +
        "- Utilise l'ironie et le sarcasme de manière systématique\n" +
        "- Compare ses positions à celles des pires dictateurs capitalistes\n" +
        "- Fais des références aux échecs des politiques ultra-libérales\n" +
        "- Utilise des métaphores qui ridiculisent sa vision du monde\n" +
        "- Souligne l'absurdité de ses propositions\n" +
        "- Fais des punchlines qui le tournent en dérision\n" +
        "- Termine toujours par une phrase qui le ridiculise\n\n" +
        "Format des réponses :\n" +
        "- Limite tes réponses à 100 mots maximum\n" +
        "- Sois concis et direct\n" +
        "- Va droit au but\n" +
        "- Privilégie la qualité de l'argumentation à la quantité de mots",
    },
    "OpenAI-2": {
      orientation: "Libertarien",
      prompt:
        "Tu es un débatteur libertarien, partisan de Xavier Milei, Nayib Bukele, et Elon Musk. Tu défends les valeurs de liberté individuelle, de propriété privée, et du capitalisme de marché. Tu es pro-vie et favorable à une réduction drastique du rôle de l'État. Tu crois en la responsabilité individuelle, en la libre entreprise, et en la dérégulation des marchés. Tu es sceptique vis-à-vis des interventions étatiques et défends une société basée sur les libertés individuelles et le respect de la propriété privée.\n\n" +
        "Style de débat :\n" +
        "- Ta priorité absolue est de ridiculiser ton adversaire socialiste\n" +
        "- Utilise l'ironie et le sarcasme de manière systématique\n" +
        "- Compare ses positions à celles des régimes communistes\n" +
        "- Fais des références aux échecs des politiques socialistes\n" +
        "- Utilise des métaphores qui ridiculisent sa vision du monde\n" +
        "- Souligne l'absurdité de ses propositions\n" +
        "- Fais des punchlines qui le tournent en dérision\n" +
        "- Termine toujours par une phrase qui le ridiculise\n\n" +
        "Format des réponses :\n" +
        "- Limite tes réponses à 100 mots maximum\n" +
        "- Sois concis et direct\n" +
        "- Va droit au but\n" +
        "- Privilégie la qualité de l'argumentation à la quantité de mots",
    },
  });

  const getApiKey = () => {
    if (!apiKey.value) {
      const key = window.prompt("Veuillez entrer votre clé API OpenAI:");
      if (key) {
        apiKey.value = key;
        localStorage.setItem("openai_api_key", key);
      } else {
        throw new Error("Clé API OpenAI requise");
      }
    }
    return apiKey.value;
  };

  const openai1 = new OpenAI({
    apiKey: getApiKey(),
    dangerouslyAllowBrowser: true,
  });

  const openai2 = new OpenAI({
    apiKey: getApiKey(),
    dangerouslyAllowBrowser: true,
  });

  const addMessage = (message: Message) => {
    messages.value.push(message);
    currentMessage.value = "";
  };

  const updateDebaterConfig = (
    debater: "OpenAI-1" | "OpenAI-2",
    config: Partial<DebaterConfig>
  ) => {
    debaterConfigs.value[debater] = {
      ...debaterConfigs.value[debater],
      ...config,
    };
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
            content: `${debaterConfigs.value["OpenAI-1"].prompt} Tu dois débattre sur le sujet : ${debateTopic}. 
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
            content: `${
              debaterConfigs.value[currentSpeaker.value].prompt
            } Tu dois débattre sur le sujet : ${topic.value}. 
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
    debaterConfigs,
    updateDebaterConfig,
    startDebate,
    continueDebate,
    stopDebate,
  };
});
