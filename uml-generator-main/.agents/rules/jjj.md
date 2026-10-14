---
trigger: always_on
---

## RULE 1 — CUT INTRO FLUFF

❌ Please could you help me with the following task if you don't mind:
✅ Do:

AI not need warm-up. Start with verb. Skip pleasantries.

---

## RULE 2 — NO REPEAT CONTEXT

❌ Paste same paragraph twice "just in case"  
✅ Say it once. AI remember within same message.

You repeat = AI eat double tokens = you pay double.

---

## RULE 3 — USE BULLETS NOT PARAGRAPHS

❌ I want you to first do X, and then after that is done you should move on to do Y, and finally Z  
✅
Do:
- X
- Y
- Z

Short list beat long sentence. Always.

---

## RULE 4 — KILL FILLER WORDS

Remove these words. They do nothing:

| ❌ Remove | ✅ Replace with |
|---|---|
| "basically" | (nothing) |
| "I was wondering if" | (nothing, just ask) |
| "As an AI language model" | (never write this) |
| "In the context of" | "In" |
| "Make sure to" | (nothing) |
| "Please note that" | (nothing) |
| "It is worth mentioning" | (nothing) |

---

## RULE 5 — SHRINK EXAMPLES

❌ Give 5 examples to explain one thing  
✅ Give 1 example. If AI smart, 1 enough.

---

## RULE 6 — USE CODE NOT PROSE FOR CODE TASKS

❌ Write me a function that takes a string and returns the reversed version of that string  
✅ fn reverseString(s: string) → string

Pseudocode or signature = AI understand immediately.

---

## RULE 7 — SAY OUTPUT FORMAT UPFRONT

❌ Let AI guess format, then ask it to redo  
✅ Start prompt with: Respond in JSON / bullet list / 1 sentence / table

Wrong format = regenerate = double tokens wasted.

---

## RULE 8 — TRIM SYSTEM PROMPT

System prompt run on EVERY message. It expensive.

- Remove rules that never trigger
- Merge duplicate rules
- Use short imperative sentences: "Never use emojis" not "You should avoid using emojis in any of your responses"

*1 token saved in system prompt = saved N times* (N = number of messages).

---

## RULE 9 — COMPRESS HISTORY WHEN CHATTING LONG

Long chat = AI read whole history every turn.

When convo get long:
1. Summarize old turns into 3-5 bullet facts
2. Drop raw history
3. Feed summary + new message

AI not need full transcript. AI need *facts*.

---

## RULE 10 — NO REDUNDANT CONSTRAINTS

❌ Write in English. Use English language. Make sure it is in English.  
✅ Write in English.

Once is enough. AI not deaf.

---

## RULE 11 — REFERENCE DON'T REPEAT

If you have a schema / spec / doc already in context:

❌ Paste full schema again in follow-up prompt  
✅ Use the schema above or Apply to User entity from the model

Point to thing. Don't copy thing.

---

## RULE 12 — SHORT NAMES IN PROMPTS

❌ The UserAuthenticationServiceImplementation class  
✅ AuthService

You control the names. Make them short.

---

## BONUS — CAVEMAN PROMPT TEMPLATE

ROLE: [one word or short phrase]
TASK: [verb + object]
INPUT: [what you're giving]
FORMAT: [how you want output]
CONSTRAINTS: [hard limits only]

That's it. No essay. No history lesson. No apologies.

---

**REMEMBER:** Every token = time + money. Caveman prompt = strong prompt. 🪨🔥