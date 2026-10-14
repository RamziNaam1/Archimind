import os
import torch
import argparse
from datasets import load_dataset
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    BitsAndBytesConfig,
    TrainingArguments,
    DataCollatorForSeq2Seq,
    EarlyStoppingCallback
)
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from trl import SFTTrainer

def main():
    # 1. Configuration & CLI Arguments
    parser = argparse.ArgumentParser(description="Fine-tune Llama 3 on Mermaid UML Dataset")
    parser.add_argument("--model_id", type=str, default="meta-llama/Meta-Llama-3-8B-Instruct", help="Base model ID")
    parser.add_argument("--dataset_path", type=str, default="../../uploads/llama3_uml_dataset.jsonl", help="Path to JSONL dataset")
    parser.add_argument("--output_dir", type=str, default="./llama3-mermaid-uml", help="Directory to save fine-tuned model")
    parser.add_argument("--epochs", type=int, default=5, help="Number of training epochs")
    parser.add_argument("--use_wandb", action="store_true", help="Enable Weights & Biases logging")
    args = parser.parse_args()

    MODEL_ID = args.model_id
    DATASET_PATH = args.dataset_path
    OUTPUT_DIR = args.output_dir

    # Verify dataset exists
    if not os.path.exists(DATASET_PATH):
        # Try local root path fallbacks
        fallbacks = [
            "../../../uploads/llama3_uml_dataset.jsonl",
            "uploads/llama3_uml_dataset.jsonl",
            "./uploads/llama3_uml_dataset.jsonl"
        ]
        found = False
        for fallback in fallbacks:
            if os.path.exists(fallback):
                DATASET_PATH = fallback
                found = True
                break
        if not found:
            raise FileNotFoundError(
                f"Dataset not found at target path. Please run the export-llama3 endpoint first."
            )

    print(f"Loading dataset from: {DATASET_PATH}")
    raw_dataset = load_dataset("json", data_files=DATASET_PATH, split="train")

    # Train/Test Split (90% train, 10% test)
    dataset_split = raw_dataset.train_test_split(test_size=0.1, seed=42)
    train_dataset = dataset_split["train"]
    eval_dataset = dataset_split["test"]
    print(f"Dataset split: {len(train_dataset)} training examples, {len(eval_dataset)} evaluation examples.")

    # 2. Tokenizer Configuration
    tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
    tokenizer.pad_token = tokenizer.eos_token
    tokenizer.padding_side = "right"

    # 3. Model Loading & 4-bit Quantization (QLoRA)
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.bfloat16,
        bnb_4bit_use_double_quant=True
    )

    print(f"Loading base model: {MODEL_ID}")
    model = AutoModelForCausalLM.from_pretrained(
        MODEL_ID,
        quantization_config=bnb_config,
        device_map="auto"
    )

    # Prepare model for PEFT
    model = prepare_model_for_kbit_training(model)

    # 4. LoRA Configuration
    peft_config = LoraConfig(
        r=16,
        lora_alpha=32,
        lora_dropout=0.05,
        bias="none",
        task_type="CAUSAL_LM",
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"]
    )
    model = get_peft_model(model, peft_config)
    model.print_trainable_parameters()

    # 5. Prompt Formatting (Llama 3 Instruct Template)
    def format_prompts(examples):
        texts = []
        for instruction, user_input, output in zip(examples['instruction'], examples['input'], examples['output']):
            text = (
                f"<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n"
                f"{instruction}<|eot_id|>"
                f"<|start_header_id|>user<|end_header_id|>\n\n"
                f"{user_input}<|eot_id|>"
                f"<|start_header_id|>assistant<|end_header_id|>\n\n"
                f"{output}<|eot_id|>"
            )
            texts.append(text)
        return {"text": texts}

    # Map prompt formatting function
    formatted_train = train_dataset.map(format_prompts, batched=True)
    formatted_eval = eval_dataset.map(format_prompts, batched=True)

    # 6. Wandb Setup
    report_to = "none"
    if args.use_wandb or os.environ.get("WANDB_API_KEY"):
        try:
            import wandb
            wandb.init(project="llama3-mermaid-uml", name="fine-tune-run")
            report_to = "wandb"
        except ImportError:
            print("wandb is not installed. Skipping Weights & Biases logging.")

    # 7. Training Arguments
    training_args = TrainingArguments(
        output_dir=OUTPUT_DIR,
        per_device_train_batch_size=2,
        gradient_accumulation_steps=4,
        learning_rate=2e-4,
        lr_scheduler_type="cosine",
        warmup_ratio=0.03,
        logging_steps=5,
        num_train_epochs=args.epochs,
        evaluation_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
        metric_for_best_model="eval_loss",
        greater_is_better=False,
        fp16=False,
        bf16=torch.cuda.is_bf16_supported() if torch.cuda.is_available() else False,
        optim="paged_adamw_8bit",
        report_to=report_to,
        logging_first_step=True
    )

    # 8. SFT Trainer Execution
    trainer = SFTTrainer(
        model=model,
        train_dataset=formatted_train,
        eval_dataset=formatted_eval,
        peft_config=peft_config,
        dataset_text_field="text",
        max_seq_length=512,
        tokenizer=tokenizer,
        args=training_args,
        data_collator=DataCollatorForSeq2Seq(tokenizer, pad_to_multiple_of=8, return_tensors="pt", padding=True),
        callbacks=[EarlyStoppingCallback(early_stopping_patience=2)]
    )

    print("Starting training...")
    trainer.train()

    # 9. Save Fine-Tuned Adapter
    print(f"Saving fine-tuned adapter to {OUTPUT_DIR}")
    trainer.model.save_pretrained(OUTPUT_DIR)
    tokenizer.save_pretrained(OUTPUT_DIR)
    print("Training complete!")

if __name__ == "__main__":
    main()
