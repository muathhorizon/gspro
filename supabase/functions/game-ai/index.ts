import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface StartGameRequest {
  playerName: string;
  themeId: string;
  difficulty: string;
}

interface AskQuestionRequest {
  sessionId: string;
  question: string;
}

interface SubmitGuessRequest {
  sessionId: string;
  guess: string;
  timeSpent: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const url = new URL(req.url);
    const path = url.pathname;

    if (path.endsWith("/start-game") && req.method === "POST") {
      const { playerName, themeId, difficulty }: StartGameRequest = await req.json();

      const { data: entities, error: entitiesError } = await supabase
        .from("entities")
        .select("*")
        .eq("theme_id", themeId)
        .eq("difficulty", difficulty);

      if (entitiesError || !entities || entities.length === 0) {
        const { data: allEntities } = await supabase
          .from("entities")
          .select("*")
          .eq("theme_id", themeId);
        
        if (!allEntities || allEntities.length === 0) {
          throw new Error("No entities found for this theme");
        }
        
        const randomEntity = allEntities[Math.floor(Math.random() * allEntities.length)];
        
        const { data: session, error: sessionError } = await supabase
          .from("game_sessions")
          .insert({
            player_name: playerName,
            theme_id: themeId,
            entity_id: randomEntity.id,
            difficulty: difficulty,
          })
          .select()
          .single();

        if (sessionError) throw sessionError;

        const initialQuestions = generateInitialQuestions(randomEntity.attributes);

        return new Response(
          JSON.stringify({
            sessionId: session.id,
            questions: initialQuestions,
            maxQuestions: difficulty === "easy" ? 15 : difficulty === "medium" ? 12 : 10,
            timeLimit: difficulty === "easy" ? 300 : difficulty === "medium" ? 240 : 180,
          }),
          {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      const randomEntity = entities[Math.floor(Math.random() * entities.length)];

      const { data: session, error: sessionError } = await supabase
        .from("game_sessions")
        .insert({
          player_name: playerName,
          theme_id: themeId,
          entity_id: randomEntity.id,
          difficulty: difficulty,
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      const initialQuestions = generateInitialQuestions(randomEntity.attributes);

      return new Response(
        JSON.stringify({
          sessionId: session.id,
          questions: initialQuestions,
          maxQuestions: difficulty === "easy" ? 15 : difficulty === "medium" ? 12 : 10,
          timeLimit: difficulty === "easy" ? 300 : difficulty === "medium" ? 240 : 180,
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (path.endsWith("/ask-question") && req.method === "POST") {
      const { sessionId, question }: AskQuestionRequest = await req.json();

      const { data: session, error: sessionError } = await supabase
        .from("game_sessions")
        .select("*, entities(*)")
        .eq("id", sessionId)
        .single();

      if (sessionError) throw sessionError;

      const entity = (session as any).entities;
      const answer = analyzeQuestion(question, entity.attributes);

      const conversation = [...(session.conversation as any[]), { question, answer }];

      await supabase
        .from("game_sessions")
        .update({
          questions_asked: session.questions_asked + 1,
          conversation: conversation,
        })
        .eq("id", sessionId);

      const nextQuestions = generateContextualQuestions(
        entity.attributes,
        conversation,
        answer
      );

      return new Response(
        JSON.stringify({
          answer,
          questionsAsked: session.questions_asked + 1,
          nextQuestions,
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (path.endsWith("/submit-guess") && req.method === "POST") {
      const { sessionId, guess, timeSpent }: SubmitGuessRequest = await req.json();

      const { data: session, error: sessionError } = await supabase
        .from("game_sessions")
        .select("*, entities(*)")
        .eq("id", sessionId)
        .single();

      if (sessionError) throw sessionError;

      const entity = (session as any).entities;
      const isCorrect = entity.name.toLowerCase() === guess.toLowerCase();

      const score = isCorrect
        ? calculateScore(session.questions_asked, timeSpent, session.difficulty)
        : 0;

      await supabase
        .from("game_sessions")
        .update({
          status: isCorrect ? "won" : "lost",
          time_spent: timeSpent,
          score: score,
          completed_at: new Date().toISOString(),
        })
        .eq("id", sessionId);

      if (isCorrect) {
        await supabase.from("leaderboard").insert({
          player_name: session.player_name,
          theme_id: session.theme_id,
          difficulty: session.difficulty,
          score: score,
          questions_asked: session.questions_asked,
          time_spent: timeSpent,
          entity_guessed: entity.name,
        });
      }

      return new Response(
        JSON.stringify({
          correct: isCorrect,
          entity: entity.name,
          description: entity.description,
          score: score,
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Endpoint not found" }),
      {
        status: 404,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

function generateInitialQuestions(attributes: any): string[] {
  const questions = [
    "Is this entity from Europe?",
    "Is this entity currently active/alive?",
    "Is this entity male?",
    "Is this entity known worldwide?",
    "Has this entity won major awards?",
  ];

  if (attributes.nationality) {
    questions.push("Is this person from South America?");
  }
  if (attributes.universe) {
    questions.push("Is this character from a superhero universe?");
  }
  if (attributes.game) {
    questions.push("Is this character from a Nintendo game?");
  }

  return questions.slice(0, 6);
}

function analyzeQuestion(question: string, attributes: any): boolean {
  const q = question.toLowerCase();
  
  if (q.includes("europe")) {
    return ["england", "spain", "france", "germany", "italy", "portugal"].some(
      (country) => attributes.nationality?.toLowerCase().includes(country)
    );
  }
  
  if (q.includes("south america")) {
    return ["argentina", "brazil", "uruguay", "chile"].some(
      (country) => attributes.nationality?.toLowerCase().includes(country)
    );
  }
  
  if (q.includes("male") || q.includes("man")) {
    return true;
  }
  
  if (q.includes("active") || q.includes("alive")) {
    return true;
  }
  
  if (q.includes("worldwide") || q.includes("famous")) {
    return true;
  }
  
  if (q.includes("award")) {
    return attributes.awards && attributes.awards.length > 0;
  }
  
  if (q.includes("forward")) {
    return attributes.position?.toLowerCase().includes("forward");
  }
  
  if (q.includes("midfielder")) {
    return attributes.position?.toLowerCase().includes("midfield");
  }
  
  if (q.includes("defender")) {
    return attributes.position?.toLowerCase().includes("defense");
  }
  
  if (q.includes("superhero") || q.includes("marvel") || q.includes("dc")) {
    return attributes.universe?.toLowerCase().includes("marvel") ||
           attributes.universe?.toLowerCase().includes("dc");
  }
  
  if (q.includes("nintendo")) {
    return attributes.company?.toLowerCase().includes("nintendo");
  }
  
  if (q.includes("villain") || q.includes("bad")) {
    return attributes.side?.toLowerCase().includes("dark") ||
           attributes.side?.toLowerCase().includes("villain");
  }

  return Math.random() > 0.5;
}

function generateContextualQuestions(
  attributes: any,
  conversation: any[],
  lastAnswer: boolean
): string[] {
  const questions: string[] = [];

  if (attributes.position && !conversation.some((c) => c.question.toLowerCase().includes("position"))) {
    questions.push(
      "Does this player play as a forward?",
      "Is this player a midfielder?",
      "Is this player a defender?"
    );
  }

  if (attributes.nationality && !conversation.some((c) => c.question.toLowerCase().includes("nationality"))) {
    questions.push(
      "Is this person from a European country?",
      "Is this person from South America?",
      "Is this person from North America?"
    );
  }

  if (attributes.current_team && !conversation.some((c) => c.question.toLowerCase().includes("team"))) {
    questions.push(
      "Does this player currently play in Europe?",
      "Does this player play in the Middle East?",
      "Has this player played for Real Madrid or Barcelona?"
    );
  }

  if (attributes.universe && !conversation.some((c) => c.question.toLowerCase().includes("universe"))) {
    questions.push(
      "Is this character from the Marvel universe?",
      "Is this character from DC Comics?",
      "Is this character a villain?"
    );
  }

  if (attributes.company && !conversation.some((c) => c.question.toLowerCase().includes("company"))) {
    questions.push(
      "Is this character from a Nintendo game?",
      "Is this character from a PlayStation exclusive?",
      "Is this character from an Xbox game?"
    );
  }

  questions.push(
    "Has this entity been around for more than 20 years?",
    "Is this entity associated with the color red?",
    "Is this entity known for a specific catchphrase?"
  );

  return questions.slice(0, 6);
}

function calculateScore(
  questionsAsked: number,
  timeSpent: number,
  difficulty: string
): number {
  const baseScore = difficulty === "easy" ? 1000 : difficulty === "medium" ? 1500 : 2000;
  const questionPenalty = questionsAsked * 50;
  const timePenalty = Math.floor(timeSpent / 10);
  const bonusMultiplier = questionsAsked <= 5 ? 1.5 : 1;

  return Math.max(100, Math.floor((baseScore - questionPenalty - timePenalty) * bonusMultiplier));
}